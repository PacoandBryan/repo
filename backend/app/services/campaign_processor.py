import time
from datetime import datetime
from bson import ObjectId
from ..models.campaign import Campaign
from ..models.newsletter import Newsletter
from ..models.subscriber import Subscriber
from .email_service import send_campaign_email

class CampaignProcessor:
    """
    Service for processing campaigns.
    """
    
    def __init__(self, db):
        """Initialize with database connection."""
        self.db = db
    
    def process_due_campaigns(self):
        """Process all campaigns that are due to be sent."""
        # Get campaigns that are scheduled and due
        due_campaigns = Campaign.get_due_campaigns(self.db)
        
        for campaign in due_campaigns:
            self.process_campaign(campaign['_id'])
    
    def process_campaign(self, campaign_id):
        """
        Process a specific campaign.
        
        Args:
            campaign_id: ID of the campaign to process
        
        Returns:
            dict with process results
        """
        # Get campaign
        campaign = Campaign.get_by_id(self.db, campaign_id)
        if not campaign:
            return {
                'success': False,
                'message': f'Campaign {campaign_id} not found'
            }
        
        # Check campaign status
        if campaign['status'] != Campaign.STATUS_SCHEDULED:
            return {
                'success': False,
                'message': f'Campaign {campaign_id} is not scheduled (current status: {campaign["status"]})'
            }
        
        # Get newsletter
        try:
            newsletter_id = ObjectId(campaign['newsletterId'])
        except Exception:
            return {
                'success': False,
                'message': f'Invalid newsletter ID in campaign {campaign_id}'
            }
            
        newsletter = Newsletter.get_by_id(self.db, campaign['newsletterId'])
        if not newsletter:
            # Update campaign status to failed
            Campaign.update_status(self.db, campaign_id, Campaign.STATUS_FAILED)
            return {
                'success': False,
                'message': f'Newsletter {campaign["newsletterId"]} not found for campaign {campaign_id}'
            }
        
        # Get target subscribers
        target_audience = campaign.get('targetAudience', {})
        topics = target_audience.get('topics', [])
        
        subscribers = Subscriber.get_active_subscribers(
            self.db, 
            topic_filter=topics if topics else None
        )
        
        if not subscribers:
            # Update campaign status to completed (no subscribers to send to)
            Campaign.update_status(
                self.db, campaign_id, Campaign.STATUS_COMPLETED,
                sent_date=datetime.utcnow(),
                completed_date=datetime.utcnow()
            )
            return {
                'success': True,
                'message': f'No subscribers found for campaign {campaign_id}'
            }
        
        # Update campaign status to sending
        Campaign.update_status(self.db, campaign_id, Campaign.STATUS_SENDING)
        
        # Update total subscribers
        Campaign.update_statistics(self.db, campaign_id, {
            'totalSubscribers': len(subscribers)
        })
        
        # Process in batches
        batch_size = campaign.get('batchingConfig', {}).get('batchSize', 100)
        interval_seconds = campaign.get('batchingConfig', {}).get('intervalSeconds', 60)
        
        total_sent = 0
        batch_start = 0
        
        while batch_start < len(subscribers):
            # Send batch
            result = send_campaign_email(
                campaign, newsletter, subscribers,
                batch_start=batch_start, batch_size=batch_size
            )
            
            # Update sent count
            emails_sent = result.get('emails_sent', 0)
            total_sent += emails_sent
            
            # Update statistics
            Campaign.update_statistics(self.db, campaign_id, {
                'emailsSent': total_sent
            })
            
            # Check if completed
            if result.get('batch_completed', False):
                # Update campaign status to completed
                Campaign.update_status(self.db, campaign_id, Campaign.STATUS_COMPLETED)
                break
            
            # Move to next batch
            batch_start += batch_size
            
            # Wait for interval before sending next batch
            time.sleep(interval_seconds)
        
        return {
            'success': True,
            'message': f'Campaign {campaign_id} processed successfully',
            'total_subscribers': len(subscribers),
            'emails_sent': total_sent
        }
    
    def retry_failed_campaign(self, campaign_id):
        """
        Retry a failed campaign.
        
        Args:
            campaign_id: ID of the campaign to retry
        
        Returns:
            dict with process results
        """
        # Get campaign
        campaign = Campaign.get_by_id(self.db, campaign_id)
        if not campaign:
            return {
                'success': False,
                'message': f'Campaign {campaign_id} not found'
            }
        
        # Check campaign status
        if campaign['status'] != Campaign.STATUS_FAILED:
            return {
                'success': False,
                'message': f'Campaign {campaign_id} is not failed (current status: {campaign["status"]})'
            }
        
        # Reset campaign to scheduled
        Campaign.update_status(self.db, campaign_id, Campaign.STATUS_SCHEDULED)
        
        # Process campaign
        return self.process_campaign(campaign_id) 