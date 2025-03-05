import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required, create_access_token, get_jwt_identity
)
from ..models.subscriber import Subscriber
from ..models.newsletter import Newsletter
from ..models.campaign import Campaign
from ..models.product import Product
from ..models.category import Category
from ..services.catalog_service import CatalogService
from .. import get_db
from ..services.email_service import send_test_email

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# Admin authentication
@admin_bp.route('/auth', methods=['POST'])
def admin_login():
    """Admin login to get JWT token."""
    # Add debug logging for request information
    print(f"DEBUG: Received admin login request")
    print(f"DEBUG: Request method: {request.method}")
    print(f"DEBUG: Request headers: {request.headers}")
    print(f"DEBUG: Request URL: {request.url}")
    
    if request.method != 'POST':
        print(f"DEBUG: Method not allowed: {request.method} (expected POST)")
        return jsonify({'error': f'Method {request.method} not allowed, use POST'}), 405
    
    # Check if we have JSON data
    if not request.is_json:
        print(f"DEBUG: Request content-type is not application/json: {request.content_type}")
        return jsonify({'error': 'Content-Type must be application/json'}), 400
        
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Add debug output to check if env variables are loaded correctly
    print(f"DEBUG: Admin login attempt")
    print(f"DEBUG: All environment variables containing 'ADMIN':")
    for key, value in os.environ.items():
        if 'ADMIN' in key:
            print(f"DEBUG: {key}={value}")
        
    email = data.get('email')
    password = data.get('password')
    
    # Debug request data
    print(f"DEBUG: Login request data: {data}")
    
    # In a real application, you would check credentials against stored values
    # For this example, we're using environment variables
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@example.com')
    admin_password = os.getenv('ADMIN_PASSWORD', 'dikythnks')
    
    # Debug output for environment variables
    print(f"DEBUG: Environment variables - ADMIN_EMAIL={admin_email}")
    print(f"DEBUG: Environment variables - ADMIN_PASSWORD={'*' * len(admin_password)} (masked for security)")
    print(f"DEBUG: Login attempt with email={email}")
    print(f"DEBUG: Password length attempt={len(password) if password else 0}")
    
    if email != admin_email or password != admin_password:
        print(f"DEBUG: Login failed - Invalid credentials")
        print(f"DEBUG: Email match: {email == admin_email}")
        print(f"DEBUG: Password match: {password == admin_password}")
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create JWT token with user info
    access_token = create_access_token(identity=email)
    print(f"DEBUG: Login successful - token created for {email}")
    
    return jsonify({
        'access_token': access_token,
        'email': email
    }), 200

# Token validation endpoint
@admin_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    """Endpoint to validate if a token is still valid"""
    current_user = get_jwt_identity()
    print(f"DEBUG: Token validation successful for {current_user}")
    return jsonify({'valid': True, 'user': current_user}), 200

# Subscriber management
@admin_bp.route('/subscribers', methods=['GET'])
@jwt_required()
def get_subscribers():
    """Get all subscribers with optional filtering."""
    topic = request.args.get('topic')
    is_active = request.args.get('isActive')
    limit = int(request.args.get('limit', 100))
    skip = int(request.args.get('skip', 0))
    
    # Convert isActive string to boolean
    if is_active is not None:
        is_active = is_active.lower() == 'true'
    
    db = get_db()
    
    # TODO: Implement filtering logic
    subscribers = Subscriber.get_active_subscribers(db, topic_filter=topic if topic else None)
    
    # Count total for pagination
    # TODO: Implement count logic
    total = len(subscribers)
    
    return jsonify({
        'subscribers': subscribers[skip:skip+limit], 
        'total': total,
        'limit': limit,
        'skip': skip
    }), 200


# Newsletter management
@admin_bp.route('/newsletters', methods=['GET'])
@jwt_required()
def get_newsletters():
    """Get all newsletters with optional filtering."""
    topic = request.args.get('topic')
    limit = int(request.args.get('limit', 100))
    skip = int(request.args.get('skip', 0))
    
    db = get_db()
    newsletters = Newsletter.get_all(db, topic=topic, limit=limit, skip=skip)
    
    return jsonify({'newsletters': newsletters}), 200


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
    db = get_db()
    success = Campaign.delete(db, campaign_id)
    
    if not success:
        return jsonify({'error': 'Campaign deletion failed. Only draft campaigns can be deleted.'}), 400
        
    return jsonify({'message': 'Campaign deleted successfully'}), 200


