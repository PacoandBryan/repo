import os
import base64
from datetime import datetime
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Subject, PlainTextContent, HtmlContent, CustomArg
from urllib.parse import urljoin


def get_sendgrid_client():
    """Get SendGrid API client."""
    api_key = os.getenv('SENDGRID_API_KEY')
    if not api_key:
        raise ValueError('SENDGRID_API_KEY environment variable not set')
    return SendGridAPIClient(api_key)


def get_app_url():
    """Get the application URL."""
    return os.getenv('APP_URL', 'http://localhost:5000')


def send_verification_email(subscriber):
    """Send verification email to new subscriber."""
    app_url = get_app_url()
    verification_link = urljoin(app_url, f'/api/verify/{subscriber["verificationToken"]}')
    
    # Create sender
    from_email = From(os.getenv('FROM_EMAIL', 'newsletter@example.com'), 'Newsletter Service')
    
    # Create recipient
    to_email = To(subscriber['email'], subscriber.get('name', ''))
    
    # Create email
    mail = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=Subject('Please verify your email subscription'),
        plain_text_content=PlainTextContent(
            f'Thank you for subscribing to our newsletter! '
            f'Please verify your email by clicking the link below:\n\n'
            f'{verification_link}\n\n'
            f'This link will expire in 48 hours.\n\n'
            f'If you did not request this subscription, please ignore this email.'
        ),
        html_content=HtmlContent(
            f'<p>Thank you for subscribing to our newsletter!</p>'
            f'<p>Please verify your email by clicking the button below:</p>'
            f'<p><a href="{verification_link}" '
            f'style="display: inline-block; padding: 10px 20px; '
            f'background-color: #4CAF50; color: white; text-decoration: none; '
            f'border-radius: 5px;">Verify Email</a></p>'
            f'<p>This link will expire in 48 hours.</p>'
            f'<p>If you did not request this subscription, please ignore this email.</p>'
        )
    )
    
    try:
        sg = get_sendgrid_client()
        response = sg.send(mail)
        return {
            'success': response.status_code == 202,
            'status_code': response.status_code
        }
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }


def send_unsubscribe_confirmation(subscriber):
    """Send confirmation email for unsubscription."""
    # Create sender
    from_email = From(os.getenv('FROM_EMAIL', 'newsletter@example.com'), 'Newsletter Service')
    
    # Create recipient
    to_email = To(subscriber['email'], subscriber.get('name', ''))
    
    # Create email
    mail = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=Subject('Unsubscription Confirmation'),
        plain_text_content=PlainTextContent(
            f'You have been successfully unsubscribed from our newsletter. '
            f'We\'re sorry to see you go!\n\n'
            f'If you changed your mind or this was a mistake, you can '
            f'subscribe again at any time by visiting our website.'
        ),
        html_content=HtmlContent(
            f'<p>You have been successfully unsubscribed from our newsletter.</p>'
            f'<p>We\'re sorry to see you go!</p>'
            f'<p>If you changed your mind or this was a mistake, you can '
            f'subscribe again at any time by visiting our website.</p>'
        )
    )
    
    try:
        sg = get_sendgrid_client()
        response = sg.send(mail)
        return {
            'success': response.status_code == 202,
            'status_code': response.status_code
        }
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }


def send_test_email(newsletter, email):
    """Send a test newsletter email to a specific address."""
    # Create sender
    from_email = From(os.getenv('FROM_EMAIL', 'newsletter@example.com'), 'Newsletter Service')
    
    # Create recipient
    to_email = To(email)
    
    # Create unsubscribe link
    app_url = get_app_url()
    email_bytes = email.encode('utf-8')
    encoded_email = base64.b64encode(email_bytes).decode('utf-8')
    unsubscribe_link = urljoin(app_url, f'/api/unsubscribe/{encoded_email}')
    
    # Add test banner to newsletter content
    test_banner = (
        '<div style="background-color: #ffcc00; padding: 10px; margin-bottom: 20px; '
        'border-radius: 5px; text-align: center;">'
        '<strong>TEST EMAIL</strong> - This is a test newsletter and was not sent to subscribers.'
        '</div>'
    )
    
    # Add unsubscribe footer
    footer = (
        '<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; '
        'font-size: 12px; color: #666;">'
        '<p>You are receiving this email because you subscribed to our newsletter.</p>'
        f'<p>To unsubscribe, <a href="{unsubscribe_link}">click here</a>.</p>'
        '</div>'
    )
    
    # Combine content
    html_content = f'{test_banner}{newsletter["content"]}{footer}'
    
    # Create email
    mail = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=Subject(f'[TEST] {newsletter["title"]}'),
        html_content=HtmlContent(html_content)
    )
    
    try:
        sg = get_sendgrid_client()
        response = sg.send(mail)
        return {
            'success': response.status_code == 202,
            'status_code': response.status_code
        }
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }


def send_campaign_email(campaign, newsletter, subscribers, batch_start=0, batch_size=100):
    """
    Send campaign emails to a batch of subscribers.
    
    Args:
        campaign: Campaign document
        newsletter: Newsletter document
        subscribers: List of all target subscribers
        batch_start: Start index for this batch
        batch_size: Size of this batch
        
    Returns:
        dict with success status and batch information
    """
    if not subscribers or batch_start >= len(subscribers):
        return {
            'success': True,
            'message': 'No subscribers in batch',
            'batch_completed': True,
            'emails_sent': 0
        }
    
    # Get batch of subscribers
    batch_end = min(batch_start + batch_size, len(subscribers))
    batch_subscribers = subscribers[batch_start:batch_end]
    
    # Initialize SendGrid client
    sg = get_sendgrid_client()
    
    # Create sender
    from_email = From(os.getenv('FROM_EMAIL', 'newsletter@example.com'), 'Newsletter Service')
    
    # Get base URL for unsubscribe links
    app_url = get_app_url()
    
    # Track emails sent
    emails_sent = 0
    
    for subscriber in batch_subscribers:
        try:
            # Create recipient
            to_email = To(subscriber['email'], subscriber.get('name', ''))
            
            # Create unsubscribe link
            email_bytes = subscriber['email'].encode('utf-8')
            encoded_email = base64.b64encode(email_bytes).decode('utf-8')
            unsubscribe_link = urljoin(app_url, f'/api/unsubscribe/{encoded_email}')
            
            # Add unsubscribe footer
            footer = (
                '<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; '
                'font-size: 12px; color: #666;">'
                '<p>You are receiving this email because you subscribed to our newsletter.</p>'
                f'<p>To unsubscribe, <a href="{unsubscribe_link}">click here</a>.</p>'
                '</div>'
            )
            
            # Combine content
            html_content = f'{newsletter["content"]}{footer}'
            
            # Create email
            mail = Mail(
                from_email=from_email,
                to_emails=to_email,
                subject=Subject(newsletter["title"]),
                html_content=HtmlContent(html_content)
            )
            
            # Add campaign ID as custom arg for webhooks
            mail.add_custom_arg(CustomArg('campaign_id', campaign['_id']))
            
            # Send email
            response = sg.send(mail)
            
            if response.status_code == 202:
                emails_sent += 1
        
        except Exception as e:
            # Log error but continue with other subscribers
            print(f"Error sending to {subscriber['email']}: {str(e)}")
    
    # Determine if this was the last batch
    batch_completed = batch_end >= len(subscribers)
    
    return {
        'success': True,
        'batch_start': batch_start,
        'batch_end': batch_end,
        'batch_size': batch_size,
        'batch_completed': batch_completed,
        'emails_sent': emails_sent,
        'total_subscribers': len(subscribers)
    } 