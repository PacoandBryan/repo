#!/usr/bin/env python3
"""
Data Migration Script
Extracts catalog data from TypeScript frontend and populates PostgreSQL database
"""

import os
import sys
import json
import re
from datetime import datetime
from werkzeug.security import generate_password_hash

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app import create_app, db
from app.catalog_models import Category, Product, ProductImage, User

def extract_products_from_typescript():
    """Extract product data from TypeScript files"""
    
    # Read the CatalogPage.tsx file to extract product data
    catalog_file = os.path.join(os.path.dirname(__file__), '..', 'src', 'components', 'Catalog', 'CatalogPage.tsx')
    
    products = []
    current_product = {}
    
    with open(catalog_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract product data using regex patterns
    # This is a simplified approach - you might need to adjust based on actual file structure
    product_pattern = r'\{\s*id:\s*(\d+),\s*name:\s*t\([^)]+\),\s*price:\s*(\d+),\s*description:\s*t\([^)]+\),\s*image:\s*([^,]+),\s*artisan:\s*t\([^)]+\),\s*region:\s*t\([^)]+\),\s*technique:\s*t\([^)]+\),\s*category:\s*([^}]+)\s*\}'
    
    matches = re.findall(product_pattern, content, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        product_id, price, image_var, artisan_key, region_key, technique_key, category = match
        
        # Clean up the extracted data
        price = float(price)
        category = category.strip().strip('"').strip("'")
        
        # Generate SKU from category and ID
        sku = f"{category.lower().replace(' ', '-')}-{product_id}"
        
        # Generate slug
        slug = f"{category.lower().replace(' ', '-')}-product-{product_id}"
        
        products.append({
            'id': int(product_id),
            'title': f"Product {product_id}",  # Will be updated with actual translations
            'slug': slug,
            'description': f"Description for product {product_id}",
            'price': price,
            'sku': sku,
            'category': category,
            'image_var': image_var.strip(),
            'artisan_key': artisan_key,
            'region_key': region_key,
            'technique_key': technique_key
        })
    
    return products

def get_translation_data():
    """Extract translation data from i18n files"""
    
    translations = {}
    
    # Read English translations
    en_file = os.path.join(os.path.dirname(__file__), '..', 'src', 'i18n', 'locales', 'en.ts')
    
    if os.path.exists(en_file):
        with open(en_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract product names and descriptions
        # This is a simplified regex - you may need to adjust
        name_pattern = r'purse(\d+)\.name[\'"]\s*:\s*[\'"]([^\'"]+)[\'"]'
        desc_pattern = r'purse(\d+)\.description[\'"]\s*:\s*[\'"]([^\'"]+)[\'"]'
        artisan_pattern = r'purse(\d+)\.artisan[\'"]\s*:\s*[\'"]([^\'"]+)[\'"]'
        region_pattern = r'purse(\d+)\.region[\'"]\s*:\s*[\'"]([^\'"]+)[\'"]'
        technique_pattern = r'purse(\d+)\.technique[\'"]\s*:\s*[\'"]([^\'"]+)[\'"]'
        
        translations['en'] = {
            'names': dict(re.findall(name_pattern, content)),
            'descriptions': dict(re.findall(desc_pattern, content)),
            'artisans': dict(re.findall(artisan_pattern, content)),
            'regions': dict(re.findall(region_pattern, content)),
            'techniques': dict(re.findall(technique_pattern, content))
        }
    
    # Read Spanish translations
    es_file = os.path.join(os.path.dirname(__file__), '..', 'src', 'i18n', 'locales', 'es.ts')
    
    if os.path.exists(es_file):
        with open(es_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        translations['es'] = {
            'names': dict(re.findall(name_pattern, content)),
            'descriptions': dict(re.findall(desc_pattern, content)),
            'artisans': dict(re.findall(artisan_pattern, content)),
            'regions': dict(re.findall(region_pattern, content)),
            'techniques': dict(re.findall(technique_pattern, content))
        }
    
    return translations

def create_sample_data():
    """Create sample data based on the catalog structure"""
    
    app = create_app()
    
    with app.app_context():
        print("Creating sample data...")
        
        # Ensure admin user exists
        if not User.query.filter_by(username='admin').first():
            admin_user = User(username='admin')
            admin_user.set_password('dikythnks')
            db.session.add(admin_user)
            print("Created admin user")
        
        # Create categories
        categories_data = [
            {
                'name': 'Bolsos',
                'slug': 'bolsos',
                'description': 'Handcrafted traditional Mexican bags and purses',
                'display_order': 1,
                'level': 0
            },
            {
                'name': 'Peluche',
                'slug': 'peluche',
                'description': 'Handcrafted plush toys and decorative items',
                'display_order': 2,
                'level': 0
            },
            {
                'name': 'Chocolate',
                'slug': 'chocolate',
                'description': 'Artisanal chocolate and sweets',
                'display_order': 3,
                'level': 0
            },
            {
                'name': 'Pasteles',
                'slug': 'pasteles',
                'description': 'Custom cakes and baked goods',
                'display_order': 4,
                'level': 0
            }
        ]
        
        category_map = {}
        for cat_data in categories_data:
            category = Category.query.filter_by(slug=cat_data['slug']).first()
            if not category:
                category = Category(**cat_data)
                db.session.add(category)
                print(f"Created category: {cat_data['name']}")
            category_map[cat_data['slug']] = category
        
        # Commit categories first
        db.session.commit()
        
        # Create products based on the TypeScript catalog
        products_data = [
            {
                'title': 'Bolso Tradicional',
                'slug': 'bolso-tradicional-1',
                'description': 'Beautiful handcrafted traditional Mexican bag with intricate embroidery',
                'price': 1950.00,
                'sku': 'BOL-001',
                'category_slug': 'bolsos'
            },
            {
                'title': 'Bolso Elegante',
                'slug': 'bolso-elegante-2',
                'description': 'Elegant handbag with modern design and traditional craftsmanship',
                'price': 2800.00,
                'sku': 'BOL-002',
                'category_slug': 'bolsos'
            },
            {
                'title': 'Bolso Casual',
                'slug': 'bolso-casual-3',
                'description': 'Casual everyday bag with comfortable strap and practical design',
                'price': 1200.00,
                'sku': 'BOL-003',
                'category_slug': 'bolsos'
            },
            {
                'title': 'Peluche Oso',
                'slug': 'peluche-oso-4',
                'description': 'Cute handmade teddy bear, perfect as a gift',
                'price': 2100.00,
                'sku': 'PEL-001',
                'category_slug': 'peluche'
            },
            {
                'title': 'Peluche Conejo',
                'slug': 'peluche-conejo-5',
                'description': 'Adorable rabbit plush toy with soft fur',
                'price': 3200.00,
                'sku': 'PEL-002',
                'category_slug': 'peluche'
            },
            {
                'title': 'Trufas Artisanales',
                'slug': 'trufas-artisanales-6',
                'description': 'Premium chocolate truffles with traditional Mexican flavors',
                'price': 180.00,
                'sku': 'CHO-001',
                'category_slug': 'chocolate'
            }
        ]
        
        for prod_data in products_data:
            # Check if product already exists
            existing = Product.query.filter_by(slug=prod_data['slug']).first()
            if existing:
                print(f"Product already exists: {prod_data['title']}")
                continue
            
            # Get category
            category = category_map.get(prod_data['category_slug'])
            if not category:
                print(f"Category not found: {prod_data['category_slug']}")
                continue
            
            # Create product
            product = Product(
                title=prod_data['title'],
                slug=prod_data['slug'],
                description=prod_data['description'],
                price=prod_data['price'],
                sku=prod_data['sku'],
                category_id=category.id,
                inventory=10,  # Default inventory
                featured=False
            )
            
            db.session.add(product)
            print(f"Created product: {prod_data['title']}")
        
        # Commit all changes
        db.session.commit()
        print("Sample data creation completed!")

def main():
    """Main migration function"""
    
    print("Starting data migration...")
    
    # Create the database and tables
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created")
        
        # Create sample data
        create_sample_data()
        
        print("Migration completed successfully!")

if __name__ == '__main__':
    main()
