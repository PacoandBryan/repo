from datetime import datetime
from bson import ObjectId
from flask import current_app

class Category:
    """Category model for e-commerce catalog."""
    
    collection_name = 'categories'
    
    def __init__(self, category_data):
        """Initialize a category with the given data."""
        self.id = str(category_data.get('_id', ObjectId())) if '_id' in category_data else str(category_data.get('id', ObjectId()))
        self.name = category_data.get('name', '')
        self.description = category_data.get('description', '')
        self.image = category_data.get('image', '')
        self.created_at = category_data.get('created_at', datetime.utcnow())
        self.updated_at = category_data.get('updated_at', datetime.utcnow())
    
    @classmethod
    def find_all(cls, db=None, limit=100, skip=0):
        """Find all categories."""
        if db is None:
            db = current_app.db
            
        cursor = db[cls.collection_name].find().limit(limit).skip(skip)
        return [cls(category) for category in cursor]
    
    @classmethod
    def find_by_id(cls, category_id, db=None):
        """Find a category by its ID."""
        if db is None:
            db = current_app.db
        
        if not category_id:
            return None
            
        # Handle both ObjectId and string IDs
        try:
            if ObjectId.is_valid(category_id):
                category = db[cls.collection_name].find_one({'_id': ObjectId(category_id)})
            else:
                category = db[cls.collection_name].find_one({'id': category_id})
                
            if not category:
                # Try the other field if not found
                category = db[cls.collection_name].find_one({'id': category_id})
                
            if category:
                return cls(category)
        except Exception as e:
            current_app.logger.error(f"Error finding category: {e}")
            
        return None
    
    def save(self, db=None):
        """Save the category to the database."""
        if db is None:
            db = current_app.db
            
        self.updated_at = datetime.utcnow()
        
        category_dict = self.to_dict()
        if '_id' in category_dict and ObjectId.is_valid(category_dict['_id']):
            category_id = category_dict.pop('_id')
            db[self.collection_name].update_one(
                {'_id': ObjectId(category_id)},
                {'$set': category_dict}
            )
            return self
        else:
            result = db[self.collection_name].insert_one(category_dict)
            self.id = str(result.inserted_id)
            return self
    
    def delete(self, db=None):
        """Delete the category from the database."""
        if db is None:
            db = current_app.db
            
        result = db[self.collection_name].delete_one({'_id': ObjectId(self.id)})
        return result.deleted_count > 0
    
    def to_dict(self):
        """Convert the category to a dictionary."""
        try:
            _id = ObjectId(self.id) if self.id and ObjectId.is_valid(self.id) else self.id
        except:
            _id = self.id
            
        return {
            '_id': _id,
            'name': self.name,
            'description': self.description,
            'image': self.image,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def to_json(self):
        """Convert the category to a JSON-serializable dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'image': self.image,
            'created_at': self.created_at.isoformat() if hasattr(self.created_at, 'isoformat') else self.created_at,
            'updated_at': self.updated_at.isoformat() if hasattr(self.updated_at, 'isoformat') else self.updated_at
        } 