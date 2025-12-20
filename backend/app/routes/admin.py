import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    jwt_required, create_access_token, get_jwt_identity
)
from werkzeug.utils import secure_filename
from ..catalog_models import db, Product, Category, ProductImage, User

admin_bp = Blueprint('catalog_admin', __name__, url_prefix='/api/admin')

# Admin authentication
@admin_bp.route('/auth', methods=['POST'])
def admin_login():
    """Admin login to get JWT token."""
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Find user by username
    user = User.query.filter_by(username=username).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create and return JWT token
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

# Token validation endpoint
@admin_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    """Endpoint to validate if a token is still valid"""
    current_user = get_jwt_identity()
    return jsonify({'valid': True, 'user': current_user}), 200

# Subscriber management (stub)
@admin_bp.route('/subscribers', methods=['GET'])
@jwt_required()
def get_subscribers():
    """Get all subscribers (stub implementation)."""
    return jsonify({
        'subscribers': [],
        'total': 0,
        'limit': int(request.args.get('limit', 100)),
        'skip': int(request.args.get('skip', 0))
    }), 200


# Newsletter management (stub)
@admin_bp.route('/newsletters', methods=['GET'])
@jwt_required()
def get_newsletters():
    """Get all newsletters (stub implementation)."""
    return jsonify({
        'newsletters': [],
        'total': 0,
        'limit': int(request.args.get('limit', 100)),
        'skip': int(request.args.get('skip', 0))
    }), 200


@admin_bp.route('/newsletters', methods=['POST'])
@jwt_required()
def create_newsletter():
    """Create a new newsletter."""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    title = data.get('title')
    content = data.get('content')
    topic = data.get('topic')
    
    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400
        
    admin_email = get_jwt_identity()
    
    db = get_db()
    newsletter = Newsletter.create(db, title, content, admin_email, topic)
    
    return jsonify({'newsletter': newsletter}), 201


@admin_bp.route('/newsletters/<newsletter_id>', methods=['GET'])
@jwt_required()
def get_newsletter(newsletter_id):
    """Get a specific newsletter by ID."""
    db = get_db()
    newsletter = Newsletter.get_by_id(db, newsletter_id)
    
    if not newsletter:
        return jsonify({'error': 'Newsletter not found'}), 404
        
    return jsonify({'newsletter': newsletter}), 200


@admin_bp.route('/newsletters/<newsletter_id>', methods=['PUT'])
@jwt_required()
def update_newsletter(newsletter_id):
    """Update a newsletter."""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    title = data.get('title')
    content = data.get('content')
    topic = data.get('topic')
    
    db = get_db()
    success = Newsletter.update(db, newsletter_id, title, content, topic)
    
    if not success:
        return jsonify({'error': 'Newsletter update failed'}), 400
        
    newsletter = Newsletter.get_by_id(db, newsletter_id)
    
    return jsonify({'newsletter': newsletter}), 200


@admin_bp.route('/newsletters/<newsletter_id>', methods=['DELETE'])
@jwt_required()
def delete_newsletter(newsletter_id):
    """Delete a newsletter."""
    db = get_db()
    success = Newsletter.delete(db, newsletter_id)
    
    if not success:
        return jsonify({'error': 'Newsletter deletion failed'}), 400
        
    return jsonify({'message': 'Newsletter deleted successfully'}), 200


@admin_bp.route('/newsletters/test', methods=['POST'])
@jwt_required()
def test_newsletter():
    """Send a test newsletter email."""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    newsletter_id = data.get('newsletterId')
    email = data.get('email')
    
    if not newsletter_id or not email:
        return jsonify({'error': 'Newsletter ID and email are required'}), 400
        
    db = get_db()
    newsletter = Newsletter.get_by_id(db, newsletter_id)
    
    if not newsletter:
        return jsonify({'error': 'Newsletter not found'}), 404
        
    # Send test email
    result = send_test_email(newsletter, email)
    
    if not result.get('success'):
        return jsonify({'error': result.get('message', 'Failed to send test email')}), 400
        
    return jsonify({'message': 'Test email sent successfully'}), 200


