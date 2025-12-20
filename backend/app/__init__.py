import os
from flask import Flask, json, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_login import LoginManager
from flask_migrate import Migrate
from datetime import timedelta
import logging
from .utils.middleware import JSONEncoder, track_api_usage
from .catalog_models import db, User
from .admin_panel import setup_admin

# Using SQLite via SQLAlchemy (Mongo/in-memory removed)

# Create app
def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {"origins": "*"},
        r"/graphql": {"origins": "*"},
        r"/uploads/*": {"origins": "*"},
        r"/ping": {"origins": "*"}
    })
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    # Configure the app
    app.config.from_mapping(
        SECRET_KEY='dev-key-123',
        JWT_SECRET_KEY='jwt-secret-key',
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=1),
        JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'postgresql://diky_user:diky_password_2024@localhost/diky_db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        MAX_CONTENT_LENGTH=100 * 1024 * 1024,  # 100MB max upload
        UPLOADS_FOLDER=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads'),
        MEDIA_URL='/uploads',
        ALLOWED_EXTENSIONS={'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'},
        ENVIRONMENT='development',
        # Session configuration for Flask-Login
        SESSION_COOKIE_SECURE=False,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=timedelta(days=1)
    )
    
    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)
    
    # Use custom JSON encoder
    app.json_encoder = JSONEncoder

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'admin_auth.login'

    @login_manager.user_loader
    def load_user(user_id):
        try:
            return User.query.get(int(user_id))
        except Exception:
            return None
    
    # Register error handlers
    app.register_error_handler(404, lambda e: (json.dumps({'error': 'Not found'}), 404))
    app.register_error_handler(500, lambda e: (json.dumps({'error': 'Internal server error'}), 500))
    
    # Initialize Admin UI
    setup_admin(app)

    # Register admin auth + JSON API + public catalog
    from .routes.admin_auth import admin_bp as admin_auth_bp, admin_api_bp
    from .routes.admin import admin_bp as catalog_admin_bp
    from .routes.catalog_public import public_catalog_bp
    from .routes.catalog_api import catalog_api_bp
    from .routes.public import public_bp
    app.register_blueprint(admin_auth_bp)
    app.register_blueprint(admin_api_bp)
    app.register_blueprint(catalog_admin_bp)
    app.register_blueprint(public_catalog_bp)
    app.register_blueprint(catalog_api_bp)
    app.register_blueprint(public_bp)
    
    # Serve React app for all non-API routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        # Check if it's an API route
        if path.startswith('api/') or path.startswith('admin/'):
            return {'error': 'API endpoint not found'}, 404
        
        # Check if it's a static file in the React build
        react_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist')
        if path and os.path.exists(os.path.join(react_build_path, path)):
            return send_from_directory(react_build_path, path)
        
        # Serve React app's index.html for all other routes
        try:
            return send_from_directory(react_build_path, 'index.html')
        except FileNotFoundError:
            return {'error': 'React app not built. Please run "npm run build" first.'}, 404
    
    # Simple route for testing
    @app.route('/ping')
    @track_api_usage
    def ping():
        return {'message': 'pong', 'status': 'success'}
    
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOADS_FOLDER'], filename)
    
    # Ensure database tables and default admin user
    from sqlalchemy.exc import OperationalError, ProgrammingError
    with app.app_context():
        try:
            db.create_all()
        except (OperationalError, ProgrammingError) as e:
            logging.exception(f"Database error during table creation: {e}")
        
        try:
            if not User.query.filter_by(username='admin').first():
                logging.info("Creating default admin user 'admin'")
                admin_user = User(username='admin')
                admin_user.set_password('dikythnks')
                db.session.add(admin_user)
                db.session.commit()
        except Exception as e:
            logging.exception(f"Error creating admin user: {e}")
            # If email column doesn't exist, try to add it or create user without email
            try:
                db.session.rollback()
                admin_user = User(username='admin')
                admin_user.set_password('dikythnks')
                db.session.add(admin_user)
                db.session.commit()
                logging.info("Admin user created successfully")
            except Exception as e2:
                logging.exception(f"Failed to create admin user: {e2}")
    
    return app 