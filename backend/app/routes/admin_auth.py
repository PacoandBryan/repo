from flask import Blueprint, request, redirect, jsonify, render_template, url_for, session
from flask_login import login_user, logout_user, login_required
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.catalog_models import User, db
import datetime

# Flask-Admin login/logout views
admin_bp = Blueprint('admin_auth', __name__, url_prefix='/admin')


@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    error = False
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            # Make session permanent
            session.permanent = True
            login_user(user)
            next_page = request.args.get('next') or url_for('admin_auth.dashboard')
            return redirect(next_page)
        else:
            error = True

    return render_template('admin_login.html', error=error)


@admin_bp.route('/test')
def test():
    return {"message": "Flask is working!", "timestamp": str(datetime.datetime.now())}


@admin_bp.route('/dashboard')
@login_required
def dashboard():
    # Get comprehensive stats from PostgreSQL database
    from app.catalog_models import Product, Category
    
    stats = {
        'products_total': Product.query.count(),
        'products_active': Product.query.filter_by(is_active=True).count(),
        'categories_total': Category.query.count(),
        'categories_active': Category.query.filter_by(is_active=True).count(),
        'latest_title': 'No products yet',
        'total_inventory': 0
    }
    
    # Get latest product if available
    latest = Product.query.order_by(Product.id.desc()).first()
    if latest:
        stats['latest_title'] = latest.title[:30] + ('...' if len(latest.title) > 30 else '')
    
    # Calculate total inventory
    total_inventory = db.session.query(db.func.sum(Product.inventory)).scalar() or 0
    stats['total_inventory'] = int(total_inventory)
    
    # Get recent products with category information
    recent_products = Product.query.order_by(Product.id.desc()).limit(4).all()
    
    # Get categories for display
    categories = Category.query.order_by(Category.display_order).all()
    
    return render_template('admin_dashboard.html',
                         stats=stats,
                         recent_products=recent_products,
                         categories=categories)


@admin_bp.route('/products')
@login_required
def products():
    # Get all products with category information
    from app.catalog_models import Product, Category
    
    products_list = db.session.query(Product, Category).join(Category).order_by(Product.id.desc()).all()
    categories_list = Category.query.order_by(Category.display_order).all()
    
    return render_template('admin_products.html', products=products_list, categories=categories_list)


@admin_bp.route('/products/api/create', methods=['POST'])
@login_required
def api_create_product():
    """API endpoint to create a new product"""
    try:
        from app.catalog_models import Product, Category
        from app.utils.product_validation import generate_product_slug
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'price', 'category_id', 'sku']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'{field} is required'}), 400
        
        # Check if category exists
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({'success': False, 'message': 'Invalid category'}), 400
        
        # Check if SKU already exists
        if Product.query.filter_by(sku=data['sku']).first():
            return jsonify({'success': False, 'message': 'SKU already exists'}), 400
        
        # Generate slug
        slug = generate_product_slug(data['title'])
        if Product.query.filter_by(slug=slug).first():
            slug = f"{slug}-{int(datetime.datetime.now().timestamp())}"
        
        # Create product
        product = Product(
            title=data['title'],
            slug=slug,
            description=data.get('description', ''),
            price=float(data['price']),
            sku=data['sku'],
            category_id=data['category_id'],
            inventory=int(data.get('inventory', 0)),
            is_active=data.get('is_active', True),
            image_url=data.get('image_url')  # Handle image if provided
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Product created successfully',
            'product_id': product.id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/products/api/update/<int:product_id>', methods=['PUT'])
@login_required
def api_update_product(product_id):
    """API endpoint to update an existing product"""
    try:
        from app.catalog_models import Product, Category
        from app.utils.product_validation import generate_product_slug
        
        data = request.get_json()
        
        # Get product
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'success': False, 'message': 'Product not found'}), 404
        
        # Validate required fields
        required_fields = ['title', 'price', 'category_id', 'sku']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'{field} is required'}), 400
        
        # Check if category exists
        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({'success': False, 'message': 'Invalid category'}), 400
        
        # Check if SKU already exists (excluding current product)
        existing_sku = Product.query.filter(Product.sku == data['sku'], Product.id != product_id).first()
        if existing_sku:
            return jsonify({'success': False, 'message': 'SKU already exists'}), 400
        
        # Update product fields
        product.title = data['title']
        product.description = data.get('description', '')
        product.price = float(data['price'])
        product.sku = data['sku']
        product.category_id = data['category_id']
        product.inventory = int(data.get('inventory', 0))
        product.is_active = data.get('is_active', True)
        
        # Update slug if title changed
        if data['title'] != product.title:
            slug = generate_product_slug(data['title'])
            # Check if slug already exists (excluding current product)
            existing_slug = Product.query.filter(Product.slug == slug, Product.id != product_id).first()
            if existing_slug:
                slug = f"{slug}-{int(datetime.datetime.now().timestamp())}"
            product.slug = slug
        
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Product updated successfully',
            'product_id': product.id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/products/api/delete/<int:product_id>', methods=['DELETE'])
@login_required
def api_delete_product(product_id):
    """API endpoint to delete a product"""
    try:
        from app.catalog_models import Product
        
        # Get product
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'success': False, 'message': 'Product not found'}), 404
        
        # Store product name for response
        product_name = product.title
        
        # Delete product
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': f'Product "{product_name}" deleted successfully',
            'product_id': product_id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/categories')
@login_required
def categories():
    # Get all categories from PostgreSQL database
    from app.catalog_models import Category
    
    categories_list = Category.query.order_by(Category.display_order).all()
    
    return render_template('admin_categories.html', categories=categories_list)


@admin_bp.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    if request.headers.get('Content-Type') == 'application/json' or request.args.get('format') == 'json':
        return jsonify({'authenticated': False, 'message': 'Logged out successfully'})
    return redirect('/')


# JSON API login used by the existing frontend
admin_api_bp = Blueprint('admin_api', __name__, url_prefix='/api/admin')


@admin_api_bp.route('/auth', methods=['POST'])
def api_admin_login():
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Authenticate against the single admin user stored as username 'admin'
    user = User.query.filter_by(username='admin').first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(identity=email or user.username)
    return jsonify({'access_token': token, 'email': email or 'admin@example.com'}), 200


@admin_api_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    current = get_jwt_identity()
    return jsonify({'valid': True, 'user': current}), 200
