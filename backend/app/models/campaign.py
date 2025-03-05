from datetime import datetime
from bson import ObjectId


class Campaign:
    """
    Campaign model representing an email campaign to send newsletters
    
    Fields:
    - _id: ObjectId
    - name: String (e.g., "July Product Update")
    - newsletterId: ObjectId (reference to newsletter content)
    - status: String (draft, scheduled, sending, completed, failed)
    - targetAudience: Object
      - topics: Array of Strings (optional topic filtering)
      - customFilter: Object (optional MongoDB query for targeting)
    - scheduledDate: Date
    - sentDate: Date (actual time campaign started)
    - completedDate: Date
    - statistics: Object
      - totalSubscribers: Number
      - emailsSent: Number
      - emailsDelivered: Number
      - openCount: Number
      - clickCount: Number
      - bounceCount: Number
      - unsubscribeCount: Number
    - sendGridCampaignId: String (for SendGrid reference)
    - createdBy: String (admin email)
    - createdAt: Date
    - batchingConfig: Object
      - batchSize: Number (e.g., 100)
      - intervalSeconds: Number (e.g., 60)
    """
    
    collection_name = 'campaigns'
    
    # Campaign status constants
    STATUS_DRAFT = 'draft'
    STATUS_SCHEDULED = 'scheduled'
    STATUS_SENDING = 'sending'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'
    
    @staticmethod
    def to_dict(campaign):
        """Convert campaign document to dictionary."""
        if isinstance(campaign.get('_id'), ObjectId):
            campaign['_id'] = str(campaign['_id'])
        if isinstance(campaign.get('newsletterId'), ObjectId):
            campaign['newsletterId'] = str(campaign['newsletterId'])
        return campaign
    
    @staticmethod
    def create(db, name, newsletter_id, created_by, target_audience=None, scheduled_date=None, batching_config=None):
        """Create a new campaign."""
        try:
            newsletter_obj_id = ObjectId(newsletter_id)
        except Exception:
            return None
            
        campaign = {
            'name': name,
            'newsletterId': newsletter_obj_id,
            'status': Campaign.STATUS_DRAFT,
            'targetAudience': target_audience or {'topics': []},
            'scheduledDate': scheduled_date,
            'sentDate': None,
            'completedDate': None,
            'statistics': {
                'totalSubscribers': 0,
                'emailsSent': 0,
                'emailsDelivered': 0,
                'openCount': 0,
                'clickCount': 0,
                'bounceCount': 0,
                'unsubscribeCount': 0
            },
            'sendGridCampaignId': None,
            'createdBy': created_by,
            'createdAt': datetime.utcnow(),
            'batchingConfig': batching_config or {
                'batchSize': 100,
                'intervalSeconds': 60
            }
        }
        
        result = db[Campaign.collection_name].insert_one(campaign)
        campaign['_id'] = str(result.inserted_id)
        return campaign
    
    @staticmethod
    def get_by_id(db, campaign_id):
        """Get campaign by ID."""
        try:
            obj_id = ObjectId(campaign_id)
        except Exception:
            return None
            
        campaign = db[Campaign.collection_name].find_one({'_id': obj_id})
        if campaign:
            return Campaign.to_dict(campaign)
        return None
    
    @staticmethod
    def update(db, campaign_id, name=None, target_audience=None, scheduled_date=None, batching_config=None):
        """Update a campaign."""
        try:
            obj_id = ObjectId(campaign_id)
        except Exception:
            return False
            
        # Can only update campaigns that are in draft status
        campaign = db[Campaign.collection_name].find_one({
            '_id': obj_id,
            'status': Campaign.STATUS_DRAFT
        })
        
        if not campaign:
            return False
            
        update_data = {}
        if name is not None:
            update_data['name'] = name
        if target_audience is not None:
            update_data['targetAudience'] = target_audience
        if scheduled_date is not None:
            update_data['scheduledDate'] = scheduled_date
            # If a scheduled date is set, update status to scheduled
            if scheduled_date:
                update_data['status'] = Campaign.STATUS_SCHEDULED
        if batching_config is not None:
            update_data['batchingConfig'] = batching_config
            
        if not update_data:
            return False
            
        result = db[Campaign.collection_name].update_one(
            {'_id': obj_id},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def delete(db, campaign_id):
        """Delete a campaign."""
        try:
            obj_id = ObjectId(campaign_id)
        except Exception:
            return False
            
        # Can only delete campaigns that are in draft status
        result = db[Campaign.collection_name].delete_one({
            '_id': obj_id,
            'status': Campaign.STATUS_DRAFT
        })
        return result.deleted_count > 0
    
    @staticmethod
    def get_due_campaigns(db):
        """Get campaigns that are scheduled to be sent."""
        now = datetime.utcnow()
        
        campaigns = list(db[Campaign.collection_name].find({
            'status': Campaign.STATUS_SCHEDULED,
            'scheduledDate': {'$lte': now}
        }))
        
        return [Campaign.to_dict(campaign) for campaign in campaigns]
    
    @staticmethod
    def update_status(db, campaign_id, status, sent_date=None, completed_date=None, sendgrid_campaign_id=None):
        """Update campaign status."""
        try:
            obj_id = ObjectId(campaign_id)
        except Exception:
            return False
            
        update_data = {'status': status}
        
        if status == Campaign.STATUS_SENDING and sent_date is None:
            update_data['sentDate'] = datetime.utcnow()
        elif sent_date is not None:
            update_data['sentDate'] = sent_date
            
        if status == Campaign.STATUS_COMPLETED and completed_date is None:
            update_data['completedDate'] = datetime.utcnow()
        elif completed_date is not None:
            update_data['completedDate'] = completed_date
            
        if sendgrid_campaign_id is not None:
            update_data['sendGridCampaignId'] = sendgrid_campaign_id
            
        result = db[Campaign.collection_name].update_one(
            {'_id': obj_id},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def update_statistics(db, campaign_id, statistics_update):
        """Update campaign statistics."""
        try:
            obj_id = ObjectId(campaign_id)
        except Exception:
            return False
            
        # Build the update operation for statistics
        update_operations = {}
        for key, value in statistics_update.items():
            if key in [
                'totalSubscribers', 'emailsSent', 'emailsDelivered',
                'openCount', 'clickCount', 'bounceCount', 'unsubscribeCount'
            ]:
                update_operations[f'statistics.{key}'] = value
                
        if not update_operations:
            return False
            
        result = db[Campaign.collection_name].update_one(
            {'_id': obj_id},
            {'$set': update_operations}
        )
        return result.modified_count > 0
    
    @staticmethod
    def increment_statistics(db, campaign_id, field, increment_by=1):
        """Increment a specific statistics field."""
        try:
            obj_id = ObjectId(campaign_id)
        except Exception:
            return False
            
        if field not in [
            'totalSubscribers', 'emailsSent', 'emailsDelivered',
            'openCount', 'clickCount', 'bounceCount', 'unsubscribeCount'
        ]:
            return False
            
        result = db[Campaign.collection_name].update_one(
            {'_id': obj_id},
            {'$inc': {f'statistics.{field}': increment_by}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def get_all(db, status=None, limit=100, skip=0):
        """Get all campaigns, optionally filtered by status."""
        query = {}
        
        if status:
            query['status'] = status
            
        campaigns = list(db[Campaign.collection_name]
                         .find(query)
                         .sort('createdAt', -1)
                         .skip(skip)
                         .limit(limit))
                         
        return [Campaign.to_dict(campaign) for campaign in campaigns] 