from flask import Blueprint, render_template, request, abort
from app.catalog_models import Product, Category

public_catalog_bp = Blueprint('public_catalog', __name__)


@public_catalog_bp.route('/')
def public_home():
    """Display home page with featured products and categories"""
    # Get featured products
    featured_products = Product.query.filter_by(
        is_active=True, 
        featured=True
    ).order_by(Product.created_at.desc()).limit(8).all()
    
    # Get all active categories
    categories = Category.query.filter_by(is_active=True).order_by(Category.display_order.asc()).all()
    
    return render_template('public_catalog.html', 
                         products=featured_products, 
                         categories=categories,
                         page_title='Home')


@public_catalog_bp.route('/catalog')
def public_catalog():
    """Display full catalog with filtering options"""
    # Get filter parameters
    category_id = request.args.get('category', type=int)
    featured = request.args.get('featured')
    
    # Build query
    query = Product.query.filter_by(is_active=True)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if featured == 'true':
        query = query.filter_by(featured=True)
    
    products = query.order_by(Product.created_at.desc()).all()
    
    # Get all active categories for filter sidebar
    categories = Category.query.filter_by(is_active=True).order_by(Category.display_order.asc()).all()
    
    return render_template('public_catalog.html', 
                         products=products, 
                         categories=categories,
                         selected_category=category_id,
                         page_title='Catalog')


@public_catalog_bp.route('/category/<slug>')
def public_category(slug):
    """Display products for a specific category"""
    category = Category.query.filter_by(slug=slug, is_active=True).first_or_404()
    
    products = Product.query.filter_by(
        category_id=category.id, 
        is_active=True
    ).order_by(Product.created_at.desc()).all()
    
    # Get all active categories for navigation
    categories = Category.query.filter_by(is_active=True).order_by(Category.display_order.asc()).all()
    
    return render_template('public_catalog.html', 
                         products=products, 
                         categories=categories,
                         selected_category=category.id,
                         current_category=category,
                         page_title=category.name)


@public_catalog_bp.route('/product/<slug>')
def public_product(slug):
    """Display individual product details"""
    product = Product.query.filter_by(slug=slug, is_active=True).first_or_404()
    
    # Get related products from same category
    related_products = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.is_active == True
    ).order_by(Product.created_at.desc()).limit(4).all()
    
    return render_template('product_detail.html', 
                         product=product, 
                         related_products=related_products)
