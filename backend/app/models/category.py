from datetime import datetime
from typing import Dict, Any, List, Optional
from bson import ObjectId
from flask import current_app

class Category:
    """
    Category model class for catalog organization.
    """
    
    collection_name = 'categories'
    
    def __init__(self, data: Dict[str, Any] = None):
        """
        Initialize a category from dictionary data.
        
        Args:
            data: Dictionary with category attributes
        """
        self.id = str(data.get('_id', '')) if data and '_id' in data else None
        
        # Basic category information
        self.name = data.get('name', '') if data else ''
        self.description = data.get('description', '') if data else ''
        self.slug = data.get('slug', '') if data else ''
        
        # Hierarchy
        self.parent_id = data.get('parent_id') if data else None
        self.level = data.get('level', 0) if data else 0
        
        # Display information
        self.image_url = data.get('image_url') if data else None
        self.icon = data.get('icon') if data else None
        self.display_order = data.get('display_order', 0) if data else 0
        
        # SEO and metadata
        self.seo = data.get('seo', {}) if data else {}
        self.meta = data.get('meta', {}) if data else {}
        
        # Timestamps
        self.created_at = data.get('created_at') if data else datetime.utcnow()
        self.updated_at = data.get('updated_at') if data else datetime.utcnow()
        
        # Soft delete flag
        self.deleted = data.get('deleted', False) if data else False
        self.deleted_at = data.get('deleted_at') if data else None
    
    @classmethod
    def find_all(cls, db=None, limit=100, skip=0):
        """Find all categories."""
        if db is None:
            db = current_app.db
            
        cursor = db[cls.collection_name].find().limit(limit).skip(skip)
        return [cls(category) for category in cursor]
    
    @classmethod
    def find_by_id(cls, category_id: str) -> Optional['Category']:
        """
        Find a category by ID.
        
        Args:
            category_id: The category ID
            
        Returns:
            Category object if found, None otherwise
        """
        if not category_id:
            return None
            
        # Handle both ObjectId and string IDs
        try:
            if ObjectId.is_valid(category_id):
                category = current_app.db[cls.collection_name].find_one({'_id': ObjectId(category_id)})
            else:
                category = current_app.db[cls.collection_name].find_one({'id': category_id})
                
            if not category:
                # Try the other field if not found
                category = current_app.db[cls.collection_name].find_one({'id': category_id})
                
            if category:
                return cls(category)
        except Exception as e:
            current_app.logger.error(f"Error finding category: {e}")
            
        return None
    
    @classmethod
    def find_by_slug(cls, slug: str) -> Optional['Category']:
        """
        Find a category by slug.
        
        Args:
            slug: The category slug
            
        Returns:
            Category object if found, None otherwise
        """
        try:
            category = current_app.db[cls.collection_name].find_one({'slug': slug})
            return cls(category) if category else None
        except Exception as e:
            current_app.logger.error(f"Error finding category by slug: {e}")
            return None
    
    @classmethod
    def find_by_name(cls, name: str) -> Optional['Category']:
        """
        Find a category by name.
        
        Args:
            name: The category name
            
        Returns:
            Category object if found, None otherwise
        """
        try:
            category = current_app.db[cls.collection_name].find_one({'name': name})
            return cls(category) if category else None
        except Exception as e:
            current_app.logger.error(f"Error finding category by name: {e}")
            return None
    
    def save(self) -> bool:
        """
        Save the category to the database.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            category_dict = self.to_dict()
            category_dict['updated_at'] = datetime.utcnow()
            
            # Remove id from the dictionary (it will be in _id)
            if 'id' in category_dict:
                del category_dict['id']
            
            if self.id:
                # Update existing category
                result = current_app.db[cls.collection_name].update_one(
                    {'_id': ObjectId(self.id)},
                    {'$set': category_dict}
                )
                return result.modified_count > 0
            else:
                # Insert new category
                result = current_app.db[cls.collection_name].insert_one(category_dict)
                self.id = str(result.inserted_id)
                return True
        except Exception as e:
            current_app.logger.error(f"Error saving category: {e}")
            return False
    
    def delete(self, db=None):
        """Delete the category from the database."""
        if db is None:
            db = current_app.db
            
        result = db[self.collection_name].delete_one({'_id': ObjectId(self.id)})
        return result.deleted_count > 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert category to dictionary."""
        category_dict = {
            'name': self.name,
            'description': self.description,
            'slug': self.slug,
            'level': self.level,
            'display_order': self.display_order,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        
        # Add ID if present
        if self.id:
            category_dict['id'] = self.id
        
        # Add optional fields if they exist
        if self.parent_id:
            category_dict['parent_id'] = self.parent_id
            
        if self.image_url:
            category_dict['image_url'] = self.image_url
            
        if self.icon:
            category_dict['icon'] = self.icon
            
        if self.seo:
            category_dict['seo'] = self.seo
            
        if self.meta:
            category_dict['meta'] = self.meta
            
        if self.deleted:
            category_dict['deleted'] = self.deleted
            
        if self.deleted_at:
            category_dict['deleted_at'] = self.deleted_at
        
        return category_dict
    
    def to_json(self):
        """Convert the category to a JSON-serializable dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'image': self.image_url,
            'created_at': self.created_at.isoformat() if hasattr(self.created_at, 'isoformat') else self.created_at,
            'updated_at': self.updated_at.isoformat() if hasattr(self.updated_at, 'isoformat') else self.updated_at
        } 