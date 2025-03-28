from datetime import datetime
from bson import ObjectId
from flask import current_app
import os
import uuid

class File:
    """File model for storing file metadata."""
    
    collection_name = 'files'
    
    def __init__(self, file_data):
        """Initialize a file with the given data."""
        self.id = str(file_data.get('_id', ObjectId())) if '_id' in file_data else str(file_data.get('id', ObjectId()))
        self.original_filename = file_data.get('original_filename', '')
        self.filename = file_data.get('filename', '')
        self.filepath = file_data.get('filepath', '')
        self.mime_type = file_data.get('mime_type', '')
        self.size = file_data.get('size', 0)
        self.width = file_data.get('width')
        self.height = file_data.get('height')
        self.extension = file_data.get('extension', '')
        self.checksum = file_data.get('checksum', '')
        self.upload_id = file_data.get('upload_id', '')
        self.chunk_size = file_data.get('chunk_size')
        self.total_chunks = file_data.get('total_chunks')
        self.chunks_received = file_data.get('chunks_received', [])
        self.status = file_data.get('status', 'pending')  # pending, processing, completed, failed
        self.error = file_data.get('error', '')
        self.metadata = file_data.get('metadata', {})
        self.tags = file_data.get('tags', [])
        self.entity_type = file_data.get('entity_type', '')  # product, category, etc.
        self.entity_id = file_data.get('entity_id', '')
        self.is_public = file_data.get('is_public', True)
        self.created_at = file_data.get('created_at', datetime.utcnow())
        self.updated_at = file_data.get('updated_at', datetime.utcnow())
    
    @classmethod
    def find_by_id(cls, file_id, db=None):
        """Find a file by ID."""
        if db is None:
            db = current_app.db
        
        file_data = db[cls.collection_name].find_one({'_id': ObjectId(file_id)})
        return cls(file_data) if file_data else None
    
    @classmethod
    def find_by_upload_id(cls, upload_id, db=None):
        """Find a file by upload ID."""
        if db is None:
            db = current_app.db
        
        file_data = db[cls.collection_name].find_one({'upload_id': upload_id})
        return cls(file_data) if file_data else None
    
    @classmethod
    def find_by_entity(cls, entity_type, entity_id, db=None):
        """Find files by entity type and ID."""
        if db is None:
            db = current_app.db
            
        cursor = db[cls.collection_name].find({
            'entity_type': entity_type,
            'entity_id': entity_id
        })
        return [cls(file_data) for file_data in cursor]
    
    @classmethod
    def generate_unique_filename(cls, original_filename):
        """Generate a unique filename based on the original filename."""
        _, extension = os.path.splitext(original_filename)
        return f"{uuid.uuid4().hex}{extension}"
    
    def validate(self):
        """Validate file data."""
        errors = {}
        
        if not self.original_filename:
            errors['original_filename'] = 'Original filename is required'
        
        if not self.mime_type:
            errors['mime_type'] = 'MIME type is required'
        
        if self.size <= 0:
            errors['size'] = 'File size must be greater than 0'
        
        return errors
    
    def save(self, db=None):
        """Save the file to the database."""
        if db is None:
            db = current_app.db
            
        errors = self.validate()
        if errors:
            raise ValueError(f"Invalid file data: {errors}")
            
        self.updated_at = datetime.utcnow()
        
        file_dict = {
            'original_filename': self.original_filename,
            'filename': self.filename,
            'filepath': self.filepath,
            'mime_type': self.mime_type,
            'size': self.size,
            'width': self.width,
            'height': self.height,
            'extension': self.extension,
            'checksum': self.checksum,
            'upload_id': self.upload_id,
            'chunk_size': self.chunk_size,
            'total_chunks': self.total_chunks,
            'chunks_received': self.chunks_received,
            'status': self.status,
            'error': self.error,
            'metadata': self.metadata,
            'tags': self.tags,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'is_public': self.is_public,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        
        if hasattr(self, 'id') and self.id and self.id != str(ObjectId()):
            db[self.collection_name].update_one(
                {'_id': ObjectId(self.id)},
                {'$set': file_dict}
            )
        else:
            result = db[self.collection_name].insert_one(file_dict)
            self.id = str(result.inserted_id)
        
        return self
    
    def delete(self, db=None, delete_file=True):
        """Delete the file from the database and optionally from storage."""
        if db is None:
            db = current_app.db
            
        if delete_file and self.filepath and os.path.exists(self.filepath):
            try:
                os.remove(self.filepath)
            except Exception as e:
                current_app.logger.error(f"Error deleting file from storage: {e}")
        
        db[self.collection_name].delete_one({'_id': ObjectId(self.id)})
        
        return True
    
    def to_dict(self):
        """Convert file to dictionary."""
        return {
            'id': self.id,
            'originalFilename': self.original_filename,
            'filename': self.filename,
            'mimeType': self.mime_type,
            'size': self.size,
            'width': self.width,
            'height': self.height,
            'extension': self.extension,
            'status': self.status,
            'metadata': self.metadata,
            'tags': self.tags,
            'entityType': self.entity_type,
            'entityId': self.entity_id,
            'isPublic': self.is_public,
            'url': self.get_url(),
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }
    
    def get_url(self):
        """Get the URL for accessing the file."""
        if not self.filename:
            return None
        
        # Use configured media URL or default to local path
        media_url = current_app.config.get('MEDIA_URL', '/uploads')
        return f"{media_url}/{self.filename}" 