# Campaign management
@admin_bp.route('/campaigns', methods=['GET'])
@jwt_required()
def get_campaigns():
    """Get all campaigns with optional filtering."""
    status = request.args.get('status')
    limit = int(request.args.get('limit', 100))
    skip = int(request.args.get('skip', 0))
    
    db = get_db()
    campaigns = Campaign.get_all(db, status=status, limit=limit, skip=skip)
    
    return jsonify({'campaigns': campaigns}), 200


@admin_bp.route('/campaigns', methods=['POST'])
@jwt_required()
def create_campaign():
    """Create a new campaign."""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    name = data.get('name')
    newsletter_id = data.get('newsletterId')
    target_audience = data.get('targetAudience')
    scheduled_date = data.get('scheduledDate')
    batching_config = data.get('batchingConfig')
    
    if not name or not newsletter_id:
        return jsonify({'error': 'Name and newsletterId are required'}), 400
        
    admin_email = get_jwt_identity()
    
    db = get_db()
    campaign = Campaign.create(
        db, name, newsletter_id, admin_email, 
        target_audience, scheduled_date, batching_config
    )
    
    if not campaign:
        return jsonify({'error': 'Campaign creation failed'}), 400
        
    return jsonify({'campaign': campaign}), 201


@admin_bp.route('/campaigns/<campaign_id>', methods=['GET'])
@jwt_required()
def get_campaign(campaign_id):
    """Get a specific campaign by ID."""
    db = get_db()
    campaign = Campaign.get_by_id(db, campaign_id)
    
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
        
    return jsonify({'campaign': campaign}), 200


@admin_bp.route('/campaigns/<campaign_id>', methods=['PUT'])
@jwt_required()
def update_campaign(campaign_id):
    """Update a campaign."""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    name = data.get('name')
    target_audience = data.get('targetAudience')
    scheduled_date = data.get('scheduledDate')
    batching_config = data.get('batchingConfig')
    
    db = get_db()
    success = Campaign.update(
        db, campaign_id, name, target_audience, 
        scheduled_date, batching_config
    )
    
    if not success:
        return jsonify({'error': 'Campaign update failed. Only draft campaigns can be updated.'}), 400
        
    campaign = Campaign.get_by_id(db, campaign_id)
    
    return jsonify({'campaign': campaign}), 200


@admin_bp.route('/campaigns/<campaign_id>', methods=['DELETE'])
@jwt_required()
def delete_campaign(campaign_id):
    """Delete a campaign."""
    # In-memory implementation
    return jsonify({'message': 'Campaign deleted successfully'}), 200


