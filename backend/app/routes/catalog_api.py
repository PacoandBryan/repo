from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.catalog_models import Product, Category, ProductImage, Promotion, db
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

# API Blueprint for catalog data
catalog_api_bp = Blueprint('catalog_api', __name__, url_prefix='/api/catalog')


@catalog_api_bp.route('/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    
    # Query parameters
    category_slug = request.args.get('category')
    search = request.args.get('search')
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int, default=0)
    featured = request.args.get('featured', type=bool)
    
    # Build query
    query = db.session.query(Product, Category).join(Category).options(joinedload(Product.promotions)).filter(Product.is_active == True)
    
    # Apply filters
    if category_slug:
        query = query.filter(Category.slug == category_slug)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.title.ilike(search_term),
                Product.description.ilike(search_term),
                Product.sku.ilike(search_term)
            )
        )
    
    if featured:
        query = query.filter(Product.featured == True)
    
    # Apply pagination
    if limit:
        query = query.limit(limit).offset(offset)
    
    # Execute query
    products_data = query.all()
    
    # Format response
    products = []
    for product, category in products_data:
        promo = product.active_promotion
        price = float(product.price)
        sale_price = product.effective_price()
        
        product_dict = {
            'id': product.id,
            'title': product.title,
            'slug': product.slug,
            'description': product.description,
            'price': price,
            'sale_price': sale_price if sale_price < price else None,
            'sku': product.sku,
            'image_url': product.image_url,
            'inventory': product.inventory,
            'featured': product.featured,
            'category': {
                'id': category.id,
                'name': category.name,
                'slug': category.slug
            },
            'promotion': {
                'id': promo.id,
                'label': promo.label,
                'discount_type': promo.discount_type,
                'discount_value': float(promo.discount_value),
                'ends_at': promo.ends_at.isoformat() if promo.ends_at else None,
            } if promo else None,
            'created_at': product.created_at.isoformat() if product.created_at else None
        }
        products.append(product_dict)
    
    return jsonify({
        'products': products,
        'total': len(products)
    })


@catalog_api_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    
    product_data = db.session.query(Product, Category).join(Category).options(joinedload(Product.promotions)).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()
    
    if not product_data:
        return jsonify({'error': 'Product not found'}), 404
    
    product, category = product_data
    promo = product.active_promotion
    
    # Get product images
    images = ProductImage.query.filter_by(product_id=product_id).order_by(ProductImage.sort_order).all()
    
    product_dict = {
        'id': product.id,
        'title': product.title,
        'slug': product.slug,
        'description': product.description,
        'price': float(product.price),
        'sale_price': product.effective_price() if product.effective_price() < float(product.price) else None,
        'sku': product.sku,
        'image_url': product.image_url,
        'inventory': product.inventory,
        'featured': product.featured,
        'category': {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description
        },
        'promotion': {
            'id': promo.id,
            'label': promo.label,
            'discount_type': promo.discount_type,
            'discount_value': float(promo.discount_value),
            'ends_at': promo.ends_at.isoformat() if promo.ends_at else None,
        } if promo else None,
        'images': [
            {
                'id': img.id,
                'url': img.url,
                'alt_text': img.alt_text,
                'is_primary': img.is_primary
            }
            for img in images
        ],
        'created_at': product.created_at.isoformat() if product.created_at else None,
        'updated_at': product.updated_at.isoformat() if product.updated_at else None
    }
    
    return jsonify(product_dict)


@catalog_api_bp.route('/promotions', methods=['GET'])
def get_active_promotions():
    """Get all currently active promotions (public endpoint)"""
    from datetime import datetime
    now = datetime.utcnow()
    
    promotions = Promotion.query.filter_by(is_active=True).all()
    active = []
    for promo in promotions:
        if promo.starts_at and promo.starts_at > now:
            continue
        if promo.ends_at and promo.ends_at < now:
            continue
        product = Product.query.get(promo.product_id)
        active.append({
            'id': promo.id,
            'product_id': promo.product_id,
            'product_title': product.title if product else None,
            'label': promo.label,
            'discount_type': promo.discount_type,
            'discount_value': float(promo.discount_value),
            'starts_at': promo.starts_at.isoformat() if promo.starts_at else None,
            'ends_at': promo.ends_at.isoformat() if promo.ends_at else None,
        })
    
    return jsonify({'promotions': active, 'total': len(active)})


