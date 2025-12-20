import re
from datetime import datetime

def generate_product_slug(title: str) -> str:
    """Generate a URL-friendly slug from a product title"""
    # Convert to lowercase and replace spaces with hyphens
    slug = title.lower().strip()
    
    # Replace spaces and special characters with hyphens
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    
    # Ensure it's not empty
    if not slug:
        slug = f"product-{int(datetime.now().timestamp())}"
    
    return slug

def validate_sku(sku: str) -> bool:
    """Validate SKU format"""
    if not sku or len(sku) < 3:
        return False
    
    # Allow letters, numbers, hyphens, and underscores
    return bool(re.match(r'^[A-Za-z0-9_-]+$', sku))

def validate_price(price: float) -> bool:
    """Validate price is positive"""
    return price > 0

def validate_product_data(data: dict) -> tuple:
    """Validate product data and return (is_valid, error_message)"""
    
    # Check required fields
    required_fields = ['title', 'price', 'sku', 'category_id']
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"{field} is required"
    
    # Validate title
    if len(data['title'].strip()) < 3:
        return False, "Title must be at least 3 characters long"
    
    # Validate price
    try:
        price = float(data['price'])
        if not validate_price(price):
            return False, "Price must be greater than 0"
    except (ValueError, TypeError):
        return False, "Invalid price format"
    
    # Validate SKU
    if not validate_sku(data['sku']):
        return False, "SKU must be at least 3 characters and contain only letters, numbers, hyphens, and underscores"
    
    # Validate category_id
    try:
        category_id = int(data['category_id'])
        if category_id <= 0:
            return False, "Invalid category ID"
    except (ValueError, TypeError):
        return False, "Invalid category ID format"
    
    return True, ""
