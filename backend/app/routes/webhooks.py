import os
import json
import hmac
import hashlib
from flask import Blueprint, request, jsonify
from ..models.campaign import Campaign
from .. import get_db

webhook_bp = Blueprint('webhooks', __name__, url_prefix='/api/webhooks')

@webhook_bp.route('/sendgrid', methods=['POST'])
def sendgrid_webhook():
    """Receive SendGrid webhook events."""
    # Verify webhook signature (if configured)
    signature = request.headers.get('X-Twilio-Email-Event-Webhook-Signature')
    timestamp = request.headers.get('X-Twilio-Email-Event-Webhook-Timestamp')
    
    if signature and timestamp:
        # Validate signature
        webhook_key = os.getenv('SENDGRID_WEBHOOK_KEY')
        if webhook_key:
            # Get request body as bytes for signature calculation
            request_body = request.get_data()
            
            # Create a payload string
            payload = f"{timestamp}{request_body.decode('utf-8')}"
            
            # Create HMAC signature
            digest = hmac.new(
                key=webhook_key.encode('utf-8'),
                msg=payload.encode('utf-8'),
                digestmod=hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            if signature != digest:
                return jsonify({'error': 'Invalid webhook signature'}), 401
    
    # Process events
    events = request.json
    
    if not events or not isinstance(events, list):
        return jsonify({'error': 'Invalid event data'}), 400
    
    db = get_db()
    
    for event in events:
        # Extract event data
        event_type = event.get('event')
        campaign_id = event.get('campaign_id')
        
        if not event_type or not campaign_id:
            continue
        
        # Map event to statistics field
        stat_field = None
        if event_type == 'delivered':
            stat_field = 'emailsDelivered'
        elif event_type == 'open':
            stat_field = 'openCount'
        elif event_type == 'click':
            stat_field = 'clickCount'
        elif event_type == 'bounce':
            stat_field = 'bounceCount'
        elif event_type == 'unsubscribe':
            stat_field = 'unsubscribeCount'
        
        # Update campaign statistics
        if stat_field:
            Campaign.increment_statistics(db, campaign_id, stat_field)
    
    return jsonify({'status': 'success'}), 200 