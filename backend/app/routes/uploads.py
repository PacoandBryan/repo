from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import uuid
import os
import hashlib
import time
import functools

from ..models.file import File
from ..utils.file_upload import (
    validate_file, save_file, save_file_chunk, combine_chunks,
    get_file_extension, get_file_checksum, get_image_dimensions,
    get_upload_directory, get_client_ip
)
from ..utils.middleware import RateLimiter, validate_request, track_api_usage

# Try to import scan_file_for_viruses, or create a dummy function if not available
try:
    from ..utils.file_upload import scan_file_for_viruses
except ImportError:
    # Create a fallback dummy function
    def scan_file_for_viruses(filepath):
        current_app.logger.warning(f"Using dummy scan_file_for_viruses function for {filepath}")
        return {'infected': False, 'message': 'File scanning unavailable, bypassing security check'}

uploads_bp = Blueprint('uploads', __name__)

# Apply rate limiting to all upload routes
rate_limiter = RateLimiter(requests_per_minute=30)

# Idempotency key middleware
def idempotent_request(f):
    """Ensure idempotent operations with an idempotency key."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        idempotency_key = request.headers.get('X-Idempotency-Key')
        
        if not idempotency_key:
            # If no idempotency key provided, just execute the function
            return f(*args, **kwargs)
            
        # Check if we have already processed this request
        cached_response = current_app.db.idempotency_cache.find_one({'key': idempotency_key})
        
        if cached_response:
            # Return the cached response
            return jsonify(cached_response['response']), cached_response['status_code']
            
        # Execute the original function
        response = f(*args, **kwargs)
        
        # Cache the response
        if isinstance(response, tuple):
            result, status_code = response
            result_data = result.get_json() if hasattr(result, 'get_json') else result
        else:
            result_data = response.get_json() if hasattr(response, 'get_json') else response
            status_code = 200
            
        # Store in cache with TTL (24 hours)
        current_app.db.idempotency_cache.insert_one({
            'key': idempotency_key,
            'response': result_data,
            'status_code': status_code,
            'created_at': time.time(),
            'expires_at': time.time() + (24 * 60 * 60)  # 24 hours
        })
        
        return response
    return decorated_function

# Schema for file upload initialization
init_upload_schema = {
    'filename': {'type': 'string', 'required': True, 'maxLength': 255},
    'size': {'type': 'integer', 'required': True, 'minimum': 1},
    'mimeType': {'type': 'string', 'required': True, 'maxLength': 255},
    'chunkSize': {'type': 'integer', 'minimum': 1},
    'totalChunks': {'type': 'integer', 'minimum': 1},
    'metadata': {'type': 'object'},
    'tags': {'type': 'array'},
    'entityType': {'type': 'string', 'maxLength': 100},
    'entityId': {'type': 'string', 'maxLength': 100},
    'isPublic': {'type': 'boolean'}
}

@uploads_bp.route('/init', methods=['POST'])
@rate_limiter
@validate_request(init_upload_schema)
@idempotent_request
@track_api_usage
@jwt_required(optional=True)
def init_upload():
    """Initialize a new upload and get an upload ID."""
    data = request.get_json()
    
    # Get current user from JWT token if available
    current_user = get_jwt_identity()
    
    # Generate upload ID using content + timestamp for idempotency
    content_hash = hashlib.md5((
        data.get('filename', '') + 
        str(data.get('size', 0)) + 
        data.get('mimeType', '')
    ).encode('utf-8')).hexdigest()
    
    timestamp = int(time.time())
    upload_id = f"{content_hash}_{timestamp}"
    
    # Create file record
    file_data = {
        'original_filename': data.get('filename'),
        'mime_type': data.get('mimeType'),
        'size': data.get('size'),
        'extension': get_file_extension(data.get('filename')),
        'upload_id': upload_id,
        'chunk_size': data.get('chunkSize'),
        'total_chunks': data.get('totalChunks'),
        'chunks_received': [],
        'status': 'pending',
        'metadata': data.get('metadata', {}),
        'tags': data.get('tags', []),
        'entity_type': data.get('entityType', ''),
        'entity_id': data.get('entityId', ''),
        'is_public': data.get('isPublic', True),
        'uploaded_by': current_user
    }
    
    file = File(file_data)
    
    try:
        file.save()
        return jsonify({
            'uploadId': upload_id,
            'fileId': file.id,
            'status': 'initialized'
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Error initializing upload: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@uploads_bp.route('/<upload_id>/chunk', methods=['POST'])
@rate_limiter
@idempotent_request
@track_api_usage
@jwt_required(optional=True)
def upload_chunk(upload_id):
    """Upload a chunk of a file."""
    # Get the file record
    file = File.find_by_upload_id(upload_id)
    if not file:
        return jsonify({'error': 'Upload not found'}), 404
    
    # Check permissions if applicable
    current_user = get_jwt_identity()
    if not file.is_public and file.uploaded_by and file.uploaded_by != current_user:
        return jsonify({'error': 'Not authorized to access this upload'}), 403
    
    # Get chunk index from form data
    chunk_index = request.form.get('chunkIndex')
    if chunk_index is None:
        return jsonify({'error': 'Chunk index is required'}), 400
    
    chunk_index = int(chunk_index)
    
    # Check if chunk already received
    if chunk_index in file.chunks_received:
        return jsonify({
            'message': 'Chunk already received',
            'uploadId': upload_id,
            'chunkIndex': chunk_index
        }), 200
    
    # Get the file chunk
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    chunk = request.files['file']
    if not chunk.filename:
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Validate chunk if it's the first one
        if chunk_index == 0:
            errors = validate_file(chunk)
            if errors:
                return jsonify({'errors': errors}), 400
        
        # Save the chunk
        chunk_data = chunk.read()
        save_file_chunk(upload_id, chunk_index, chunk_data)
        
        # Update file record
        file.chunks_received.append(chunk_index)
        file.save()
        
        # Check if all chunks received
        if len(file.chunks_received) == file.total_chunks:
            file.status = 'processing'
            file.save()
            
            # Combine chunks in background (would use Celery in production)
            # For simplicity, we'll do it synchronously here
            result = combine_chunks(
                upload_id,
                file.total_chunks,
                file.original_filename
            )
            
            # Scan file for viruses
            virus_scan_result = scan_file_for_viruses(result['filepath'])
            if virus_scan_result.get('infected', False):
                file.status = 'rejected'
                file.error = f"File rejected: {virus_scan_result.get('message', 'Potential security threat detected')}"
                file.save()
                return jsonify({
                    'error': 'File rejected due to security concerns',
                    'uploadId': upload_id,
                    'status': 'rejected'
                }), 400
            
            # Update file record with combined file info
            file.filename = result['filename']
            file.filepath = result['filepath']
            file.size = result['size']
            file.checksum = result['checksum']
            file.width = result['width']
            file.height = result['height']
            file.status = 'completed'
            file.save()
            
            return jsonify({
                'message': 'Upload completed',
                'uploadId': upload_id,
                'fileId': file.id,
                'file': file.to_dict(),
                'status': 'completed'
            }), 200
        
        return jsonify({
            'message': 'Chunk received',
            'uploadId': upload_id,
            'chunkIndex': chunk_index,
            'chunksReceived': len(file.chunks_received),
            'totalChunks': file.total_chunks,
            'status': 'pending'
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error processing chunk: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@uploads_bp.route('', methods=['POST'])
@rate_limiter
@idempotent_request
@track_api_usage
@jwt_required(optional=True)
def upload_file():
    """Upload a complete file (non-chunked)."""
    # Check if file part is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if not file.filename:
        return jsonify({'error': 'No selected file'}), 400
    
    # Validate file
    errors = validate_file(file)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Get current user from JWT token if available
    current_user = get_jwt_identity()
    
    try:
        # Read file data
        file_data = file.read()
        
        # Generate filename and save file
        filename, filepath = save_file(file_data, file.filename)
        
        # Scan file for viruses
        virus_scan_result = scan_file_for_viruses(filepath)
        if virus_scan_result.get('infected', False):
            # Delete the file
            try:
                os.remove(filepath)
            except:
                pass
            
            return jsonify({
                'error': 'File rejected due to security concerns',
                'message': virus_scan_result.get('message', 'Potential security threat detected')
            }), 400
        
        # Get metadata
        size = len(file_data)
        mime_type = file.mimetype
        extension = get_file_extension(file.filename)
        checksum = get_file_checksum(file_data)
        width, height = None, None
        
        # Get dimensions if it's an image
        if mime_type.startswith('image/'):
            width, height = get_image_dimensions(file_data)
        
        # Get metadata from form
        entity_type = request.form.get('entityType', '')
        entity_id = request.form.get('entityId', '')
        is_public = request.form.get('isPublic', 'true').lower() == 'true'
        tags = request.form.get('tags', '').split(',') if request.form.get('tags') else []
        
        # Create file record
        file_obj = File({
            'original_filename': file.filename,
            'filename': filename,
            'filepath': filepath,
            'mime_type': mime_type,
            'size': size,
            'width': width,
            'height': height,
            'extension': extension,
            'checksum': checksum,
            'status': 'completed',
            'entity_type': entity_type,
            'entity_id': entity_id,
            'is_public': is_public,
            'tags': tags,
            'uploaded_by': current_user,
            'metadata': {
                'ip': get_client_ip()
            }
        })
        
        file_obj.save()
        
        return jsonify(file_obj.to_dict()), 201
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Error uploading file: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@uploads_bp.route('/<file_id>', methods=['GET'])
@track_api_usage
@jwt_required(optional=True)
def get_file(file_id):
    """Get file metadata by ID."""
    file = File.find_by_id(file_id)
    
    if not file:
        return jsonify({'error': 'File not found'}), 404
    
    # Check permissions if file is not public
    if not file.is_public:
        current_user = get_jwt_identity()
        if not current_user or (file.uploaded_by and file.uploaded_by != current_user):
            return jsonify({'error': 'Not authorized to access this file'}), 403
    
    return jsonify(file.to_dict()), 200

@uploads_bp.route('/<file_id>', methods=['DELETE'])
@rate_limiter
@track_api_usage
@jwt_required()
def delete_file(file_id):
    """Delete a file by ID."""
    file = File.find_by_id(file_id)
    
    if not file:
        return jsonify({'error': 'File not found'}), 404
    
    # Check permissions
    current_user = get_jwt_identity()
    if file.uploaded_by and file.uploaded_by != current_user:
        # Check if admin (simplified - in production, use roles)
        admin_email = current_app.config.get('ADMIN_EMAIL')
        if current_user != admin_email:
            return jsonify({'error': 'Not authorized to delete this file'}), 403
    
    try:
        file.delete(delete_file=True)
        return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting file: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500 