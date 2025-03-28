from typing import Dict, List, Optional
from flask import current_app
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId, regex
import re

from .base_repository import BaseRepository
from ..models.category import Category

class CategoryRepository(BaseRepository[Category]):
    """Repository for category database operations."""
    
    collection_name = 'categories'
    model_class = Category
    
    def __init__(self, db=None):
        """Initialize with database connection and create indexes."""
        super().__init__(db)
        self._create_indexes()
    
    def _create_indexes(self):
        """Create necessary indexes for the categories collection."""
        # Index for slug lookups (enforce uniqueness)
        self.create_index([("slug", ASCENDING)], unique=True)
        
        # Index for name lookups (for searching)
        self.create_index([("name", "text")])
        
        # Index for parent_id lookups (for hierarchy)
        self.create_index([("parent_id", ASCENDING)])
        
        # Index for created_at (for sorting)
        self.create_index([("created_at", DESCENDING)])
        
        # Index for soft delete queries
        self.create_index([("deleted", ASCENDING)])
    
    def find_by_slug(self, slug: str) -> Optional[Category]:
        """Find a category by its slug."""
        return self.find_one({"slug": slug})
    
    def find_by_name(self, name: str) -> Optional[Category]:
        """Find a category by its name."""
        return self.find_one({"name": name})
    
    def find_children(self, parent_id: str) -> List[Category]:
        """Find all child categories of a parent category."""
        return self.find_all({"parent_id": parent_id})
    
    def get_category_tree(self, include_deleted: bool = False) -> List[Dict]:
        """
        Get the full category hierarchy as a tree structure.
        
        Args:
            include_deleted: Whether to include soft-deleted categories
            
        Returns:
            List of top-level categories with nested children
        """
        # Get all categories
        query = {}
        if not include_deleted:
            query["$or"] = [
                {"deleted": {"$exists": False}},
                {"deleted": False}
            ]
        
        categories = self.find_all(query)
        
        # Convert to dictionary for easy lookup
        category_dict = {str(cat.id): cat.to_dict() for cat in categories}
        
        # Organize into tree structure
        tree = []
        for cat_id, category in category_dict.items():
            parent_id = category.get('parent_id')
            
            if not parent_id:
                # Top-level category
                category['children'] = []
                tree.append(category)
            elif parent_id in category_dict:
                # Child category
                if 'children' not in category_dict[parent_id]:
                    category_dict[parent_id]['children'] = []
                category['children'] = []
                category_dict[parent_id]['children'].append(category)
        
        return tree
    
    def get_ancestors(self, category_id: str) -> List[Category]:
        """
        Get all ancestor categories in order from root to immediate parent.
        
        Args:
            category_id: The category ID to find ancestors for
            
        Returns:
            List of ancestor categories
        """
        ancestors = []
        current = self.find_by_id(category_id)
        
        while current and 'parent_id' in current.to_dict() and current.parent_id:
            parent = self.find_by_id(current.parent_id)
            if parent:
                ancestors.insert(0, parent)  # Insert at beginning to maintain root->parent order
                current = parent
            else:
                break
        
        return ancestors
    
    def get_breadcrumb_path(self, category_id: str) -> List[Dict]:
        """
        Get breadcrumb path from root to this category.
        
        Args:
            category_id: The category ID to get breadcrumbs for
            
        Returns:
            List of {id, name, slug} dictionaries representing the path
        """
        breadcrumbs = []
        
        # Get the category itself
        category = self.find_by_id(category_id)
        if not category:
            return breadcrumbs
        
        # Add the category to breadcrumbs
        breadcrumbs.append({
            'id': str(category.id),
            'name': category.name,
            'slug': category.slug
        })
        
        # Get ancestors and add them to the beginning
        ancestors = self.get_ancestors(category_id)
        for ancestor in ancestors:
            breadcrumbs.insert(0, {
                'id': str(ancestor.id),
                'name': ancestor.name,
                'slug': ancestor.slug
            })
        
        return breadcrumbs
    
    def search(self, query: str, **kwargs) -> Dict:
        """
        Search categories by text and other filters.
        
        Args:
            query: Text to search for
            **kwargs: Additional filters like:
                - page: Page number
                - per_page: Items per page
                - parent_id: Filter by parent category
                - sort_by: Field to sort by
                - sort_order: Sort direction (asc or desc)
                
        Returns:
            Dictionary with items and pagination metadata
        """
        # Build the query
        search_query = {}
        
        # Text search
        if query:
            # Simple search (better for partial matches)
            search_regex = regex.Regex(f".*{re.escape(query)}.*", "i")
            search_query["$or"] = [
                {"name": search_regex},
                {"description": search_regex},
                {"slug": search_regex}
            ]
        
        # Parent category filter
        if "parent_id" in kwargs and kwargs["parent_id"]:
            if kwargs["parent_id"] == "root":
                # Root categories (no parent or null parent)
                search_query["$or"] = search_query.get("$or", []) + [
                    {"parent_id": {"$exists": False}},
                    {"parent_id": None}
                ]
            else:
                search_query["parent_id"] = kwargs["parent_id"]
        
        # Default to non-deleted items only
        if "include_deleted" not in kwargs or not kwargs["include_deleted"]:
            search_query["$or"] = search_query.get("$or", []) + [
                {"deleted": {"$exists": False}},
                {"deleted": False}
            ]
        
        # Prepare sort
        sort_field = kwargs.get("sort_by", "created_at")
        sort_direction = kwargs.get("sort_order", "desc").lower()
        sort = [(sort_field, sort_direction)]
        
        # Handle pagination
        page = int(kwargs.get("page", 1))
        per_page = min(int(kwargs.get("per_page", 20)), 100)  # Cap at 100 items
        
        # Execute query with pagination
        return self.find_with_pagination(
            query=search_query,
            sort=sort,
            page=page,
            per_page=per_page
        )
    
    def get_category_counts(self) -> Dict:
        """
        Get counts of categories.
        
        Returns:
            Dictionary with total categories and counts by level (root, etc)
        """
        try:
            total = self.count({"deleted": {"$ne": True}})
            
            # Count root categories
            root_count = self.count({
                "$or": [
                    {"parent_id": {"$exists": False}},
                    {"parent_id": None}
                ],
                "deleted": {"$ne": True}
            })
            
            # Count categories with children
            pipeline = [
                {"$match": {"deleted": {"$ne": True}}},
                {"$group": {"_id": "$parent_id", "count": {"$sum": 1}}},
                {"$match": {"_id": {"$ne": None}}},
                {"$count": "parents_with_children"}
            ]
            
            result = list(self.collection.aggregate(pipeline))
            parents_count = result[0]['parents_with_children'] if result else 0
            
            return {
                "total": total,
                "root": root_count,
                "parents": parents_count,
                "leaf": total - parents_count
            }
        except Exception as e:
            current_app.logger.error(f"Error getting category counts: {e}")
            return {
                "total": 0,
                "root": 0,
                "parents": 0,
                "leaf": 0
            } 