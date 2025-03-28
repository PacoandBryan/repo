from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
import re

from ..models.product import Product
from ..utils.validators import validate_product

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    """Get a list of products with pagination and filtering"""
    # Parse query parameters
    page = int(request.args.get('page', 1))
    limit = min(int(request.args.get('limit', 10)), 50)  # Cap at 50 items per page
    skip = (page - 1) * limit
    
    # Get filter parameters
    filters = {
        'search': request.args.get('search'),
        'categoryId': request.args.get('categoryId'),
        'minPrice': float(request.args.get('minPrice')) if request.args.get('minPrice') else None,
        'maxPrice': float(request.args.get('maxPrice')) if request.args.get('maxPrice') else None,
        'status': request.args.get('status'),
        'featured': request.args.get('featured') == 'true' if request.args.get('featured') is not None else None,
        'sortBy': request.args.get('sortBy'),
        'sortOrder': request.args.get('sortOrder', 'asc')
    }
    
    # Handle subcategories and tags (comma-separated lists)
    if request.args.get('subcategoryIds'):
        filters['subcategoryIds'] = request.args.get('subcategoryIds').split(',')
    
    if request.args.get('tags'):
        filters['tags'] = request.args.get('tags').split(',')
    
    # Get products with filters
    products = Product.find_all(limit=limit, skip=skip, **filters)
    
    # Get total count for pagination
    total = Product.count(**filters)
    
    # Return paginated response
    return jsonify({
        'products': [product.to_json() for product in products],
        'pagination': {
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit  # Ceiling division
        }
    }), 200

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    product = Product.find_by_id(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify(product.to_json()), 200

@products_bp.route('/slug/<slug>', methods=['GET'])
def get_product_by_slug(slug):
    """Get a single product by slug"""
    product = Product.find_by_slug(slug)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify(product.to_json()), 200

@products_bp.route('', methods=['POST'])
def create_product():
    """Create a new product"""
    data = request.get_json()
    
    # Server-side validation
    errors = validate_product(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Generate slug if not provided
    if not data.get('slug') and data.get('title', {}).get('en'):
        title = data['title']['en']
        slug = title.lower().replace(' ', '-')
        # Remove special characters
        slug = re.sub(r'[^\w\-]', '', slug)
        # Replace multiple hyphens with single hyphen
        slug = re.sub(r'-+', '-', slug)
        data['slug'] = slug
    
    try:
        product = Product(data)
        product.save()
        return jsonify(product.to_json()), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Error creating product: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@products_bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product"""
    data = request.get_json()
    
    # Check if product exists
    existing_product = Product.find_by_id(product_id)
    if not existing_product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Set ID in data for validation
    data['id'] = product_id
    
    # Server-side validation
    errors = validate_product(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    try:
        # Update product data
        for key, value in data.items():
            setattr(existing_product, key, value)
        
        existing_product.save()
        return jsonify(existing_product.to_json()), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Error updating product: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@products_bp.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product"""
    product = Product.find_by_id(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    try:
        product.delete()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting product: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500 