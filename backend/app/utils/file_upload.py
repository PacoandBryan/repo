import os
import uuid
import hashlib
import mimetypes
from werkzeug.utils import secure_filename
from PIL import Image
from io import BytesIO
from flask import current_app, request
import magic
import re

# Define allowed file types
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
ALLOWED_DOCUMENT_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'}
ALLOWED_MIME_TYPES = {
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
}

# File size limits (in bytes)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_DOCUMENT_SIZE = 50 * 1024 * 1024  # 50MB
DEFAULT_CHUNK_SIZE = 1024 * 1024  # 1MB

def get_upload_directory():
    """Get the upload directory path, creating it if it doesn't exist."""
    upload_dir = current_app.config.get('UPLOADS_FOLDER')
    
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    return upload_dir

def allowed_file(filename, allowed_extensions=None):
    """Check if the file extension is allowed."""
    if allowed_extensions is None:
        allowed_extensions = ALLOWED_IMAGE_EXTENSIONS.union(ALLOWED_DOCUMENT_EXTENSIONS)
        
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def allowed_mimetype(mimetype):
    """Check if the MIME type is allowed."""
    return mimetype in ALLOWED_MIME_TYPES

def get_file_extension(filename):
    """Get the file extension from a filename."""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

def get_file_checksum(file_data):
    """Calculate the MD5 checksum of file data."""
    return hashlib.md5(file_data).hexdigest()

def get_image_dimensions(file_data):
    """Get the dimensions of an image file."""
    try:
        with Image.open(BytesIO(file_data)) as img:
            return img.size  # (width, height)
    except Exception:
        return None, None

def save_file(file_data, filename, directory=None):
    """Save a file to the uploads directory."""
    if directory is None:
        directory = get_upload_directory()
    
    # Create a secure filename
    secure_name = secure_filename(filename)
    
    # Generate a unique filename with UUID
    ext = get_file_extension(secure_name)
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    
    # Save the file
    filepath = os.path.join(directory, unique_filename)
    with open(filepath, 'wb') as f:
        f.write(file_data)
    
    return unique_filename, filepath

def save_file_chunk(upload_id, chunk_index, chunk_data, directory=None):
    """Save a chunk of a file."""
    if directory is None:
        directory = get_upload_directory()
    
    # Create a temporary directory for chunks if it doesn't exist
    chunks_dir = os.path.join(directory, 'chunks', upload_id)
    if not os.path.exists(chunks_dir):
        os.makedirs(chunks_dir)
    
    # Save the chunk
    chunk_path = os.path.join(chunks_dir, f"{chunk_index}")
    with open(chunk_path, 'wb') as f:
        f.write(chunk_data)
    
    return chunk_path

def combine_chunks(upload_id, total_chunks, original_filename, directory=None):
    """Combine file chunks into a single file."""
    if directory is None:
        directory = get_upload_directory()
    
    chunks_dir = os.path.join(directory, 'chunks', upload_id)
    
    # Generate a unique filename
    ext = get_file_extension(original_filename)
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(directory, unique_filename)
    
    # Combine chunks
    with open(filepath, 'wb') as output_file:
        for i in range(total_chunks):
            chunk_path = os.path.join(chunks_dir, f"{i}")
            if os.path.exists(chunk_path):
                with open(chunk_path, 'rb') as chunk_file:
                    output_file.write(chunk_file.read())
    
    # Clean up chunks directory
    for i in range(total_chunks):
        chunk_path = os.path.join(chunks_dir, f"{i}")
        if os.path.exists(chunk_path):
            os.remove(chunk_path)
    
    if os.path.exists(chunks_dir):
        os.rmdir(chunks_dir)
    
    # Get file metadata
    file_size = os.path.getsize(filepath)
    with open(filepath, 'rb') as f:
        file_data = f.read()
    
    checksum = get_file_checksum(file_data)
    width, height = None, None
    
    # Get dimensions if it's an image
    if ext.lower() in ALLOWED_IMAGE_EXTENSIONS:
        try:
            with Image.open(filepath) as img:
                width, height = img.size
        except Exception:
            pass
    
    return {
        'filename': unique_filename,
        'filepath': filepath,
        'size': file_size,
        'checksum': checksum,
        'width': width,
        'height': height,
        'extension': ext
    }