# Stats endpoint
@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get service statistics."""
    db = get_db()
    
    # Count total subscribers
    total_subscribers = db[Subscriber.collection_name].count_documents({})
    active_subscribers = db[Subscriber.collection_name].count_documents({'isActive': True})
    
    # Count newsletters
    total_newsletters = db[Newsletter.collection_name].count_documents({})
    
    # Count campaigns by status
    campaign_stats = {}
    for status in [
        Campaign.STATUS_DRAFT, Campaign.STATUS_SCHEDULED, 
        Campaign.STATUS_SENDING, Campaign.STATUS_COMPLETED, 
        Campaign.STATUS_FAILED
    ]:
        campaign_stats[status] = db[Campaign.collection_name].count_documents({'status': status})
    
    # Calculate email engagement (last 30 days)
    # TODO: Implement engagement metrics
    
    return jsonify({
        'subscribers': {
            'total': total_subscribers,
            'active': active_subscribers,
            'inactive': total_subscribers - active_subscribers
        },
        'newsletters': {
            'total': total_newsletters
        },
        'campaigns': campaign_stats
    }), 200


# Catalog Management Endpoints
@admin_bp.route('/catalog', methods=['GET'])
@jwt_required()
def get_catalog():
    """Get the full catalog."""
    catalog = CatalogService.get_catalog()
    return jsonify(catalog), 200

@admin_bp.route('/catalog/sync', methods=['POST'])
@jwt_required()
def sync_catalog():
    """Manually trigger catalog synchronization."""
    direction = request.json.get('direction', 'to_json')
    
    if direction == 'to_database':
        success = CatalogService.sync_json_to_database()
    else:
        success = CatalogService.sync_database_to_json()
        
    if success:
        return jsonify({'message': f'Catalog synchronized successfully ({direction})'}), 200
    else:
        return jsonify({'error': 'Failed to synchronize catalog'}), 500

# Product Management Endpoints
@admin_bp.route('/catalog/products', methods=['GET'])
@jwt_required()
def get_products():
    """Get all products with optional filtering."""
    category = request.args.get('category')
    limit = int(request.args.get('limit', 100))
    skip = int(request.args.get('skip', 0))
    
    db = get_db()
    
    if category:
        products = Product.find_by_category(category, db=db, limit=limit, skip=skip)
    else:
        products = Product.find_all(db=db, limit=limit, skip=skip)
        
    return jsonify([product.to_json() for product in products]), 200

@admin_bp.route('/catalog/products', methods=['POST'])
@jwt_required()
def add_product():
    """Add a new product to the catalog."""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
        
    product_data = request.json
    result = CatalogService.add_product(product_data)
    
    if result:
        return jsonify(result), 201
    else:
        return jsonify({'error': 'Failed to add product'}), 500

@admin_bp.route('/catalog/products/<product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Get a specific product by ID."""
    db = get_db()
    product = Product.find_by_id(product_id, db=db)
    
    if product:
        return jsonify(product.to_json()), 200
    else:
        return jsonify({'error': 'Product not found'}), 404

@admin_bp.route('/catalog/products/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update a product in the catalog."""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
        
    product_data = request.json
    result = CatalogService.update_product(product_id, product_data)
    
    if result:
        return jsonify(result), 200
    else:
        return jsonify({'error': 'Failed to update product'}), 404

@admin_bp.route('/catalog/products/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product from the catalog."""
    result = CatalogService.delete_product(product_id)
    
    if result:
        return jsonify({'message': 'Product deleted successfully'}), 200
    else:
        return jsonify({'error': 'Failed to delete product'}), 404

# Category Management Endpoints
@admin_bp.route('/catalog/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all categories."""
    db = get_db()
    limit = int(request.args.get('limit', 100))
    skip = int(request.args.get('skip', 0))
    
    categories = Category.find_all(db=db, limit=limit, skip=skip)
    return jsonify([category.to_json() for category in categories]), 200

@admin_bp.route('/catalog/categories', methods=['POST'])
@jwt_required()
def add_category():
    """Add a new category to the catalog."""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
        
    category_data = request.json
    result = CatalogService.add_category(category_data)
    
    if result:
        return jsonify(result), 201
    else:
        return jsonify({'error': 'Failed to add category'}), 500

@admin_bp.route('/catalog/categories/<category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    """Get a specific category by ID."""
    db = get_db()
    category = Category.find_by_id(category_id, db=db)
    
    if category:
        return jsonify(category.to_json()), 200
    else:
        return jsonify({'error': 'Category not found'}), 404

@admin_bp.route('/catalog/categories/<category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Update a category in the catalog."""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
        
    category_data = request.json
    result = CatalogService.update_category(category_id, category_data)
    
    if result:
        return jsonify(result), 200
    else:
        return jsonify({'error': 'Failed to update category'}), 404

@admin_bp.route('/catalog/categories/<category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Delete a category from the catalog."""
    result = CatalogService.delete_category(category_id)
    
    if result:
        return jsonify({'message': 'Category deleted successfully'}), 200
    else:
        return jsonify({'error': 'Failed to delete category'}), 404 