from datetime import datetime, timedelta
import uuid
from bson import ObjectId


def generate_verification_token():
    """Generate a unique verification token."""
    return str(uuid.uuid4())


def get_verification_expiry():
    """Get expiry time for verification token (48 hours from now)."""
    return datetime.utcnow() + timedelta(hours=48)


class Subscriber:
    """
    Subscriber model representing a newsletter subscriber
    
    Fields:
    - _id: ObjectId (auto-generated)
    - email: String (unique, indexed)
    - name: String (optional)
    - subscriptionDate: Date
    - isActive: Boolean
    - verificationToken: String (for email verification)
    - verificationExpiry: Date
    - topics: Array of Strings (optional for topic preferences)
    """

    collection_name = 'subscribers'

    @staticmethod
    def create_indexes(db):
        """Create necessary indexes for the subscribers collection."""
        db[Subscriber.collection_name].create_index('email', unique=True)
        # TTL index for verification tokens that automatically removes expired tokens
        db[Subscriber.collection_name].create_index(
            'verificationExpiry', 
            expireAfterSeconds=0  # Document will be removed after expiry time
        )

    @staticmethod
    def to_dict(subscriber):
        """Convert subscriber document to dictionary."""
        if isinstance(subscriber.get('_id'), ObjectId):
            subscriber['_id'] = str(subscriber['_id'])
        return subscriber

    @staticmethod
    def create(db, email, name=None, topics=None):
        """Create a new subscriber."""
        subscriber = {
            'email': email.lower().strip(),
            'name': name,
            'subscriptionDate': datetime.utcnow(),
            'isActive': False,  # Inactive until verified
            'verificationToken': generate_verification_token(),
            'verificationExpiry': get_verification_expiry(),
            'topics': topics or []
        }
        
        result = db[Subscriber.collection_name].insert_one(subscriber)
        subscriber['_id'] = str(result.inserted_id)
        return subscriber

    @staticmethod
    def get_by_email(db, email):
        """Get subscriber by email."""
        subscriber = db[Subscriber.collection_name].find_one({'email': email.lower().strip()})
        if subscriber:
            return Subscriber.to_dict(subscriber)
        return None

    @staticmethod
    def get_by_verification_token(db, token):
        """Get subscriber by verification token."""
        subscriber = db[Subscriber.collection_name].find_one({'verificationToken': token})
        if subscriber:
            return Subscriber.to_dict(subscriber)
        return None

    @staticmethod
    def verify(db, token):
        """Verify a subscriber by token."""
        result = db[Subscriber.collection_name].update_one(
            {
                'verificationToken': token,
                'verificationExpiry': {'$gt': datetime.utcnow()}
            },
            {
                '$set': {
                    'isActive': True,
                    'verificationToken': None,
                    'verificationExpiry': None
                }
            }
        )
        return result.modified_count > 0

    @staticmethod
    def unsubscribe(db, email):
        """Unsubscribe a subscriber by email."""
        result = db[Subscriber.collection_name].update_one(
            {'email': email.lower().strip()},
            {'$set': {'isActive': False}}
        )
        return result.modified_count > 0

    @staticmethod
    def update_topics(db, email, topics):
        """Update subscriber topics."""
        result = db[Subscriber.collection_name].update_one(
            {'email': email.lower().strip()},
            {'$set': {'topics': topics}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def get_active_subscribers(db, topic_filter=None):
        """Get all active subscribers, optionally filtered by topics."""
        query = {'isActive': True}
        
        if topic_filter:
            query['topics'] = {'$in': topic_filter if isinstance(topic_filter, list) else [topic_filter]}
            
        subscribers = list(db[Subscriber.collection_name].find(query))
        return [Subscriber.to_dict(subscriber) for subscriber in subscribers] 