def validate_file(file):
    """Validate file type, size and security."""
    errors = {}
    
    # Check file size
    max_size = current_app.config.get('MAX_CONTENT_LENGTH', 100 * 1024 * 1024)  # Default: 100MB
    if file.content_length > max_size:
        errors['size'] = f"File too large. Maximum size is {max_size / (1024 * 1024)}MB"
    
    # Check file extension
    filename = file.filename
    ext = get_file_extension(filename)
    allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'pdf'})
    
    if ext not in allowed_extensions:
        errors['extension'] = f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
    
    # Check if the file is actually the claimed type (basic MIME type validation)
    # Read a small part of the file to detect MIME type
    file.seek(0)
    file_start = file.read(2048)
    file.seek(0)  # Reset file pointer
    
    # Use python-magic for better MIME detection
    mime_type = magic.from_buffer(file_start, mime=True)
    
    # Verify MIME type matches extension
    # This is a simplified check - in production you'd want a more comprehensive mapping
    common_mime_types = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain',
        'csv': 'text/csv',
    }
    
    expected_mime = common_mime_types.get(ext)
    if expected_mime and mime_type != expected_mime:
        errors['mime_type'] = f"File content doesn't match its extension"
    
    # Check for executable content
    executable_mime_types = [
        'application/x-executable',
        'application/x-dosexec',
        'application/x-sharedlib',
        'application/x-object',
        'application/x-pie-executable'
    ]
    
    if mime_type in executable_mime_types:
        errors['security'] = "Executable files are not allowed"
    
    # Additional security checks for specific file types
    if ext == 'pdf' and b'%PDF' not in file_start:
        errors['security'] = "Invalid PDF file"
    
    if ext in ['jpg', 'jpeg'] and b'JFIF' not in file_start and b'Exif' not in file_start:
        errors['security'] = "Invalid JPEG file"
    
    if ext == 'png' and b'PNG' not in file_start:
        errors['security'] = "Invalid PNG file"
    
    return errors

def get_client_ip():
    """Get the client IP address."""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    return request.remote_addr

def scan_file_for_viruses(filepath):
    """
    Scan a file for viruses and malware.
    
    In a production environment, you would integrate with an actual antivirus API
    such as ClamAV, VirusTotal, or a commercial security service.
    
    This is a simplified placeholder implementation.
    """
    result = {
        'infected': False,
        'message': 'File is clean'
    }
    
    try:
        # Get file MIME type
        mime_type = magic.from_file(filepath, mime=True)
        
        # Get file size
        file_size = os.path.getsize(filepath)
        
        # Check for suspicious characteristics
        
        # 1. Check file size anomalies (e.g., empty files claiming to be images)
        if mime_type.startswith('image/') and file_size < 100:
            result['infected'] = True
            result['message'] = 'Suspicious image file (too small)'
            return result
        
        # 2. Check for executable content
        executable_mime_types = [
            'application/x-executable',
            'application/x-dosexec',
            'application/x-sharedlib',
            'application/x-object',
            'application/x-pie-executable'
        ]
        
        if mime_type in executable_mime_types:
            result['infected'] = True
            result['message'] = 'Executable files are not allowed'
            return result
        
        # Skip scanning our own code files
        is_app_code = '/app/' in filepath or '\\app\\' in filepath
        if not is_app_code:  # Skip virus signatures for our own code
            # 3. Scan the file for common virus signatures (simplified)
            # In a real implementation, you would use a virus scanning library
            with open(filepath, 'rb') as f:
                content = f.read()
                
                # Check for common malware patterns (this is a simplified example)
                malware_signatures = [
                    b'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!',  # EICAR test signature
                    b'TVqQAAMAA',  # Common PE header
                    b'TVpQAAIAA',  # DOS MZ header variant
                    b'<script>evil',
                    b'eval(base64_decode',
                    b'cmd.exe /c',
                    b'powershell -e'
                ]
                
                for signature in malware_signatures:
                    if signature in content:
                        result['infected'] = True
                        result['message'] = 'Potential malware detected'
                        return result
            
            # 4. For PDF files, check for common exploits
            if mime_type == 'application/pdf':
                suspicious_pdf_patterns = [
                    b'/JS',
                    b'/JavaScript',
                    b'/AA',
                    b'/OpenAction',
                    b'/Launch',
                    b'/JBIG2Decode'
                ]
                
                with open(filepath, 'rb') as f:
                    pdf_content = f.read()
                    
                    for pattern in suspicious_pdf_patterns:
                        if pattern in pdf_content:
                            # This is just a heuristic - in real scanning you'd do deeper analysis
                            # Count occurrences to reduce false positives
                            count = pdf_content.count(pattern)
                            if count > 3:  # Arbitrary threshold
                                result['infected'] = True
                                result['message'] = 'Potentially malicious PDF content'
                                return result
        
        return result
        
    except Exception as e:
        # Log the exception
        if current_app:
            current_app.logger.error(f"Error scanning file: {str(e)}")
            
        # If scanning fails, block the file to be safe
        result['infected'] = True
        result['message'] = 'Unable to scan file for security threats'
        return result 