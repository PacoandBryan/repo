from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import uuid
import asyncio
from werkzeug.utils import secure_filename

from ..services.catalog_service import CatalogService
from ..repositories.product_repository import ProductRepository
from ..utils.middleware import RateLimiter, validate_request, track_api_usage, require_admin

catalog_bp = Blueprint('catalog', __name__)

# Apply rate limiting to all catalog routes
rate_limiter = RateLimiter(requests_per_minute=30)

# Schema for catalog import
import_schema = {
    'entityType': {'type': 'string', 'required': True, 'enum': ['product', 'category']},
    'conflictStrategy': {'type': 'string', 'enum': ['skip', 'overwrite', 'merge']},
    'options': {'type': 'object'}
}

@catalog_bp.route('/import', methods=['POST'])
@rate_limiter
@validate_request(import_schema)
@track_api_usage
@jwt_required()
@require_admin
async def import_catalog():
    """Import catalog data from file."""
    # Verify that file is included
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400
    
    # Get import options
    data = request.form.to_dict()
    entity_type = data.get('entityType', 'product')
    conflict_strategy = data.get('conflictStrategy', 'skip')
    options = {
        'conflict_strategy': conflict_strategy
    }
    
    # Save file temporarily
    filename = secure_filename(file.filename)
    temp_dir = os.path.join(current_app.config['UPLOADS_FOLDER'], 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    
    # Use UUID to avoid filename collisions
    temp_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(temp_dir, temp_filename)
    file.save(file_path)
    
    # Initialize catalog service
    catalog_service = CatalogService()
    
    # Process the file (asynchronously)
    result = await catalog_service.process_catalog_file(
        file_path=file_path,
        entity_type=entity_type,
        options=options
    )
    
    return jsonify({
        'message': 'Import job started',
        'processId': result['process_id'],
        'status': result['status']
    })

@catalog_bp.route('/import/<process_id>/status', methods=['GET'])
@rate_limiter
@track_api_usage
@jwt_required()
def import_status(process_id):
    """Get the status of an import job."""
    catalog_service = CatalogService()
    status = catalog_service.get_processing_status(process_id)
    
    return jsonify(status)

@catalog_bp.route('/search', methods=['GET'])
@rate_limiter
@track_api_usage
def search_catalog():
    """
    Search the catalog with filtering, sorting and pagination.
    
    Query parameters:
    - q: Search query
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20, max: 100)
    - category_id: Filter by category
    - min_price: Minimum price
    - max_price: Maximum price
    - status: Product status (active, draft, etc.)
    - featured: Whether product is featured (true or false)
    - sort_by: Field to sort by (default: created_at)
    - sort_order: Sort direction (asc or desc)
    - tags: Comma-separated list of tags
    """
    # Get query parameters
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 20)), 100)
    
    # Additional filters
    category_id = request.args.get('category_id')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    status = request.args.get('status', 'active')
    featured = None
    if 'featured' in request.args:
        featured = request.args.get('featured').lower() == 'true'
    
    # Sort options
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Tags filter
    tags = None
    if 'tags' in request.args:
        tags = request.args.get('tags').split(',')
    
    # Execute search
    product_repo = ProductRepository()
    result = product_repo.search(
        query=query,
        page=page,
        per_page=per_page,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        status=status,
        featured=featured,
        sort_by=sort_by,
        sort_order=sort_order,
        tags=tags,
        include_subcategories=request.args.get('include_subcategories', 'false').lower() == 'true'
    )
    
    # Convert products to dictionaries
    items = [product.to_dict() for product in result['items']]
    
    return jsonify({
        'items': items,
        'pagination': result['pagination']
    })

@catalog_bp.route('/featured', methods=['GET'])
@rate_limiter
@track_api_usage
def get_featured():
    """Get featured products."""
    limit = min(int(request.args.get('limit', 10)), 50)
    
    product_repo = ProductRepository()
    featured_products = product_repo.get_featured_products(limit=limit)
    
    return jsonify({
        'products': [product.to_dict() for product in featured_products]
    })

@catalog_bp.route('/new-arrivals', methods=['GET'])
@rate_limiter
@track_api_usage
def get_new_arrivals():
    """Get newest products."""
    limit = min(int(request.args.get('limit', 10)), 50)
    
    product_repo = ProductRepository()
    new_products = product_repo.get_new_arrivals(limit=limit)
    
    return jsonify({
        'products': [product.to_dict() for product in new_products]
    })

@catalog_bp.route('/related/<product_id>', methods=['GET'])
@rate_limiter
@track_api_usage
def get_related_products(product_id):
    """Get products related to the given product."""
    limit = min(int(request.args.get('limit', 4)), 20)
    
    product_repo = ProductRepository()
    related_products = product_repo.find_related_products(product_id, limit=limit)
    
    return jsonify({
        'products': [product.to_dict() for product in related_products]
    })

@catalog_bp.route('/metadata', methods=['GET'])
@rate_limiter
@track_api_usage
def get_catalog_metadata():
    """
    Get catalog metadata for filtering and navigation.
    Includes price ranges, product counts by category, and available tags.
    """
    product_repo = ProductRepository()
    
    # Get price range
    price_range = product_repo.get_price_range()
    
    # Get product counts by category
    counts_by_category = product_repo.get_product_counts_by_category()
    
    # Get all available tags
    tags = product_repo.get_all_tags()
    
    return jsonify({
        'price_range': price_range,
        'counts_by_category': counts_by_category,
        'tags': tags
    }) 