# Stats endpoint
@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get service statistics."""
    try:
        products_total = Product.query.count()
        products_active = Product.query.filter_by(is_active=True).count()
        products_featured = Product.query.filter_by(featured=True).count()
        categories_total = Category.query.count()
        categories_active = Category.query.filter_by(is_active=True).count()
        users_total = User.query.count()
        users_active = User.query.filter_by(is_active=True).count()
        
        return jsonify({
            'products': {
                'total': products_total,
                'active': products_active,
                'featured': products_featured,
                'inactive': products_total - products_active
            },
            'categories': {
                'total': categories_total,
                'active': categories_active,
                'inactive': categories_total - categories_active
            },
            'users': {
                'total': users_total,
                'active': users_active,
                'inactive': users_total - users_active
            }
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error getting stats: {e}")
        return jsonify({'error': 'Failed to get statistics'}), 500

# File upload endpoint for admin
@admin_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """Upload a file for products or categories."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'No selected file'}), 400
    
    entity_type = request.form.get('entity_type', 'product')
    entity_id = request.form.get('entity_id')
    
    # Validate file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
    filename = secure_filename(file.filename)
    if not filename or '.' not in filename:
        return jsonify({'error': 'Invalid filename'}), 400
    
    extension = filename.rsplit('.', 1)[1].lower()
    if extension not in allowed_extensions:
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        # Create uploads directory if it doesn't exist
        uploads_dir = current_app.config.get('UPLOADS_FOLDER', 'uploads')
        if not os.path.isabs(uploads_dir):
            uploads_dir = os.path.join(current_app.root_path, '..', uploads_dir)
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Generate unique filename
        import uuid
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(uploads_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Update entity with file info
        if entity_type == 'product' and entity_id:
            product = Product.query.get(entity_id)
            if product:
                product.image_filename = unique_filename
                product.image_url = f"/uploads/{unique_filename}"
                db.session.commit()
                
                return jsonify({
                    'message': 'File uploaded successfully',
                    'filename': unique_filename,
                    'url': f"/uploads/{unique_filename}",
                    'entity_type': entity_type,
                    'entity_id': entity_id
                }), 200
        
        elif entity_type == 'category' and entity_id:
            category = Category.query.get(entity_id)
            if category:
                category.image_filename = unique_filename
                category.image_url = f"/uploads/{unique_filename}"
                db.session.commit()
                
                return jsonify({
                    'message': 'File uploaded successfully',
                    'filename': unique_filename,
                    'url': f"/uploads/{unique_filename}",
                    'entity_type': entity_type,
                    'entity_id': entity_id
                }), 200
        
        # If no entity specified, just return file info
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': unique_filename,
            'url': f"/uploads/{unique_filename}",
            'entity_type': entity_type,
            'entity_id': entity_id
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error uploading file: {e}")
        return jsonify({'error': 'Failed to upload file'}), 500


# Catalog Management Endpoints
@admin_bp.route('/catalog', methods=['GET'])
@jwt_required()
def get_catalog():
    """Get the full catalog (stub implementation)."""
    return jsonify([]), 200

# Product Management Endpoints
@admin_bp.route('/catalog/products', methods=['GET'])
@jwt_required()
def get_products():
    """Get all products with optional filtering."""
    category_id = request.args.get('category_id')
    featured = request.args.get('featured')
    active = request.args.get('active', 'true').lower() == 'true'
    limit = min(int(request.args.get('limit', 100)), 1000)
    skip = int(request.args.get('skip', 0))
    
    query = Product.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if featured is not None:
        query = query.filter_by(featured=featured.lower() == 'true')
    
    query = query.filter_by(is_active=active)
    
    products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
    
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'slug': p.slug,
        'description': p.description,
        'price': float(p.price),
        'sale_price': float(p.sale_price) if p.sale_price else None,
        'sku': p.sku,
        'image_filename': p.image_filename,
        'image_url': p.image_url,
        'inventory': p.inventory,
        'featured': p.featured,
        'is_active': p.is_active,
        'category_id': p.category_id,
        'created_at': p.created_at.isoformat(),
        'updated_at': p.updated_at.isoformat()
    } for p in products]), 200

