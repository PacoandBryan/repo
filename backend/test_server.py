"""
Simplified test server to verify API functionality without MongoDB dependency
"""
import os
from flask import Flask, jsonify
from app.routes.uploads import uploads_bp

# Create and configure a simple app for testing
app = Flask(__name__)
app.config.update(
    SECRET_KEY='test_secret',
    TESTING=True,
    UPLOADS_FOLDER=os.path.join(os.path.dirname(__file__), 'uploads'),
    MAX_CONTENT_LENGTH=100 * 1024 * 1024,  # 100MB max upload
    ALLOWED_EXTENSIONS={'png', 'jpg', 'jpeg', 'gif', 'pdf'},
    ENVIRONMENT='development'
)

# Create uploads directory if it doesn't exist
if not os.path.exists(app.config['UPLOADS_FOLDER']):
    os.makedirs(app.config['UPLOADS_FOLDER'])

# Create directory for chunks
chunks_dir = os.path.join(app.config['UPLOADS_FOLDER'], 'chunks')
if not os.path.exists(chunks_dir):
    os.makedirs(chunks_dir)

# Register the uploads blueprint
app.register_blueprint(uploads_bp, url_prefix='/api/uploads')

# Add a simple test route
@app.route('/ping')
def ping():
    """Simple route to test if the server is running"""
    return jsonify({'message': 'pong'})

# Add a route to test importing the scan_file_for_viruses function
@app.route('/test-scan')
def test_scan():
    """Test if we can import and use the scan_file_for_viruses function"""
    try:
        from app.utils.file_upload import scan_file_for_viruses
        
        # Scan this file itself
        result = scan_file_for_viruses(__file__)
        
        return jsonify({
            'success': True,
            'message': 'Function imported successfully',
            'scan_result': result
        })
    except ImportError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting test server on http://127.0.0.1:5000")
    app.run(debug=True) 