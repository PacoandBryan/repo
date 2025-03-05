import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize MongoDB connection
def get_db():
    client = MongoClient(os.getenv('MONGODB_URI'))
    db_name = os.getenv('MONGODB_DB', 'newsletter_service')
    return client[db_name]

# Create app
def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 60 * 60 * 24  # 1 day
    
    # Initialize extensions with more explicit CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept"],
            "supports_credentials": True
        }
    })
    JWTManager(app)
    
    # Register blueprints
    from .routes.public import public_bp
    from .routes.admin import admin_bp
    from .routes.webhooks import webhook_bp
    
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(webhook_bp)
    
    # Initialize database indexes
    with app.app_context():
        db = get_db()
        from .models.subscriber import Subscriber
        Subscriber.create_indexes(db)
    
    return app 