@admin_bp.route('/catalog/products', methods=['POST'])
@jwt_required()
def add_product():
    """Add a new product to the catalog."""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
        
    data = request.json
    
    # Validate required fields
    required_fields = ['title', 'slug', 'price', 'sku', 'category_id']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if SKU already exists
    if Product.query.filter_by(sku=data['sku']).first():
        return jsonify({'error': 'SKU already exists'}), 400
    
    # Check if slug already exists
    if Product.query.filter_by(slug=data['slug']).first():
        return jsonify({'error': 'Slug already exists'}), 400
    
    # Verify category exists
    category = Category.query.get(data['category_id'])
    if not category:
        return jsonify({'error': 'Category not found'}), 400
    
    try:
        product = Product(
            title=data['title'],
            slug=data['slug'],
            description=data.get('description', ''),
            price=data['price'],
            sale_price=data.get('sale_price'),
            sku=data['sku'],
            image_filename=data.get('image_filename'),
            image_url=data.get('image_url'),
            inventory=data.get('inventory', 0),
            featured=data.get('featured', False),
            is_active=data.get('is_active', True),
            category_id=data['category_id']
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'id': product.id,
            'title': product.title,
            'slug': product.slug,
            'price': float(product.price),
            'sku': product.sku,
            'category_id': product.category_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating product: {e}")
        return jsonify({'error': 'Failed to create product'}), 500

@admin_bp.route('/catalog/products/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Get a specific product by ID."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({
        'id': product.id,
        'title': product.title,
        'slug': product.slug,
        'description': product.description,
        'price': float(product.price),
        'sale_price': float(product.sale_price) if product.sale_price else None,
        'sku': product.sku,
        'image_filename': product.image_filename,
        'image_url': product.image_url,
        'inventory': product.inventory,
        'featured': product.featured,
        'is_active': product.is_active,
        'category_id': product.category_id,
        'created_at': product.created_at.isoformat(),
        'updated_at': product.updated_at.isoformat(),
        'category': {
            'id': product.category.id,
            'name': product.category.name,
            'slug': product.category.slug
        } if product.category else None
    }), 200