@catalog_api_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
    
    categories = Category.query.filter_by(is_active=True).order_by(Category.display_order).all()
    
    categories_data = []
    for category in categories:
        # Count products in this category
        product_count = Product.query.filter_by(category_id=category.id, is_active=True).count()
        
        category_dict = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'image_url': category.image_url,
            'icon': category.icon,
            'product_count': product_count,
            'parent_id': category.parent_id,
            'level': category.level
        }
        categories_data.append(category_dict)
    
    return jsonify({
        'categories': categories_data,
        'total': len(categories_data)
    })


@catalog_api_bp.route('/categories/<slug>', methods=['GET'])
def get_category(slug):
    """Get a single category by slug"""
    
    category = Category.query.filter_by(slug=slug, is_active=True).first()
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Get products in this category
    products = Product.query.filter_by(category_id=category.id, is_active=True).order_by(Product.created_at.desc()).all()
    
    products_data = []
    for product in products:
        product_dict = {
            'id': product.id,
            'title': product.title,
            'slug': product.slug,
            'description': product.description,
            'price': float(product.price),
            'sale_price': product.effective_price() if product.effective_price() < float(product.price) else None,
            'sku': product.sku,
            'image_url': product.image_url,
            'inventory': product.inventory,
            'featured': product.featured
        }
        products_data.append(product_dict)
    
    category_dict = {
        'id': category.id,
        'name': category.name,
        'slug': category.slug,
        'description': category.description,
        'image_url': category.image_url,
        'icon': category.icon,
        'parent_id': category.parent_id,
        'level': category.level,
        'products': products_data,
        'product_count': len(products_data)
    }
    
    return jsonify(category_dict)


@catalog_api_bp.route('/search', methods=['GET'])
def search_catalog():
    """Search products and categories"""
    
    query = request.args.get('q', '')
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    search_term = f"%{query}%"
    
    # Search products
    products = db.session.query(Product, Category).join(Category).filter(
        Product.is_active == True,
        or_(
            Product.title.ilike(search_term),
            Product.description.ilike(search_term),
            Product.sku.ilike(search_term)
        )
    ).limit(20).all()
    
    # Search categories
    categories = Category.query.filter(
        Category.is_active == True,
        or_(
            Category.name.ilike(search_term),
            Category.description.ilike(search_term)
        )
    ).limit(10).all()
    
    # Format results
    products_data = []
    for product, category in products:
        product_dict = {
            'id': product.id,
            'title': product.title,
            'slug': product.slug,
            'description': product.description,
            'price': float(product.price),
            'sale_price': product.effective_price() if product.effective_price() < float(product.price) else None,
            'image_url': product.image_url,
            'category': {
                'id': category.id,
                'name': category.name,
                'slug': category.slug
            }
        }
        products_data.append(product_dict)
    
    categories_data = []
    for category in categories:
        product_count = Product.query.filter_by(category_id=category.id, is_active=True).count()
        
        category_dict = {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'image_url': category.image_url,
            'product_count': product_count
        }
        categories_data.append(category_dict)
    
    return jsonify({
        'products': products_data,
        'categories': categories_data,
        'query': query
    })


@catalog_api_bp.route('/stats', methods=['GET'])
def get_catalog_stats():
    """Get catalog statistics"""
    
    total_products = Product.query.filter_by(is_active=True).count()
    total_categories = Category.query.filter_by(is_active=True).count()
    featured_products = Product.query.filter_by(is_active=True, featured=True).count()
    
    # Calculate total inventory value
    total_inventory = db.session.query(db.func.sum(Product.inventory)).filter(Product.is_active == True).scalar() or 0
    total_value = db.session.query(db.func.sum(Product.price * Product.inventory)).filter(Product.is_active == True).scalar() or 0
    
    return jsonify({
        'total_products': total_products,
        'total_categories': total_categories,
        'featured_products': featured_products,
        'total_inventory_items': int(total_inventory),
        'total_inventory_value': float(total_value)
    })
