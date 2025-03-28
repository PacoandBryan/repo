import os
from flask import Flask, send_from_directory, json, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv
import logging
from datetime import timedelta
import time
from .utils.middleware import api_error_handler, JSONEncoder, track_api_usage

# Load environment variables
load_dotenv()

# Initialize MongoDB connection
def get_db():
    client = MongoClient(os.getenv('MONGODB_URI'))
    db_name = os.getenv('MONGODB_DB', 'newsletter_service')
    return client[db_name]

# Create app
def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {"origins": "*"},
        r"/graphql": {"origins": "*"},
        r"/uploads/*": {"origins": "*"}
    })
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    # Configure the app
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        MONGO_URI=os.environ.get('MONGO_URI', 'mongodb://localhost:27017/diky'),
        DATABASE_NAME=os.environ.get('DATABASE_NAME', 'diky'),
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key'),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=1),
        JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),
        ADMIN_EMAIL=os.environ.get('ADMIN_EMAIL', 'admin@example.com'),
        ADMIN_PASSWORD=os.environ.get('ADMIN_PASSWORD', 'dikythnks'),
        MAX_CONTENT_LENGTH=100 * 1024 * 1024,  # 100MB max upload
        UPLOADS_FOLDER=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads'),
        MEDIA_URL='/uploads',
        ALLOWED_EXTENSIONS={'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx'},
        ENVIRONMENT=os.environ.get('FLASK_ENV', 'production'),
        RATE_LIMIT_DEFAULT=60,  # Requests per minute
        RATE_LIMIT_AUTH=200,     # Higher limit for authenticated users
        GRAPHQL_INTROSPECTION=os.environ.get('ENVIRONMENT', 'development') != 'production'
    )
    
    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)
    
    # Use custom JSON encoder
    app.json_encoder = JSONEncoder
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Set up MongoDB connection
    client = MongoClient(app.config['MONGO_URI'])
    app.db = client[app.config['DATABASE_NAME']]
    
    # Create TTL index for idempotency cache
    app.db.idempotency_cache.create_index('expires_at', expireAfterSeconds=0)
    
    # Create TTL index for API logs
    app.db.api_logs.create_index('timestamp', expireAfterSeconds=60 * 60 * 24 * 30)  # 30 days
    
    # Create uploads directory if it doesn't exist
    if not os.path.exists(app.config['UPLOADS_FOLDER']):
        os.makedirs(app.config['UPLOADS_FOLDER'])
    
    # Create directory for chunks
    chunks_dir = os.path.join(app.config['UPLOADS_FOLDER'], 'chunks')
    if not os.path.exists(chunks_dir):
        os.makedirs(chunks_dir)
    
    # Register error handlers
    api_error_handler(app)
    
    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOADS_FOLDER'], filename)
    
    # Register blueprints
    from .routes.public import public_bp
    from .routes.admin import admin_bp
    from .routes.webhooks import webhook_bp
    from .routes.products import products_bp
    from .routes.uploads import uploads_bp
    from .routes.graphql import graphql_bp
    from .routes.catalog import catalog_bp
    
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(webhook_bp)
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    app.register_blueprint(graphql_bp, url_prefix='/graphql')
    app.register_blueprint(catalog_bp, url_prefix='/api/catalog')
    
    # Initialize database indexes
    with app.app_context():
        db = get_db()
        from .models.subscriber import Subscriber
        Subscriber.create_indexes(db)
    
    # Simple route for testing
    @app.route('/ping')
    @track_api_usage
    def ping():
        return {'message': 'pong', 'timestamp': time.time()}
    
    # API documentation route
    @app.route('/api/docs')
    def api_docs():
        """Serve API documentation."""
        return {
            'api': 'Diky API',
            'version': '1.0.0',
            'documentation': 'https://your-api-docs-url.com',
            'endpoints': {
                'graphql': '/graphql',
                'products': '/api/products',
                'uploads': '/api/uploads',
                'admin': '/api/admin',
                'catalog': '/api/catalog'
            }
        }
    
    return app 