@admin_bp.route('/catalog/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update a product in the catalog."""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.json
    
    try:
        # Update fields
        if 'title' in data:
            product.title = data['title']
        if 'slug' in data:
            # Check if slug already exists (excluding current product)
            existing = Product.query.filter(Product.slug == data['slug'], Product.id != product_id).first()
            if existing:
                return jsonify({'error': 'Slug already exists'}), 400
            product.slug = data['slug']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'sale_price' in data:
            product.sale_price = data['sale_price']
        if 'sku' in data:
            # Check if SKU already exists (excluding current product)
            existing = Product.query.filter(Product.sku == data['sku'], Product.id != product_id).first()
            if existing:
                return jsonify({'error': 'SKU already exists'}), 400
            product.sku = data['sku']
        if 'image_filename' in data:
            product.image_filename = data['image_filename']
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'inventory' in data:
            product.inventory = data['inventory']
        if 'featured' in data:
            product.featured = data['featured']
        if 'is_active' in data:
            product.is_active = data['is_active']
        if 'category_id' in data:
            # Verify category exists
            category = Category.query.get(data['category_id'])
            if not category:
                return jsonify({'error': 'Category not found'}), 400
            product.category_id = data['category_id']
        
        db.session.commit()
        
        return jsonify({
            'id': product.id,
            'title': product.title,
            'slug': product.slug,
            'price': float(product.price),
            'sku': product.sku,
            'category_id': product.category_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating product: {e}")
        return jsonify({'error': 'Failed to update product'}), 500

@admin_bp.route('/catalog/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product from the catalog."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting product: {e}")
        return jsonify({'error': 'Failed to delete product'}), 500

# Category Management Endpoints
@admin_bp.route('/catalog/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all categories."""
    active = request.args.get('active', 'true').lower() == 'true'
    limit = min(int(request.args.get('limit', 100)), 1000)
    skip = int(request.args.get('skip', 0))
    
    query = Category.query
    
    if active:
        query = query.filter_by(is_active=active)
    
    categories = query.order_by(Category.display_order.asc(), Category.name.asc()).offset(skip).limit(limit).all()
    
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'slug': c.slug,
        'description': c.description,
        'image_filename': c.image_filename,
        'image_url': c.image_url,
        'icon': c.icon,
        'display_order': c.display_order,
        'parent_id': c.parent_id,
        'level': c.level,
        'is_active': c.is_active,
        'created_at': c.created_at.isoformat(),
        'updated_at': c.updated_at.isoformat(),
        'parent': {
            'id': c.parent.id,
            'name': c.parent.name
        } if c.parent else None
    } for c in categories]), 200

@admin_bp.route('/catalog/categories', methods=['POST'])
@jwt_required()
def add_category():
    """Add a new category to the catalog."""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
        
    data = request.json
    
    # Validate required fields
    required_fields = ['name', 'slug']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if slug already exists
    if Category.query.filter_by(slug=data['slug']).first():
        return jsonify({'error': 'Slug already exists'}), 400
    
    # Check if name already exists
    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Category name already exists'}), 400
    
    # Verify parent exists if specified
    parent_id = data.get('parent_id')
    if parent_id:
        parent = Category.query.get(parent_id)
        if not parent:
            return jsonify({'error': 'Parent category not found'}), 400
    
    try:
        category = Category(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description', ''),
            image_filename=data.get('image_filename'),
            image_url=data.get('image_url'),
            icon=data.get('icon'),
            display_order=data.get('display_order', 0),
            parent_id=parent_id,
            level=Category.query.get(parent_id).level + 1 if parent_id else 0,
            is_active=data.get('is_active', True)
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'parent_id': category.parent_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating category: {e}")
        return jsonify({'error': 'Failed to create category'}), 500

@admin_bp.route('/catalog/categories/<int:category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    """Get a specific category by ID."""
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    return jsonify({
        'id': category.id,
        'name': category.name,
        'slug': category.slug,
        'description': category.description,
        'image_filename': category.image_filename,
        'image_url': category.image_url,
        'icon': category.icon,
        'display_order': category.display_order,
        'parent_id': category.parent_id,
        'level': category.level,
        'is_active': category.is_active,
        'created_at': category.created_at.isoformat(),
        'updated_at': category.updated_at.isoformat(),
        'parent': {
            'id': category.parent.id,
            'name': category.parent.name
        } if category.parent else None,
        'children': [{
            'id': child.id,
            'name': child.name,
            'slug': child.slug
        } for child in category.children] if category.children else []
    }), 200

@admin_bp.route('/catalog/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Update a category in the catalog."""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
    
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    data = request.json
    
    try:
        # Update fields
        if 'name' in data:
            # Check if name already exists (excluding current category)
            existing = Category.query.filter(Category.name == data['name'], Category.id != category_id).first()
            if existing:
                return jsonify({'error': 'Category name already exists'}), 400
            category.name = data['name']
        if 'slug' in data:
            # Check if slug already exists (excluding current category)
            existing = Category.query.filter(Category.slug == data['slug'], Category.id != category_id).first()
            if existing:
                return jsonify({'error': 'Slug already exists'}), 400
            category.slug = data['slug']
        if 'description' in data:
            category.description = data['description']
        if 'image_filename' in data:
            category.image_filename = data['image_filename']
        if 'image_url' in data:
            category.image_url = data['image_url']
        if 'icon' in data:
            category.icon = data['icon']
        if 'display_order' in data:
            category.display_order = data['display_order']
        if 'parent_id' in data:
            parent_id = data['parent_id']
            if parent_id:
                # Verify parent exists and prevent circular reference
                parent = Category.query.get(parent_id)
                if not parent:
                    return jsonify({'error': 'Parent category not found'}), 400
                if parent.id == category_id:
                    return jsonify({'error': 'Category cannot be its own parent'}), 400
                category.parent_id = parent_id
                category.level = parent.level + 1
            else:
                category.parent_id = None
                category.level = 0
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'parent_id': category.parent_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating category: {e}")
        return jsonify({'error': 'Failed to update category'}), 500

@admin_bp.route('/catalog/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Delete a category from the catalog."""
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Check if category has products
    if category.products:
        return jsonify({'error': 'Cannot delete category with associated products'}), 400
    
    # Check if category has children
    if category.children:
        return jsonify({'error': 'Cannot delete category with subcategories'}), 400
    
    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': 'Category deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting category: {e}")
        return jsonify({'error': 'Failed to delete category'}), 500 