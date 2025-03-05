from datetime import datetime
from bson import ObjectId
from flask import current_app

class Product:
    """Product model for e-commerce catalog."""
    
    collection_name = 'products'
    
    def __init__(self, product_data):
        """Initialize a product with the given data."""
        self.id = str(product_data.get('_id', ObjectId())) if '_id' in product_data else str(product_data.get('id', ObjectId()))
        self.name = product_data.get('name', '')
        self.price = float(product_data.get('price', 0.0))
        self.description = product_data.get('description', '')
        self.image = product_data.get('image', '')
        self.category = product_data.get('category', '')
        self.inStock = product_data.get('inStock', True)
        self.created_at = product_data.get('created_at', datetime.utcnow())
        self.updated_at = product_data.get('updated_at', datetime.utcnow())
    
    @classmethod
    def find_all(cls, db=None, limit=100, skip=0, **filters):
        """Find all products matching the filters."""
        if db is None:
            db = current_app.db
            
        query = {}
        for key, value in filters.items():
            if value is not None:
                query[key] = value
                
        cursor = db[cls.collection_name].find(query).limit(limit).skip(skip)
        return [cls(product) for product in cursor]
    
    @classmethod
    def find_by_id(cls, product_id, db=None):
        """Find a product by its ID."""
        if db is None:
            db = current_app.db
            
        product = db[cls.collection_name].find_one({'_id': ObjectId(product_id)})
        if product:
            return cls(product)
        return None
        
    @classmethod
    def find_by_category(cls, category_id, db=None, limit=100, skip=0):
        """Find all products in a category."""
        if db is None:
            db = current_app.db
            
        cursor = db[cls.collection_name].find({'category': category_id}).limit(limit).skip(skip)
        return [cls(product) for product in cursor]
    
    def save(self, db=None):
        """Save the product to the database."""
        if db is None:
            db = current_app.db
            
        self.updated_at = datetime.utcnow()
        
        product_dict = self.to_dict()
        if '_id' in product_dict:
            product_id = product_dict.pop('_id')
            db[self.collection_name].update_one(
                {'_id': ObjectId(product_id)},
                {'$set': product_dict}
            )
            return self
        else:
            result = db[self.collection_name].insert_one(product_dict)
            self.id = str(result.inserted_id)
            return self
    
    def delete(self, db=None):
        """Delete the product from the database."""
        if db is None:
            db = current_app.db
            
        result = db[self.collection_name].delete_one({'_id': ObjectId(self.id)})
        return result.deleted_count > 0
    
    def to_dict(self):
        """Convert the product to a dictionary."""
        return {
            '_id': ObjectId(self.id) if self.id else ObjectId(),
            'name': self.name,
            'price': self.price,
            'description': self.description,
            'image': self.image,
            'category': self.category,
            'inStock': self.inStock,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def to_json(self):
        """Convert the product to a JSON-serializable dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'description': self.description,
            'image': self.image,
            'category': self.category,
            'inStock': self.inStock,
            'created_at': self.created_at.isoformat() if hasattr(self.created_at, 'isoformat') else self.created_at,
            'updated_at': self.updated_at.isoformat() if hasattr(self.updated_at, 'isoformat') else self.updated_at
        } 