import os
import re
from flask import Blueprint, request, jsonify
from ..services.email_service import send_contact_email

public_bp = Blueprint('public', __name__, url_prefix='/api')

# Email validation regex
EMAIL_REGEX = r'^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$'

@public_bp.route('/contact', methods=['POST'])
def contact():
    """Handle contact form submission."""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    required_fields = ['firstName', 'lastName', 'email', 'message']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Field {field} is required'}), 400
            
    # Validate email
    email = data.get('email')
    if not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Invalid email address'}), 400
        
    result = send_contact_email(data)
    
    if result['success']:
        return jsonify({'message': 'Message sent successfully!'}), 200
    else:
        return jsonify({'error': result.get('message', 'Failed to send message')}), 500