import os
import json
from datetime import datetime
from flask import current_app
from bson import ObjectId
from ..models.product import Product
from ..models.category import Category

class CatalogService:
    """Service for catalog management and JSON synchronization."""
    
    @staticmethod
    def get_catalog_path():
        """Get the path to the catalog JSON file."""
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        catalog_path = os.path.join(base_dir, 'data', 'catalog.json')
        return catalog_path
    
    @staticmethod
    def load_catalog_json():
        """Load the catalog from JSON file."""
        try:
            catalog_path = CatalogService.get_catalog_path()
            
            if not os.path.exists(catalog_path):
                # Create default catalog structure if file doesn't exist
                catalog_data = {
                    "products": [],
                    "categories": []
                }
                return catalog_data
                
            with open(catalog_path, 'r') as f:
                catalog_data = json.load(f)
                
            return catalog_data
        except Exception as e:
            current_app.logger.error(f"Error loading catalog JSON: {e}")
            return {"products": [], "categories": []}
    
    @staticmethod
    def save_catalog_json(catalog_data):
        """Save the catalog to JSON file."""
        try:
            catalog_path = CatalogService.get_catalog_path()
            
            # Ensure the directory exists
            os.makedirs(os.path.dirname(catalog_path), exist_ok=True)
            
            with open(catalog_path, 'w') as f:
                json.dump(catalog_data, f, indent=2)
                
            return True
        except Exception as e:
            current_app.logger.error(f"Error saving catalog JSON: {e}")
            return False
    
    @staticmethod
    def sync_database_to_json():
        """Synchronize the database to the JSON file."""
        try:
            db = current_app.db
            
            # Get all products and categories from database
            products = [product.to_json() for product in Product.find_all(db=db)]
            categories = [category.to_json() for category in Category.find_all(db=db)]
            
            catalog_data = {
                "products": products,
                "categories": categories
            }
            
            return CatalogService.save_catalog_json(catalog_data)
        except Exception as e:
            current_app.logger.error(f"Error syncing database to JSON: {e}")
            return False
    
    @staticmethod
    def sync_json_to_database():
        """Synchronize the JSON file to the database."""
        try:
            db = current_app.db
            catalog_data = CatalogService.load_catalog_json()
            
            # Clear existing collections
            db[Product.collection_name].delete_many({})
            db[Category.collection_name].delete_many({})
            
            # Insert all products and categories
            for product_data in catalog_data.get('products', []):
                product = Product(product_data)
                product.save(db=db)
                
            for category_data in catalog_data.get('categories', []):
                category = Category(category_data)
                category.save(db=db)
                
            return True
        except Exception as e:
            current_app.logger.error(f"Error syncing JSON to database: {e}")
            return False
    
    @staticmethod
    def get_catalog():
        """Get the full catalog from the database."""
        try:
            db = current_app.db
            
            products = [product.to_json() for product in Product.find_all(db=db)]
            categories = [category.to_json() for category in Category.find_all(db=db)]
            
            return {
                "products": products,
                "categories": categories
            }
        except Exception as e:
            current_app.logger.error(f"Error getting catalog: {e}")
            return {"products": [], "categories": []}
    
    @staticmethod
    def add_product(product_data):
        """Add a new product to the catalog."""
        try:
            db = current_app.db
            
            product = Product(product_data)
            product.save(db=db)
            
            # Sync to JSON
            CatalogService.sync_database_to_json()
            
            return product.to_json()
        except Exception as e:
            current_app.logger.error(f"Error adding product: {e}")
            return None
    
    @staticmethod
    def update_product(product_id, product_data):
        """Update a product in the catalog."""
        try:
            db = current_app.db
            
            existing_product = Product.find_by_id(product_id, db=db)
            if not existing_product:
                return None
                
            # Update product fields
            for key, value in product_data.items():
                if key != 'id' and key != '_id':
                    setattr(existing_product, key, value)
                    
            existing_product.save(db=db)
            
            # Sync to JSON
            CatalogService.sync_database_to_json()
            
            return existing_product.to_json()
        except Exception as e:
            current_app.logger.error(f"Error updating product: {e}")
            return None
    
    @staticmethod
    def delete_product(product_id):
        """Delete a product from the catalog."""
        try:
            db = current_app.db
            
            existing_product = Product.find_by_id(product_id, db=db)
            if not existing_product:
                return False
                
            result = existing_product.delete(db=db)
            
            # Sync to JSON
            CatalogService.sync_database_to_json()
            
            return result
        except Exception as e:
            current_app.logger.error(f"Error deleting product: {e}")
            return False
    
    @staticmethod
    def add_category(category_data):
        """Add a new category to the catalog."""
        try:
            db = current_app.db
            
            category = Category(category_data)
            category.save(db=db)
            
            # Sync to JSON
            CatalogService.sync_database_to_json()
            
            return category.to_json()
        except Exception as e:
            current_app.logger.error(f"Error adding category: {e}")
            return None
    
    @staticmethod
    def update_category(category_id, category_data):
        """Update a category in the catalog."""
        try:
            db = current_app.db
            
            existing_category = Category.find_by_id(category_id, db=db)
            if not existing_category:
                return None
                
            # Update category fields
            for key, value in category_data.items():
                if key != 'id' and key != '_id':
                    setattr(existing_category, key, value)
                    
            existing_category.save(db=db)
            
            # Sync to JSON
            CatalogService.sync_database_to_json()
            
            return existing_category.to_json()
        except Exception as e:
            current_app.logger.error(f"Error updating category: {e}")
            return None
    
    @staticmethod
    def delete_category(category_id):
        """Delete a category from the catalog."""
        try:
            db = current_app.db
            
            existing_category = Category.find_by_id(category_id, db=db)
            if not existing_category:
                return False
                
            result = existing_category.delete(db=db)
            
            # Sync to JSON
            CatalogService.sync_database_to_json()
            
            return result
        except Exception as e:
            current_app.logger.error(f"Error deleting category: {e}")
            return False 