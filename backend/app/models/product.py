from datetime import datetime
from typing import Dict, Any, List, Optional
from bson import ObjectId
from flask import current_app
import re

class Product:
    """
    Product model class for catalog items.
    """
    
    collection_name = 'products'
    
    def __init__(self, data: Dict[str, Any] = None):
        """
        Initialize a product from dictionary data.
        
        Args:
            data: Dictionary with product attributes
        """
        self.id = str(data.get('_id', '')) if data and '_id' in data else None
        
        # Basic product information
        self.title = data.get('title', {}) if data else {}  # Multi-language
        self.description = data.get('description', {}) if data else {}  # Multi-language
        self.price = data.get('price') if data else None
        self.sale_price = data.get('sale_price') if data else None
        self.sku = data.get('sku') if data else None
        self.slug = data.get('slug') if data else None
        self.category_id = data.get('category_id') if data else None
        self.subcategory_ids = data.get('subcategory_ids', []) if data else []
        
        # Images and media
        self.images = data.get('images', []) if data else []
        self.thumbnail = data.get('thumbnail') if data else None
        self.videos = data.get('videos', []) if data else []
        
        # Product management
        self.status = data.get('status', 'draft') if data else 'draft'
        self.inventory = data.get('inventory', 0) if data else 0
        self.featured = data.get('featured', False) if data else False
        self.tags = data.get('tags', []) if data else []
        
        # Details and specifications
        self.attributes = data.get('attributes', {}) if data else {}
        self.dimensions = data.get('dimensions', {}) if data else {}
        
        # SEO and metadata
        self.seo = data.get('seo', {}) if data else {}
        self.meta = data.get('meta', {}) if data else {}
        
        # Timestamps
        self.created_at = data.get('created_at') if data else datetime.utcnow()
        self.updated_at = data.get('updated_at') if data else datetime.utcnow()
        
        # Soft delete flag
        self.deleted = data.get('deleted', False) if data else False
        self.deleted_at = data.get('deleted_at') if data else None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert product to dictionary."""
        product_dict = {
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'slug': self.slug,
            'status': self.status,
            'inventory': self.inventory,
            'featured': self.featured,
            'tags': self.tags,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        
        # Add ID if present
        if self.id:
            product_dict['id'] = self.id
        
        # Add optional fields if they exist
        if self.sku:
            product_dict['sku'] = self.sku
            
        if self.sale_price is not None:
            product_dict['sale_price'] = self.sale_price
            
        if self.category_id:
            product_dict['category_id'] = self.category_id
            
        if self.subcategory_ids:
            product_dict['subcategory_ids'] = self.subcategory_ids
            
        if self.images:
            product_dict['images'] = self.images
            
        if self.thumbnail:
            product_dict['thumbnail'] = self.thumbnail
            
        if self.videos:
            product_dict['videos'] = self.videos
            
        if self.attributes:
            product_dict['attributes'] = self.attributes
            
        if self.dimensions:
            product_dict['dimensions'] = self.dimensions
            
        if self.seo:
            product_dict['seo'] = self.seo
            
        if self.meta:
            product_dict['meta'] = self.meta
            
        if self.deleted:
            product_dict['deleted'] = self.deleted
            
        if self.deleted_at:
            product_dict['deleted_at'] = self.deleted_at
        
        return product_dict
    
    def save(self) -> bool:
        """
        Save the product to the database.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            product_dict = self.to_dict()
            product_dict['updated_at'] = datetime.utcnow()
            
            # Remove id from the dictionary (it will be in _id)
            if 'id' in product_dict:
                del product_dict['id']
            
            if self.id:
                # Update existing product
                result = current_app.db.products.update_one(
                    {'_id': ObjectId(self.id)},
                    {'$set': product_dict}
                )
                return result.modified_count > 0
            else:
                # Insert new product
                result = current_app.db.products.insert_one(product_dict)
                self.id = str(result.inserted_id)
                return True
        except Exception as e:
            current_app.logger.error(f"Error saving product: {e}")
            return False
    
    @classmethod
    def find_by_id(cls, product_id: str) -> Optional['Product']:
        """
        Find a product by ID.
        
        Args:
            product_id: The product ID
            
        Returns:
            Product object if found, None otherwise
        """
        try:
            product_data = current_app.db.products.find_one({'_id': ObjectId(product_id)})
            return cls(product_data) if product_data else None
        except Exception as e:
            current_app.logger.error(f"Error finding product by ID: {e}")
            return None
    
    @classmethod
    def find_by_slug(cls, slug: str) -> Optional['Product']:
        """
        Find a product by slug.
        
        Args:
            slug: The product slug
            
        Returns:
            Product object if found, None otherwise
        """
        try:
            product_data = current_app.db.products.find_one({'slug': slug})
            return cls(product_data) if product_data else None
        except Exception as e:
            current_app.logger.error(f"Error finding product by slug: {e}")
            return None
    
    @classmethod
    def find_by_sku(cls, sku: str) -> Optional['Product']:
        """
        Find a product by SKU.
        
        Args:
            sku: The product SKU
            
        Returns:
            Product object if found, None otherwise
        """
        try:
            product_data = current_app.db.products.find_one({'sku': sku})
            return cls(product_data) if product_data else None
        except Exception as e:
            current_app.logger.error(f"Error finding product by SKU: {e}")
            return None
    
    @classmethod
    def find_all(cls, db=None, limit=100, skip=0, **filters):
        """Find all products matching the filters."""
        if db is None:
            db = current_app.db
            
        query = {}
        sort_params = [('_id', -1)]  # Default sort by newest
        
        # Handle special filter cases
        if 'search' in filters and filters['search']:
            search = filters.pop('search')
            query['$or'] = [
                {'title.en': {'$regex': search, '$options': 'i'}},
                {'title.es': {'$regex': search, '$options': 'i'}},
                {'description.en': {'$regex': search, '$options': 'i'}},
                {'description.es': {'$regex': search, '$options': 'i'}},
                {'sku': {'$regex': search, '$options': 'i'}}
            ]
        
        if 'categoryId' in filters and filters['categoryId']:
            query['category_id'] = filters.pop('categoryId')
        
        if 'subcategoryIds' in filters and filters['subcategoryIds']:
            query['subcategory_ids'] = {'$in': filters.pop('subcategoryIds')}
        
        if 'minPrice' in filters and filters['minPrice'] is not None:
            query['price'] = query.get('price', {})
            query['price']['$gte'] = float(filters.pop('minPrice'))
        
        if 'maxPrice' in filters and filters['maxPrice'] is not None:
            query['price'] = query.get('price', {})
            query['price']['$lte'] = float(filters.pop('maxPrice'))
        
        if 'tags' in filters and filters['tags']:
            query['tags'] = {'$in': filters.pop('tags')}
        
        if 'status' in filters and filters['status']:
            query['status'] = filters.pop('status')
        
        if 'featured' in filters and filters['featured'] is not None:
            query['featured'] = filters.pop('featured')
        
        # Handle sorting
        if 'sortBy' in filters and filters['sortBy']:
            sort_field = filters.pop('sortBy')
            sort_order = 1 if filters.pop('sortOrder', 'asc') == 'asc' else -1
            
            # Map frontend sort fields to database fields
            sort_field_mapping = {
                'price': 'price',
                'createdAt': 'created_at',
                'title': 'title.en'
            }
            
            sort_params = [(sort_field_mapping.get(sort_field, '_id'), sort_order)]
        
        # Add remaining filters
        for key, value in filters.items():
            if value is not None:
                query[key] = value
                
        cursor = db[cls.collection_name].find(query).sort(sort_params).limit(limit).skip(skip)
        return [cls(product) for product in cursor]
    
    @classmethod
    def count(cls, db=None, **filters):
        """Count products matching the filters."""
        if db is None:
            db = current_app.db
            
        query = {}
        
        # Apply the same filter logic as find_all
        if 'search' in filters and filters['search']:
            search = filters.pop('search')
            query['$or'] = [
                {'title.en': {'$regex': search, '$options': 'i'}},
                {'title.es': {'$regex': search, '$options': 'i'}},
                {'description.en': {'$regex': search, '$options': 'i'}},
                {'description.es': {'$regex': search, '$options': 'i'}},
                {'sku': {'$regex': search, '$options': 'i'}}
            ]
        
        if 'categoryId' in filters and filters['categoryId']:
            query['category_id'] = filters.pop('categoryId')
        
        # Add remaining filters similar to find_all
        for key, value in filters.items():
            if value is not None:
                query[key] = value
                
        return db[cls.collection_name].count_documents(query)
    
    @classmethod
    def find_by_category(cls, category_id, db=None, limit=100, skip=0):
        """Find all products in a category."""
        if db is None:
            db = current_app.db
            
        cursor = db[cls.collection_name].find({'category_id': category_id}).limit(limit).skip(skip)
        return [cls(product) for product in cursor]
    
    def validate(self):
        """Validate the product data."""
        errors = {}
        
        # Title validation
        if not self.title.get('en'):
            errors['title'] = errors.get('title', {})
            errors['title']['en'] = 'Product title in English is required'
        
        if not self.title.get('es'):
            errors['title'] = errors.get('title', {})
            errors['title']['es'] = 'Product title in Spanish is required'
        
        # Price validation
        if self.price <= 0:
            errors['price'] = 'Price must be greater than 0'
        
        # SKU validation
        if not self.sku:
            errors['sku'] = 'SKU is required'
        elif not re.match(r'^[A-Za-z0-9-_]+$', self.sku):
            errors['sku'] = 'SKU can only contain letters, numbers, hyphens, and underscores'
        
        # Category validation
        if not self.category_id:
            errors['categoryId'] = 'Category is required'
        
        # Slug validation
        if not self.slug:
            errors['slug'] = 'Slug is required'
        
        return errors
    
    def delete(self, db=None):
        """Delete the product from the database."""
        if db is None:
            db = current_app.db
            
        result = db[self.collection_name].delete_one({'_id': ObjectId(self.id)})
        return result.deleted_count > 0
    
    def to_json(self):
        """Convert the product to a JSON-serializable dictionary."""
        product_dict = {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'sku': self.sku,
            'categoryId': self.category_id,
            'subcategoryIds': self.subcategory_ids,
            'tags': self.tags,
            'attributes': self.attributes,
            'inventory': self.inventory,
            'images': self.images,
            'status': self.status,
            'featured': self.featured,
            'createdAt': self.created_at.isoformat() if hasattr(self.created_at, 'isoformat') else self.created_at,
            'updatedAt': self.updated_at.isoformat() if hasattr(self.updated_at, 'isoformat') else self.updated_at
        }
        
        # Add optional fields if they exist
        if self.sale_price is not None:
            product_dict['salePrice'] = self.sale_price
            
        if self.deleted:
            product_dict['deleted'] = self.deleted
            
        if self.deleted_at:
            product_dict['deletedAt'] = self.deleted_at.isoformat() if hasattr(self.deleted_at, 'isoformat') else self.deleted_at
        
        return product_dict 