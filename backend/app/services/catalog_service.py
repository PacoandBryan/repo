import os
import json
import csv
import io
import uuid
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any, Tuple, Optional, Union
from flask import current_app
from bson import ObjectId
import hashlib
import asyncio
import concurrent.futures
from ..models.product import Product
from ..models.category import Category
from ..utils.validators import validate_product, validate_category

class CatalogService:
    """Service for processing catalog data uploads and managing catalog operations."""
    
    def __init__(self, db=None):
        """Initialize with optional database connection."""
        self.db = db or current_app.db
        self.processing_queue = []
        self.processing_status = {}
        
    async def process_catalog_file(self, file_path: str, entity_type: str, 
                                  options: Dict = None) -> Dict:
        """
        Process an uploaded catalog file asynchronously.
        
        Args:
            file_path: Path to the uploaded file
            entity_type: Type of entity (product, category)
            options: Processing options like conflict resolution strategy
            
        Returns:
            Dictionary with processing results
        """
        # Generate a processing ID for tracking
        process_id = str(uuid.uuid4())
        
        # Set initial status
        self.processing_status[process_id] = {
            'status': 'queued',
            'progress': 0,
            'total_items': 0,
            'processed_items': 0,
            'successful_items': 0,
            'failed_items': 0,
            'errors': [],
            'warnings': [],
            'start_time': datetime.utcnow(),
            'end_time': None
        }
        
        # Queue for processing
        self.processing_queue.append({
            'process_id': process_id,
            'file_path': file_path,
            'entity_type': entity_type,
            'options': options or {}
        })
        
        # Start processing in background
        asyncio.create_task(self._process_file(process_id, file_path, entity_type, options or {}))
        
        return {
            'process_id': process_id,
            'status': 'queued'
        }
    
    async def _process_file(self, process_id: str, file_path: str, 
                           entity_type: str, options: Dict) -> None:
        """
        Internal method to process a file in the background.
        """
        try:
            # Update status to processing
            self.processing_status[process_id]['status'] = 'processing'
            
            # Determine file type and parse accordingly
            file_ext = os.path.splitext(file_path)[1].lower()
            
            if file_ext == '.csv':
                data = await self._parse_csv(file_path)
            elif file_ext == '.json':
                data = await self._parse_json(file_path)
            elif file_ext in ['.xlsx', '.xls']:
                data = await self._parse_excel(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_ext}")
            
            # Update status with total items
            self.processing_status[process_id]['total_items'] = len(data)
            
            # Process each item with concurrency
            with concurrent.futures.ThreadPoolExecutor() as executor:
                if entity_type == 'product':
                    future_to_item = {
                        executor.submit(self._process_product_item, item, options): 
                        (i, item) for i, item in enumerate(data)
                    }
                elif entity_type == 'category':
                    future_to_item = {
                        executor.submit(self._process_category_item, item, options): 
                        (i, item) for i, item in enumerate(data)
                    }
                else:
                    raise ValueError(f"Unsupported entity type: {entity_type}")
                
                for future in concurrent.futures.as_completed(future_to_item):
                    idx, item = future_to_item[future]
                    try:
                        result = future.result()
                        if result.get('success'):
                            self.processing_status[process_id]['successful_items'] += 1
                        else:
                            self.processing_status[process_id]['failed_items'] += 1
                            self.processing_status[process_id]['errors'].append({
                                'item': idx,
                                'error': result.get('error')
                            })
                        
                        # Update progress
                        self.processing_status[process_id]['processed_items'] += 1
                        progress = (self.processing_status[process_id]['processed_items'] / 
                                    self.processing_status[process_id]['total_items']) * 100
                        self.processing_status[process_id]['progress'] = round(progress, 2)
                        
                    except Exception as e:
                        self.processing_status[process_id]['failed_items'] += 1
                        self.processing_status[process_id]['errors'].append({
                            'item': idx,
                            'error': str(e)
                        })
            
            # Update final status
            self.processing_status[process_id]['status'] = 'completed'
            self.processing_status[process_id]['end_time'] = datetime.utcnow()
            
        except Exception as e:
            # Update status to failed
            self.processing_status[process_id]['status'] = 'failed'
            self.processing_status[process_id]['errors'].append({
                'error': str(e)
            })
            self.processing_status[process_id]['end_time'] = datetime.utcnow()
            
            # Log error
            if current_app:
                current_app.logger.error(f"Error processing catalog file: {e}")
    
    async def _parse_csv(self, file_path: str) -> List[Dict]:
        """Parse CSV file into a list of dictionaries."""
        try:
            # Use pandas for efficient CSV parsing
            df = pd.read_csv(file_path)
            return df.to_dict('records')
        except Exception as e:
            if current_app:
                current_app.logger.error(f"Error parsing CSV file: {e}")
            raise ValueError(f"Failed to parse CSV file: {str(e)}")
    
    async def _parse_json(self, file_path: str) -> List[Dict]:
        """Parse JSON file into a list of dictionaries."""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Handle both array and object formats
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and 'items' in data:
                return data['items']
            elif isinstance(data, dict):
                # Single item
                return [data]
            else:
                raise ValueError("Invalid JSON format, expected array or object with 'items' property")
        except Exception as e:
            if current_app:
                current_app.logger.error(f"Error parsing JSON file: {e}")
            raise ValueError(f"Failed to parse JSON file: {str(e)}")
    
    async def _parse_excel(self, file_path: str) -> List[Dict]:
        """Parse Excel file into a list of dictionaries."""
        try:
            # Use pandas for efficient Excel parsing
            df = pd.read_excel(file_path)
            return df.to_dict('records')
        except Exception as e:
            if current_app:
                current_app.logger.error(f"Error parsing Excel file: {e}")
            raise ValueError(f"Failed to parse Excel file: {str(e)}")
    
    def _process_product_item(self, item: Dict, options: Dict) -> Dict:
        """
        Process a single product item with validation, normalization, and storage.
        Handles conflict resolution based on options.
        """
        try:
            # Normalize data
            normalized_item = self._normalize_product_data(item)
            
            # Validate data
            errors = validate_product(normalized_item)
            if errors:
                return {'success': False, 'error': errors}
            
            # Check for duplicates/conflicts
            existing_product = None
            if 'sku' in normalized_item:
                existing_product = Product.find_by_sku(normalized_item['sku'])
            elif 'slug' in normalized_item:
                existing_product = Product.find_by_slug(normalized_item['slug'])
            
            # Handle conflict resolution
            if existing_product:
                conflict_strategy = options.get('conflict_strategy', 'skip')
                
                if conflict_strategy == 'skip':
                    return {'success': True, 'skipped': True, 'message': 'Item already exists'}
                
                elif conflict_strategy == 'overwrite':
                    # Update existing product
                    for key, value in normalized_item.items():
                        setattr(existing_product, key, value)
                    
                    # Ensure ID consistency
                    existing_product.id = str(existing_product.id)
                    
                    # Save with transaction
                    existing_product.save()
                    return {'success': True, 'updated': True}
                
                elif conflict_strategy == 'merge':
                    # Merge data (keep existing values if not provided in new data)
                    for key, value in normalized_item.items():
                        if value is not None:
                            setattr(existing_product, key, value)
                    
                    # Ensure ID consistency
                    existing_product.id = str(existing_product.id)
                    
                    # Save with transaction
                    existing_product.save()
                    return {'success': True, 'merged': True}
                
                else:
                    return {'success': False, 'error': f"Unknown conflict strategy: {conflict_strategy}"}
            
            # Create new product
            product = Product(normalized_item)
            product.save()
            
            # Return success
            return {'success': True, 'created': True}
            
        except Exception as e:
            if current_app:
                current_app.logger.error(f"Error processing product item: {e}")
            return {'success': False, 'error': str(e)}
    
    def _process_category_item(self, item: Dict, options: Dict) -> Dict:
        """
        Process a single category item with validation, normalization, and storage.
        Handles conflict resolution based on options.
        """
        try:
            # Normalize data
            normalized_item = self._normalize_category_data(item)
            
            # Validate data
            errors = validate_category(normalized_item)
            if errors:
                return {'success': False, 'error': errors}
            
            # Check for duplicates/conflicts
            existing_category = None
            if 'slug' in normalized_item:
                existing_category = Category.find_by_slug(normalized_item['slug'])
            elif 'name' in normalized_item:
                existing_category = Category.find_by_name(normalized_item['name'])
            
            # Handle conflict resolution
            if existing_category:
                conflict_strategy = options.get('conflict_strategy', 'skip')
                
                if conflict_strategy == 'skip':
                    return {'success': True, 'skipped': True, 'message': 'Item already exists'}
                
                elif conflict_strategy == 'overwrite':
                    # Update existing category
                    for key, value in normalized_item.items():
                        setattr(existing_category, key, value)
                    
                    # Ensure ID consistency
                    existing_category.id = str(existing_category.id)
                    
                    # Save with transaction
                    existing_category.save()
                    return {'success': True, 'updated': True}
                
                elif conflict_strategy == 'merge':
                    # Merge data (keep existing values if not provided in new data)
                    for key, value in normalized_item.items():
                        if value is not None:
                            setattr(existing_category, key, value)
                    
                    # Ensure ID consistency
                    existing_category.id = str(existing_category.id)
                    
                    # Save with transaction
                    existing_category.save()
                    return {'success': True, 'merged': True}
                
                else:
                    return {'success': False, 'error': f"Unknown conflict strategy: {conflict_strategy}"}
            
            # Create new category
            category = Category(normalized_item)
            category.save()
            
            # Return success
            return {'success': True, 'created': True}
            
        except Exception as e:
            if current_app:
                current_app.logger.error(f"Error processing category item: {e}")
            return {'success': False, 'error': str(e)}
    
    def _normalize_product_data(self, data: Dict) -> Dict:
        """Normalize product data to match the database schema."""
        normalized = {}
        
        # Map common field names to our schema
        field_mapping = {
            'product_name': 'title',
            'name': 'title',
            'product_description': 'description',
            'desc': 'description',
            'product_price': 'price',
            'cost': 'price',
            'product_sku': 'sku',
            'item_number': 'sku',
            'product_id': 'sku',
            'product_category': 'category_id',
            'category': 'category_id'
        }
        
        # Apply field mapping
        for key, value in data.items():
            if key in field_mapping:
                normalized[field_mapping[key]] = value
            else:
                normalized[key] = value
        
        # Handle special cases for multi-language fields
        if 'title' in normalized and not isinstance(normalized['title'], dict):
            normalized['title'] = {'en': normalized['title']}
            
        if 'description' in normalized and not isinstance(normalized['description'], dict):
            normalized['description'] = {'en': normalized['description']}
        
        # Convert price to float if needed
        if 'price' in normalized and not isinstance(normalized['price'], (int, float)):
            try:
                # Remove currency symbols and commas
                price_str = str(normalized['price']).replace('$', '').replace(',', '')
                normalized['price'] = float(price_str)
            except:
                # Keep as is if conversion fails
                pass
        
        # Generate slug if not provided
        if 'slug' not in normalized and 'title' in normalized:
            title = ''
            if isinstance(normalized['title'], dict) and 'en' in normalized['title']:
                title = normalized['title']['en']
            elif isinstance(normalized['title'], str):
                title = normalized['title']
                
            if title:
                import re
                # Convert to lowercase, replace spaces with hyphens, remove special chars
                slug = re.sub(r'[^\w\-]', '', title.lower().replace(' ', '-'))
                # Replace multiple hyphens with single hyphen
                slug = re.sub(r'-+', '-', slug)
                normalized['slug'] = slug
        
        # Set default status if not provided
        if 'status' not in normalized:
            normalized['status'] = 'active'
            
        # Set timestamps
        if 'created_at' not in normalized:
            normalized['created_at'] = datetime.utcnow()
            
        normalized['updated_at'] = datetime.utcnow()
        
        return normalized
    
    def _normalize_category_data(self, data: Dict) -> Dict:
        """Normalize category data to match the database schema."""
        normalized = {}
        
        # Map common field names to our schema
        field_mapping = {
            'category_name': 'name',
            'category_description': 'description',
            'desc': 'description',
            'parent': 'parent_id',
            'parent_category': 'parent_id'
        }
        
        # Apply field mapping
        for key, value in data.items():
            if key in field_mapping:
                normalized[field_mapping[key]] = value
            else:
                normalized[key] = value
        
        # Generate slug if not provided
        if 'slug' not in normalized and 'name' in normalized:
            import re
            # Convert to lowercase, replace spaces with hyphens, remove special chars
            slug = re.sub(r'[^\w\-]', '', normalized['name'].lower().replace(' ', '-'))
            # Replace multiple hyphens with single hyphen
            slug = re.sub(r'-+', '-', slug)
            normalized['slug'] = slug
        
        # Set timestamps
        if 'created_at' not in normalized:
            normalized['created_at'] = datetime.utcnow()
            
        normalized['updated_at'] = datetime.utcnow()
        
        return normalized
    
    def get_processing_status(self, process_id: str) -> Dict:
        """Get the current status of a processing job."""
        if process_id in self.processing_status:
            return self.processing_status[process_id]
        return {'status': 'not_found', 'error': 'Processing job not found'}
        
    def enrich_product_data(self, product_data: Dict) -> Dict:
        """
        Enrich product data with additional information.
        
        This could include:
        - Fetching related products
        - Calculating discounts
        - Adding SEO metadata
        - Retrieving real-time inventory
        """
        # Enrich with category data if available
        if 'category_id' in product_data:
            category = Category.find_by_id(product_data['category_id'])
            if category:
                product_data['category'] = category.to_dict()
        
        # Calculate sale price if not set but has discount
        if 'sale_price' not in product_data and 'discount_percent' in product_data:
            if 'price' in product_data:
                discount = float(product_data['discount_percent']) / 100
                product_data['sale_price'] = round(product_data['price'] * (1 - discount), 2)
        
        # Add SEO metadata
        if 'seo' not in product_data:
            product_data['seo'] = {}
            
            # Generate SEO title if not set
            if 'title' not in product_data['seo'] and 'title' in product_data:
                if isinstance(product_data['title'], dict) and 'en' in product_data['title']:
                    product_data['seo']['title'] = product_data['title']['en']
                elif isinstance(product_data['title'], str):
                    product_data['seo']['title'] = product_data['title']
            
            # Generate SEO description if not set
            if 'description' not in product_data['seo'] and 'description' in product_data:
                if isinstance(product_data['description'], dict) and 'en' in product_data['description']:
                    desc = product_data['description']['en']
                    # Truncate to reasonable length for meta description
                    product_data['seo']['description'] = desc[:160] + ('...' if len(desc) > 160 else '')
                elif isinstance(product_data['description'], str):
                    desc = product_data['description']
                    product_data['seo']['description'] = desc[:160] + ('...' if len(desc) > 160 else '')
        
        return product_data 