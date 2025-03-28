from flask import request, jsonify, g, current_app
import time
import functools
from werkzeug.exceptions import HTTPException
import json
import re
from datetime import datetime, timedelta
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity

class RateLimiter:
    """Rate limiter middleware for API endpoints."""
    
    def __init__(self, requests_per_minute=60):
        self.requests_per_minute = requests_per_minute
        self.request_history = {}
        
    def is_rate_limited(self, client_ip):
        """Check if the request is rate limited."""
        now = time.time()
        
        # Clean up old requests
        for ip in list(self.request_history.keys()):
            self.request_history[ip] = [ts for ts in self.request_history[ip] if now - ts < 60]
            if not self.request_history[ip]:
                del self.request_history[ip]
        
        # Check current request count
        if client_ip not in self.request_history:
            self.request_history[client_ip] = []
            
        self.request_history[client_ip].append(now)
        
        return len(self.request_history[client_ip]) > self.requests_per_minute
        
    def __call__(self, f):
        """Apply rate limiting to the decorated function."""
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.remote_addr
            
            # Skip rate limiting for local development
            if client_ip == '127.0.0.1' and current_app.config.get('ENVIRONMENT') == 'development':
                return f(*args, **kwargs)
                
            if self.is_rate_limited(client_ip):
                response = {
                    'error': 'Too many requests',
                    'message': 'Rate limit exceeded. Please try again later.',
                    'status': 429
                }
                return jsonify(response), 429
                
            return f(*args, **kwargs)
        return decorated_function


def validate_request(schema):
    """Validate request data against a schema."""
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # For GET requests, validate query parameters
            if request.method == 'GET':
                data = request.args.to_dict()
            # For other methods, validate JSON body
            else:
                if not request.is_json:
                    return jsonify({
                        'error': 'Invalid request',
                        'message': 'Request must be JSON',
                        'status': 400
                    }), 400
                data = request.get_json()
            
            # Basic validation
            errors = {}
            for field, rules in schema.items():
                if 'required' in rules and rules['required'] and field not in data:
                    errors[field] = f"{field} is required"
                    continue
                    
                if field not in data:
                    continue
                    
                value = data[field]
                
                # Type validation
                if 'type' in rules:
                    expected_type = rules['type']
                    if expected_type == 'string' and not isinstance(value, str):
                        errors[field] = f"{field} must be a string"
                    elif expected_type == 'number' and not isinstance(value, (int, float)):
                        errors[field] = f"{field} must be a number"
                    elif expected_type == 'integer' and not isinstance(value, int):
                        errors[field] = f"{field} must be an integer"
                    elif expected_type == 'boolean' and not isinstance(value, bool):
                        errors[field] = f"{field} must be a boolean"
                    elif expected_type == 'array' and not isinstance(value, list):
                        errors[field] = f"{field} must be an array"
                    elif expected_type == 'object' and not isinstance(value, dict):
                        errors[field] = f"{field} must be an object"
                
                # Pattern validation
                if 'pattern' in rules and isinstance(value, str):
                    pattern = rules['pattern']
                    if not re.match(pattern, value):
                        errors[field] = f"{field} is not in the correct format"
                
                # Min/max validation for strings and arrays
                if isinstance(value, (str, list)):
                    if 'minLength' in rules and len(value) < rules['minLength']:
                        errors[field] = f"{field} must be at least {rules['minLength']} characters"
                    if 'maxLength' in rules and len(value) > rules['maxLength']:
                        errors[field] = f"{field} must be at most {rules['maxLength']} characters"
                
                # Min/max validation for numbers
                if isinstance(value, (int, float)):
                    if 'minimum' in rules and value < rules['minimum']:
                        errors[field] = f"{field} must be at least {rules['minimum']}"
                    if 'maximum' in rules and value > rules['maximum']:
                        errors[field] = f"{field} must be at most {rules['maximum']}"
                
                # Enum validation
                if 'enum' in rules and value not in rules['enum']:
                    errors[field] = f"{field} must be one of: {', '.join(map(str, rules['enum']))}"
            
            if errors:
                return jsonify({
                    'error': 'Validation error',
                    'errors': errors,
                    'status': 400
                }), 400
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def api_error_handler(app):
    """Register error handlers for the Flask app."""
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        response = {
            'error': error.name,
            'message': error.description,
            'status': error.code
        }
        return jsonify(response), error.code
    
    @app.errorhandler(500)
    def handle_server_error(error):
        current_app.logger.error(f"Internal server error: {error}")
        response = {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred',
            'status': 500
        }
        return jsonify(response), 500
    
    @app.errorhandler(404)
    def handle_not_found(error):
        response = {
            'error': 'Not found',
            'message': 'The requested resource was not found',
            'status': 404
        }
        return jsonify(response), 404


def require_admin(f):
    """Custom decorator for admin-only routes."""
    @functools.wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user = get_jwt_identity()
        
        # Check if the user is an admin
        admin_email = current_app.config.get('ADMIN_EMAIL')
        
        if current_user != admin_email:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Admin access required',
                'status': 403
            }), 403
            
        return f(*args, **kwargs)
    return decorated_function


def track_api_usage(f):
    """Track API usage for analytics."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        # Execute the view function
        response = f(*args, **kwargs)
        
        # Calculate request duration
        duration = time.time() - start_time
        
        # Log API call
        current_app.logger.info(
            f"API call: {request.method} {request.path} - "
            f"Status: {response[1] if isinstance(response, tuple) else 200} - "
            f"Duration: {duration:.4f}s - "
            f"IP: {request.remote_addr}"
        )
        
        # Store in database if needed
        if hasattr(current_app, 'db'):
            api_log = {
                'method': request.method,
                'path': request.path,
                'status_code': response[1] if isinstance(response, tuple) else 200,
                'duration': duration,
                'ip_address': request.remote_addr,
                'user_agent': request.user_agent.string,
                'timestamp': datetime.utcnow(),
            }
            
            # Add user info if authenticated
            try:
                api_log['user'] = get_jwt_identity()
            except:
                api_log['user'] = None
                
            current_app.db.api_logs.insert_one(api_log)
        
        return response
    return decorated_function


class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for MongoDB ObjectId and datetime objects."""
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj) 