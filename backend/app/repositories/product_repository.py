from typing import Dict, List, Optional
from flask import current_app
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId, regex
import re

from .base_repository import BaseRepository
from ..models.product import Product

class ProductRepository(BaseRepository[Product]):
    """Repository for product database operations."""
    
    collection_name = 'products'
    model_class = Product
    
    def __init__(self, db=None):
        """Initialize with database connection and create indexes."""
        super().__init__(db)
        self._create_indexes()
    
    def _create_indexes(self):
        """Create necessary indexes for the products collection."""
        # Index for slug lookups (enforce uniqueness)
        self.create_index([("slug", ASCENDING)], unique=True)
        
        # Index for SKU lookups (enforce uniqueness)
        self.create_index([("sku", ASCENDING)], unique=True, sparse=True)
        
        # Index for category_id lookups
        self.create_index([("category_id", ASCENDING)])
        
        # Index for searches by title
        self.create_index([("title.en", "text")])
        
        # Compound index for status + featured (common query pattern)
        self.create_index([("status", ASCENDING), ("featured", DESCENDING)])
        
        # Index for price range queries
        self.create_index([("price", ASCENDING)])
        
        # Index for created_at (for sorting by newest)
        self.create_index([("created_at", DESCENDING)])
        
        # Index for soft delete queries
        self.create_index([("deleted", ASCENDING)])
    
    def find_by_slug(self, slug: str) -> Optional[Product]:
        """Find a product by its slug."""
        return self.find_one({"slug": slug})
    
    def find_by_sku(self, sku: str) -> Optional[Product]:
        """Find a product by its SKU."""
        return self.find_one({"sku": sku})
    
    def find_by_category(self, category_id: str, include_subcategories: bool = False) -> List[Product]:
        """
        Find products by category.
        
        Args:
            category_id: The category ID
            include_subcategories: Whether to include products from subcategories
            
        Returns:
            List of products
        """
        if include_subcategories:
            return self.find_all({
                "$or": [
                    {"category_id": category_id},
                    {"subcategory_ids": category_id}
                ]
            })
        return self.find_all({"category_id": category_id})
    
    def search(self, query: str, **kwargs) -> Dict:
        """
        Search products by text and various filters.
        
        Args:
            query: Text to search for
            **kwargs: Additional filters like:
                - page: Page number
                - per_page: Items per page
                - category_id: Filter by category
                - min_price: Minimum price
                - max_price: Maximum price
                - status: Product status (active, draft, etc.)
                - featured: Whether product is featured
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
                {"title.en": search_regex},
                {"description.en": search_regex},
                {"sku": search_regex},
                {"tags": query}
            ]
            
            # Full text search (good for relevance but requires whole words)
            # Uncomment to use instead of or in addition to regex search
            # search_query["$text"] = {"$search": query}
        
        # Category filter
        if "category_id" in kwargs and kwargs["category_id"]:
            if kwargs.get("include_subcategories", False):
                search_query["$or"] = [
                    {"category_id": kwargs["category_id"]},
                    {"subcategory_ids": kwargs["category_id"]}
                ]
            else:
                search_query["category_id"] = kwargs["category_id"]
        
        # Price range filter
        price_filter = {}
        if "min_price" in kwargs and kwargs["min_price"] is not None:
            price_filter["$gte"] = float(kwargs["min_price"])
        if "max_price" in kwargs and kwargs["max_price"] is not None:
            price_filter["$lte"] = float(kwargs["max_price"])
        if price_filter:
            search_query["price"] = price_filter
        
        # Status filter
        if "status" in kwargs and kwargs["status"]:
            search_query["status"] = kwargs["status"]
        
        # Featured filter
        if "featured" in kwargs:
            search_query["featured"] = kwargs["featured"]
        
        # Default to non-deleted items only
        if "include_deleted" not in kwargs or not kwargs["include_deleted"]:
            search_query["$or"] = search_query.get("$or", []) + [
                {"deleted": {"$exists": False}},
                {"deleted": False}
            ]
        
        # Tags filter
        if "tags" in kwargs and kwargs["tags"]:
            if isinstance(kwargs["tags"], list):
                search_query["tags"] = {"$in": kwargs["tags"]}
            else:
                search_query["tags"] = kwargs["tags"]
        
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
    
    def get_featured_products(self, limit: int = 10) -> List[Product]:
        """Get featured products."""
        return self.find_all(
            query={"featured": True, "status": "active"},
            sort=[("created_at", "desc")],
            limit=limit
        )
    
    def get_new_arrivals(self, limit: int = 10) -> List[Product]:
        """Get newest products."""
        return self.find_all(
            query={"status": "active"},
            sort=[("created_at", "desc")],
            limit=limit
        )
    
    def find_related_products(self, product_id: str, limit: int = 4) -> List[Product]:
        """
        Find products related to the given product.
        Uses category, tags, and other metadata to find similar products.
        """
        product = self.find_by_id(product_id)
        if not product:
            return []
        
        # Find by same category and/or tags
        query = {
            "_id": {"$ne": ObjectId(product_id)},  # Exclude current product
            "status": "active",
            "$or": []
        }
        
        # Add category condition if available
        if product.category_id:
            query["$or"].append({"category_id": product.category_id})
        
        # Add tags condition if available
        if product.tags and len(product.tags) > 0:
            query["$or"].append({"tags": {"$in": product.tags}})
        
        # Fallback if no conditions were added
        if not query["$or"]:
            del query["$or"]
        
        return self.find_all(
            query=query,
            limit=limit,
            sort=[("featured", "desc"), ("created_at", "desc")]
        )
    
    def update_inventory(self, product_id: str, quantity_change: int) -> bool:
        """
        Update product inventory.
        
        Args:
            product_id: Product ID
            quantity_change: Positive or negative quantity change
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Use atomic update to prevent race conditions
            result = self.collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$inc": {"inventory": quantity_change}}
            )
            return result.modified_count > 0
        except Exception as e:
            current_app.logger.error(f"Error updating inventory: {e}")
            return False
    
    def get_low_inventory_products(self, threshold: int = 5) -> List[Product]:
        """Get products with low inventory."""
        return self.find_all({
            "inventory": {"$lte": threshold},
            "inventory": {"$gt": 0},
            "status": "active"
        })
    
    def get_out_of_stock_products(self) -> List[Product]:
        """Get products that are out of stock."""
        return self.find_all({
            "$or": [
                {"inventory": 0},
                {"inventory": {"$exists": False}}
            ],
            "status": "active"
        })
    
    def get_product_counts_by_category(self) -> Dict:
        """Get count of products in each category."""
        try:
            pipeline = [
                {"$match": {"status": "active"}},
                {"$group": {"_id": "$category_id", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            
            result = list(self.collection.aggregate(pipeline))
            return {str(item["_id"]): item["count"] for item in result}
        except Exception as e:
            current_app.logger.error(f"Error getting product counts: {e}")
            return {}
    
    def get_price_range(self) -> Dict:
        """Get the minimum and maximum product prices."""
        try:
            min_price = None
            max_price = None
            
            # Find minimum price
            min_result = self.collection.find_one(
                {"status": "active", "price": {"$exists": True, "$ne": None}},
                sort=[("price", 1)]
            )
            if min_result:
                min_price = min_result.get("price")
            
            # Find maximum price
            max_result = self.collection.find_one(
                {"status": "active", "price": {"$exists": True, "$ne": None}},
                sort=[("price", -1)]
            )
            if max_result:
                max_price = max_result.get("price")
            
            return {
                "min_price": min_price,
                "max_price": max_price
            }
        except Exception as e:
            current_app.logger.error(f"Error getting price range: {e}")
            return {"min_price": None, "max_price": None}
    
    def get_all_tags(self) -> List[str]:
        """Get all unique tags used in products."""
        try:
            return self.collection.distinct("tags", {"status": "active"})
        except Exception as e:
            current_app.logger.error(f"Error getting tags: {e}")
            return [] 