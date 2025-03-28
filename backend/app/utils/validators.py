import re
from datetime import datetime
from bson import ObjectId
from flask import current_app
from typing import Dict, Any, List

def validate_product(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Validate product data.
    
    Args:
        data: Product data dictionary
        
    Returns:
        Dictionary of field errors, empty if valid
    """
    errors = {}
    
    # Required fields
    required_fields = ['title']
    for field in required_fields:
        if field not in data or not data[field]:
            errors[field] = f"{field} is required"
    
    # Validate title
    if 'title' in data and data['title']:
        if isinstance(data['title'], dict):
            if 'en' not in data['title'] or not data['title']['en']:
                errors['title'] = "Title must have an English version"
            elif len(data['title']['en']) > 200:
                errors['title'] = "Title is too long (max 200 characters)"
        elif isinstance(data['title'], str):
            if len(data['title']) > 200:
                errors['title'] = "Title is too long (max 200 characters)"
        else:
            errors['title'] = "Title must be a string or object with language codes"
    
    # Validate price
    if 'price' in data:
        if not isinstance(data['price'], (int, float)):
            errors['price'] = "Price must be a number"
        elif data['price'] < 0:
            errors['price'] = "Price cannot be negative"
    
    # Validate sale_price
    if 'sale_price' in data and data['sale_price'] is not None:
        if not isinstance(data['sale_price'], (int, float)):
            errors['sale_price'] = "Sale price must be a number"
        elif data['sale_price'] < 0:
            errors['sale_price'] = "Sale price cannot be negative"
        elif 'price' in data and data['sale_price'] > data['price']:
            errors['sale_price'] = "Sale price cannot be greater than regular price"
    
    # Validate slug
    if 'slug' in data and data['slug']:
        if not isinstance(data['slug'], str):
            errors['slug'] = "Slug must be a string"
        elif not re.match(r'^[a-z0-9\-]+$', data['slug']):
            errors['slug'] = "Slug can only contain lowercase letters, numbers, and hyphens"
    
    # Validate SKU
    if 'sku' in data and data['sku']:
        if not isinstance(data['sku'], str):
            errors['sku'] = "SKU must be a string"
        elif len(data['sku']) > 100:
            errors['sku'] = "SKU is too long (max 100 characters)"
    
    # Validate inventory
    if 'inventory' in data:
        if not isinstance(data['inventory'], int):
            errors['inventory'] = "Inventory must be an integer"
        elif data['inventory'] < 0:
            errors['inventory'] = "Inventory cannot be negative"
    
    # Validate status
    valid_statuses = ['active', 'draft', 'archived']
    if 'status' in data and data['status']:
        if data['status'] not in valid_statuses:
            errors['status'] = f"Status must be one of: {', '.join(valid_statuses)}"
    
    # Validate featured flag
    if 'featured' in data and not isinstance(data['featured'], bool):
        errors['featured'] = "Featured must be a boolean"
    
    # Validate tags
    if 'tags' in data and data['tags']:
        if not isinstance(data['tags'], list):
            errors['tags'] = "Tags must be an array"
        else:
            for tag in data['tags']:
                if not isinstance(tag, str):
                    errors['tags'] = "Each tag must be a string"
                    break
    
    # Validate dimensions
    if 'dimensions' in data and data['dimensions']:
        if not isinstance(data['dimensions'], dict):
            errors['dimensions'] = "Dimensions must be an object"
        else:
            for dim in ['length', 'width', 'height', 'weight']:
                if dim in data['dimensions'] and not isinstance(data['dimensions'][dim], (int, float)):
                    errors[f"dimensions.{dim}"] = f"{dim} must be a number"
    
    return errors

def validate_category(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Validate category data.
    
    Args:
        data: Category data dictionary
        
    Returns:
        Dictionary of field errors, empty if valid
    """
    errors = {}
    
    # Required fields
    required_fields = ['name']
    for field in required_fields:
        if field not in data or not data[field]:
            errors[field] = f"{field} is required"
    
    # Validate name
    if 'name' in data and data['name']:
        if not isinstance(data['name'], str):
            errors['name'] = "Name must be a string"
        elif len(data['name']) > 100:
            errors['name'] = "Name is too long (max 100 characters)"
    
    # Validate slug
    if 'slug' in data and data['slug']:
        if not isinstance(data['slug'], str):
            errors['slug'] = "Slug must be a string"
        elif not re.match(r'^[a-z0-9\-]+$', data['slug']):
            errors['slug'] = "Slug can only contain lowercase letters, numbers, and hyphens"
    
    # Validate description
    if 'description' in data and data['description']:
        if not isinstance(data['description'], str):
            errors['description'] = "Description must be a string"
        elif len(data['description']) > 1000:
            errors['description'] = "Description is too long (max 1000 characters)"
    
    # Validate parent_id
    if 'parent_id' in data and data['parent_id']:
        if not isinstance(data['parent_id'], str):
            errors['parent_id'] = "Parent ID must be a string"
    
    # Validate image_url
    if 'image_url' in data and data['image_url']:
        if not isinstance(data['image_url'], str):
            errors['image_url'] = "Image URL must be a string"
        elif not re.match(r'^https?://.+|^/uploads/.+', data['image_url']):
            errors['image_url'] = "Image URL must be a valid URL or path to uploaded file"
    
    return errors

def validate_search_params(params: Dict[str, Any]) -> Dict[str, str]:
    """
    Validate search parameters.
    
    Args:
        params: Search parameters
        
    Returns:
        Dictionary of parameter errors, empty if valid
    """
    errors = {}
    
    # Validate page
    if 'page' in params:
        try:
            page = int(params['page'])
            if page < 1:
                errors['page'] = "Page must be greater than 0"
        except ValueError:
            errors['page'] = "Page must be an integer"
    
    # Validate per_page
    if 'per_page' in params:
        try:
            per_page = int(params['per_page'])
            if per_page < 1 or per_page > 100:
                errors['per_page'] = "Items per page must be between 1 and 100"
        except ValueError:
            errors['per_page'] = "Items per page must be an integer"
    
    # Validate price filters
    if 'min_price' in params:
        try:
            min_price = float(params['min_price'])
            if min_price < 0:
                errors['min_price'] = "Minimum price cannot be negative"
        except ValueError:
            errors['min_price'] = "Minimum price must be a number"
    
    if 'max_price' in params:
        try:
            max_price = float(params['max_price'])
            if max_price < 0:
                errors['max_price'] = "Maximum price cannot be negative"
            elif 'min_price' in params and errors.get('min_price') is None:
                min_price = float(params['min_price'])
                if max_price < min_price:
                    errors['max_price'] = "Maximum price cannot be less than minimum price"
        except ValueError:
            errors['max_price'] = "Maximum price must be a number"
    
    # Validate sort_order
    if 'sort_order' in params:
        valid_sort_orders = ['asc', 'desc']
        if params['sort_order'].lower() not in valid_sort_orders:
            errors['sort_order'] = f"Sort order must be one of: {', '.join(valid_sort_orders)}"
    
    return errors 