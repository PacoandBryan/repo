import os
import re
from flask import Blueprint, request, jsonify
from email_validator import validate_email, EmailNotValidError
from ..models.subscriber import Subscriber
from .. import get_db
from ..services.email_service import send_verification_email, send_unsubscribe_confirmation

public_bp = Blueprint('public', __name__, url_prefix='/api')

# Email validation regex
EMAIL_REGEX = r'^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$'

@public_bp.route('/subscribe', methods=['POST'])
def subscribe():
    """Subscribe a new user to the newsletter."""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    email = data.get('email')
    name = data.get('name', '')
    topics = data.get('topics', [])
    
    # Validate email
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Invalid email address'}), 400
        
    try:
        # Additional email validation
        validation = validate_email(email)
        email = validation.normalized
    except EmailNotValidError as e:
        return jsonify({'error': str(e)}), 400
    
    # Check if email already exists
    db = get_db()
    existing_subscriber = Subscriber.get_by_email(db, email)
    
    if existing_subscriber:
        if existing_subscriber.get('isActive'):
            # Already subscribed
            return jsonify({'error': 'Email already subscribed'}), 400
        else:
            # Resend verification email
            subscriber = Subscriber.create(db, email, name, topics)
            send_verification_email(subscriber)
            return jsonify({'message': 'Verification email resent'}), 200
    
    # Create new subscriber
    subscriber = Subscriber.create(db, email, name, topics)
    
    # Send verification email
    send_verification_email(subscriber)
    
    return jsonify({
        'message': 'Subscription initiated. Please check your email to verify your subscription.',
        'subscriberId': subscriber['_id']
    }), 201


@public_bp.route('/verify/<token>', methods=['GET'])
def verify(token):
    """Verify a subscriber's email."""
    if not token:
        return jsonify({'error': 'Invalid verification token'}), 400
        
    db = get_db()
    subscriber = Subscriber.get_by_verification_token(db, token)
    
    if not subscriber:
        return jsonify({'error': 'Invalid or expired verification token'}), 400
        
    # Verify subscriber
    success = Subscriber.verify(db, token)
    
    if not success:
        return jsonify({'error': 'Verification failed'}), 400
        
    return jsonify({'message': 'Email verified successfully. You are now subscribed.'}), 200


@public_bp.route('/unsubscribe/<token>', methods=['GET'])
def unsubscribe(token):
    """Unsubscribe from the newsletter."""
    # Token for unsubscribe is simply the email in base64 for simplicity
    # In a production environment, you would use a more secure token
    import base64
    
    try:
        email = base64.b64decode(token).decode('utf-8')
    except Exception:
        return jsonify({'error': 'Invalid unsubscribe token'}), 400
        
    db = get_db()
    subscriber = Subscriber.get_by_email(db, email)
    
    if not subscriber:
        return jsonify({'error': 'Subscriber not found'}), 404
        
    # Unsubscribe user
    success = Subscriber.unsubscribe(db, email)
    
    if not success:
        return jsonify({'error': 'Unsubscribe failed'}), 400
        
    # Send confirmation email
    send_unsubscribe_confirmation(subscriber)
    
    return jsonify({'message': 'You have been unsubscribed successfully.'}), 200 