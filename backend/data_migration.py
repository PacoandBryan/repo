#!/usr/bin/env python3
"""
Data Migration Script
Extracts catalog data from TypeScript frontend and populates PostgreSQL database.
Handles images and translations.
"""

import os
import sys
import re
import shutil
from datetime import datetime
from decimal import Decimal

# Add the backend root and app directory to Python path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, os.path.join(BACKEND_DIR, 'app'))

from app import create_app, db
from app.catalog_models import Category, Product, ProductImage, User

def get_image_mapping(tsx_content):
    """Map variable names in TSX to actual filenames from import statements."""
    # Updated pattern to handle ../../../assets/ correctly
    import_pattern = r"import\s+(\w+)\s+from\s+'(?:\.\./)+assets/([^']+)';"
    imports = re.findall(import_pattern, tsx_content)
    return {var: filename for var, filename in imports}

def get_translations():
    """Extract translations from locales."""
    locales_dir = os.path.join(BACKEND_DIR, '..', 'src', 'i18n', 'locales')
    translations = {'en': {}, 'es': {}}
    
    for lang in ['en', 'es']:
        path = os.path.join(locales_dir, f'{lang}.ts')
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Match any key that has a name field inside its object
        # e.g. purse1: { name: "...", ... }
        pattern = r"(\w+)\s*:\s*\{[^{}]*?name\s*:\s*['\"]([^'\"]+)['\"]"
        matches = re.findall(pattern, content, re.DOTALL)
        for key, name in matches:
            translations[lang][f"{key}.name"] = name
            
        # Match description too
        desc_pattern = r"(\w+)\s*:\s*\{[^{}]*?description\s*:\s*['\"]([^'\"]+)['\"]"
        desc_matches = re.findall(desc_pattern, content, re.DOTALL)
        for key, desc in desc_matches:
            translations[lang][f"{key}.description"] = desc
            
        # Flat keys
        pattern = r"['\"]?([\w.]+)['\"]?\s*:\s*['\"]([^'\"]+)['\"]"
        flat_matches = re.findall(pattern, content)
        for k, v in flat_matches:
            if k not in translations[lang]:
                translations[lang][k] = v
        
    return translations

def migrate():
    """Main migration logic."""
    app = create_app()
    with app.app_context():
        # 1. Ensure Database is Ready
        db.create_all()
        print("Database tables ensured.")

        # 2. Setup Assets path
        assets_dir = os.path.join(BACKEND_DIR, '..', 'assets')
        uploads_dir = app.config.get('UPLOADS_FOLDER', os.path.join(BACKEND_DIR, 'uploads'))
        os.makedirs(uploads_dir, exist_ok=True)

        # 3. Read CatalogPage.tsx
        catalog_path = os.path.join(BACKEND_DIR, '..', 'src', 'components', 'Catalog', 'CatalogPage.tsx')
        with open(catalog_path, 'r', encoding='utf-8') as f:
            tsx_content = f.read()

        image_map = get_image_mapping(tsx_content)
        translations = get_translations()

        # 4. Extract Products
        products_match = re.search(r'const\s+products:\s+Product\[\]\s*=\s*\[(.*?)\];', tsx_content, re.DOTALL)
        if not products_match:
            print("Could not find products array in TSX.")
            return

        products_data_raw = products_match.group(1)
        product_blocks = re.findall(r'\{(.*?)\}', products_data_raw, re.DOTALL)
        
        print(f"Found {len(product_blocks)} product blocks.")

        # 5. Create Default Categories
        categories = {
            'Bolsos': 'bolsos',
            'Peluche': 'peluche',
            'Chocolate': 'chocolate',
            'Pasteles': 'pasteles'
        }
        cat_obj_map = {}
        for name, slug in categories.items():
            cat = Category.query.filter_by(slug=slug).first()
            if not cat:
                cat = Category(name=name, slug=slug, is_active=True)
                db.session.add(cat)
            cat_obj_map[name] = cat
        db.session.commit()

        # 6. Process Products
        for block in product_blocks:
            id_m = re.search(r'id:\s*(\d+)', block)
            name_m = re.search(r"name:\s*t\(['\"]([^'\"]+)['\"]\)", block)
            price_m = re.search(r'price:\s*(\d+)', block)
            desc_m = re.search(r"description:\s*t\(['\"]([^'\"]+)['\"]\)", block)
            image_m = re.search(r'image:\s*(\w+)', block)
            category_m = re.search(r"(?:category:\s*t\(['\"]([^'\"]+)['\"]\)|\s*category:\s*['\"]([^'\"]+)['\"])", block)

            if not id_m or not name_m:
                continue

            pid = id_m.group(1)
            name_full_key = name_m.group(1)
            parts = name_full_key.split('.')
            short_key = f"{parts[-2]}.{parts[-1]}" if len(parts) >= 2 else name_full_key

            desc_full_key = desc_m.group(1) if desc_m else ""
            desc_parts = desc_full_key.split('.')
            short_desc_key = f"{desc_parts[-2]}.{desc_parts[-1]}" if len(desc_parts) >= 2 else desc_full_key

            price = price_m.group(1) if price_m else "0"
            image_var = image_m.group(1) if image_m else ""
            
            # Map category
            cat_val = category_m.group(1) or category_m.group(2) if category_m else "Bolsos"
            cat_name = translations['es'].get(cat_val) or translations['en'].get(cat_val) or cat_val
            if 'purse' in cat_name.lower() or 'bolso' in cat_name.lower(): cat_name = 'Bolsos'
            elif 'peluche' in cat_name.lower(): cat_name = 'Peluche'
            elif 'chocolate' in cat_name.lower(): cat_name = 'Chocolate'
            
            category = cat_obj_map.get(cat_name, cat_obj_map['Bolsos'])

            title = translations['es'].get(short_key) or translations['en'].get(short_key) or f"Product {pid}"
            description = translations['es'].get(short_desc_key) or translations['en'].get(short_desc_key) or ""
            
            slug = f"{category.slug}-{pid}"
            sku = f"{category.slug[:3].upper()}-{pid:03}"

            image_filename = image_map.get(image_var, "")
            image_data = None
            if image_filename:
                src_path = os.path.join(assets_dir, image_filename)
                if os.path.exists(src_path):
                    shutil.copy(src_path, os.path.join(uploads_dir, image_filename))
                    with open(src_path, 'rb') as f:
                        image_data = f.read()

            product = Product.query.filter_by(slug=slug).first()
            if not product:
                product = Product(
                    title=title,
                    slug=slug,
                    description=description,
                    price=Decimal(price),
                    sku=sku,
                    category_id=category.id,
                    image_filename=image_filename,
                    image_url=f"/uploads/{image_filename}" if image_filename else None,
                    image_data=image_data,
                    is_active=True
                )
                db.session.add(product)
                print(f"Added product: {title}")
            else:
                product.title = title
                product.description = description
                product.price = Decimal(price)
                product.image_filename = image_filename
                product.image_url = f"/uploads/{image_filename}" if image_filename else None
                product.image_data = image_data
                print(f"Updated product: {title}")

        db.session.commit()
        print("Migration finished!")

if __name__ == "__main__":
    migrate()
