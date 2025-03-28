from typing import List, Dict, Any, Optional, Union, Type, TypeVar, Generic
from bson import ObjectId
from flask import current_app
import pymongo
from datetime import datetime
import logging

T = TypeVar('T')

class BaseRepository(Generic[T]):
    """
    Base repository class for database operations.
    Provides common CRUD operations and query patterns.
    """
    
    collection_name = None
    model_class = None
    
    def __init__(self, db=None):
        """Initialize with optional database connection."""
        self.db = db or current_app.db
        
        if not self.collection_name:
            raise ValueError("collection_name must be defined in subclass")
        
        if not self.model_class:
            raise ValueError("model_class must be defined in subclass")
    
    @property
    def collection(self):
        """Get the MongoDB collection."""
        return self.db[self.collection_name]
    
    def find_by_id(self, id: str) -> Optional[T]:
        """Find document by ID."""
        try:
            document = self.collection.find_one({"_id": ObjectId(id)})
            return self.model_class(document) if document else None
        except Exception as e:
            logging.error(f"Error in find_by_id: {str(e)}")
            return None
    
    def find_one(self, query: Dict) -> Optional[T]:
        """Find a single document by query."""
        try:
            document = self.collection.find_one(query)
            return self.model_class(document) if document else None
        except Exception as e:
            logging.error(f"Error in find_one: {str(e)}")
            return None
    
    def find_all(self, 
                query: Dict = None, 
                sort: List[tuple] = None, 
                limit: int = None, 
                skip: int = None) -> List[T]:
        """
        Find documents by query with sorting and pagination.
        
        Args:
            query: The query to filter documents
            sort: List of (field, direction) tuples for sorting
            limit: Maximum number of documents to return
            skip: Number of documents to skip
            
        Returns:
            List of model instances
        """
        try:
            # Convert sort tuple list to pymongo format
            sort_list = None
            if sort:
                sort_list = []
                for field, direction in sort:
                    sort_dir = pymongo.ASCENDING if direction.lower() == 'asc' else pymongo.DESCENDING
                    sort_list.append((field, sort_dir))
            
            cursor = self.collection.find(query or {})
            
            if sort_list:
                cursor = cursor.sort(sort_list)
            
            if skip is not None:
                cursor = cursor.skip(skip)
            
            if limit is not None:
                cursor = cursor.limit(limit)
            
            return [self.model_class(doc) for doc in cursor]
        except Exception as e:
            logging.error(f"Error in find_all: {str(e)}")
            return []
    
    def count(self, query: Dict = None) -> int:
        """Count documents matching query."""
        try:
            return self.collection.count_documents(query or {})
        except Exception as e:
            logging.error(f"Error in count: {str(e)}")
            return 0
    
    def create(self, data: Dict) -> Optional[T]:
        """Create a new document."""
        try:
            # Set timestamps
            if 'created_at' not in data:
                data['created_at'] = datetime.utcnow()
            data['updated_at'] = datetime.utcnow()
            
            # Create model instance to validate
            model = self.model_class(data)
            
            # Insert into database
            result = self.collection.insert_one(model.to_dict())
            
            # Update model with generated ID
            model.id = str(result.inserted_id)
            
            return model
        except Exception as e:
            logging.error(f"Error in create: {str(e)}")
            return None
    
    def update(self, id: str, data: Dict) -> Optional[T]:
        """Update an existing document."""
        try:
            # Set updated timestamp
            data['updated_at'] = datetime.utcnow()
            
            # Get existing document
            existing = self.find_by_id(id)
            if not existing:
                return None
            
            # Update fields
            for key, value in data.items():
                if key not in ('id', '_id'):
                    setattr(existing, key, value)
            
            # Save to database
            self.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": existing.to_dict()}
            )
            
            return existing
        except Exception as e:
            logging.error(f"Error in update: {str(e)}")
            return None
    
    def delete(self, id: str) -> bool:
        """Delete a document by ID."""
        try:
            result = self.collection.delete_one({"_id": ObjectId(id)})
            return result.deleted_count > 0
        except Exception as e:
            logging.error(f"Error in delete: {str(e)}")
            return False
    
    def soft_delete(self, id: str) -> bool:
        """Soft delete a document by setting deleted flag."""
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(id)},
                {
                    "$set": {
                        "deleted": True,
                        "deleted_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error in soft_delete: {str(e)}")
            return False
    
    def restore(self, id: str) -> bool:
        """Restore a soft-deleted document."""
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(id)},
                {
                    "$set": {
                        "deleted": False,
                        "restored_at": datetime.utcnow()
                    },
                    "$unset": {
                        "deleted_at": ""
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error in restore: {str(e)}")
            return False
    
    def bulk_insert(self, items: List[Dict]) -> int:
        """Insert multiple documents at once."""
        try:
            # Set timestamps for all items
            now = datetime.utcnow()
            for item in items:
                if 'created_at' not in item:
                    item['created_at'] = now
                item['updated_at'] = now
            
            # Convert to dictionaries if needed
            dicts = []
            for item in items:
                if isinstance(item, dict):
                    dicts.append(item)
                else:
                    dicts.append(item.to_dict())
            
            result = self.collection.insert_many(dicts)
            return len(result.inserted_ids)
        except Exception as e:
            logging.error(f"Error in bulk_insert: {str(e)}")
            return 0
    
    def find_with_pagination(self, 
                            query: Dict = None, 
                            sort: List[tuple] = None,
                            page: int = 1, 
                            per_page: int = 20) -> Dict:
        """
        Find documents with pagination details.
        
        Args:
            query: The query to filter documents
            sort: List of (field, direction) tuples for sorting
            page: Page number (1-based)
            per_page: Number of items per page
            
        Returns:
            Dictionary with items and pagination metadata
        """
        try:
            # Calculate skip value
            skip = (page - 1) * per_page
            
            # Get items for current page
            items = self.find_all(
                query=query,
                sort=sort,
                limit=per_page,
                skip=skip
            )
            
            # Get total count for pagination
            total = self.count(query)
            
            # Calculate pagination metadata
            total_pages = (total + per_page - 1) // per_page if total > 0 else 1
            has_next = page < total_pages
            has_prev = page > 1
            
            return {
                'items': items,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'total_pages': total_pages,
                    'has_next': has_next,
                    'has_prev': has_prev
                }
            }
        except Exception as e:
            logging.error(f"Error in find_with_pagination: {str(e)}")
            return {'items': [], 'pagination': {}}
    
    def create_index(self, keys, unique=False, sparse=False, ttl=None):
        """Create an index on the collection."""
        try:
            index_options = {
                'unique': unique,
                'sparse': sparse
            }
            
            if ttl is not None:
                index_options['expireAfterSeconds'] = ttl
                
            self.collection.create_index(keys, **index_options)
            return True
        except Exception as e:
            logging.error(f"Error creating index: {str(e)}")
            return False
    
    def execute_transaction(self, operations):
        """
        Execute multiple operations in a transaction.
        
        Args:
            operations: A function that takes the session and performs database operations
            
        Returns:
            Result of the transaction
        """
        try:
            with self.db.client.start_session() as session:
                with session.start_transaction():
                    return operations(session)
        except Exception as e:
            logging.error(f"Error in transaction: {str(e)}")
            return None
    
    def get_distinct_values(self, field: str, query: Dict = None) -> List:
        """Get distinct values for a field."""
        try:
            return self.collection.distinct(field, query or {})
        except Exception as e:
            logging.error(f"Error in get_distinct_values: {str(e)}")
            return [] 