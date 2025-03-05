from datetime import datetime
from bson import ObjectId


class Newsletter:
    """
    Newsletter model representing newsletter content
    
    Fields:
    - _id: ObjectId
    - title: String
    - content: String (HTML content)
    - createdDate: Date
    - topic: String (optional)
    - createdBy: String (admin email)
    """
    
    collection_name = 'newsletters'
    
    @staticmethod
    def to_dict(newsletter):
        """Convert newsletter document to dictionary."""
        if isinstance(newsletter.get('_id'), ObjectId):
            newsletter['_id'] = str(newsletter['_id'])
        return newsletter
    
    @staticmethod
    def create(db, title, content, created_by, topic=None):
        """Create a new newsletter."""
        newsletter = {
            'title': title,
            'content': content,
            'createdDate': datetime.utcnow(),
            'topic': topic,
            'createdBy': created_by
        }
        
        result = db[Newsletter.collection_name].insert_one(newsletter)
        newsletter['_id'] = str(result.inserted_id)
        return newsletter
    
    @staticmethod
    def get_by_id(db, newsletter_id):
        """Get newsletter by ID."""
        try:
            obj_id = ObjectId(newsletter_id)
        except Exception:
            return None
            
        newsletter = db[Newsletter.collection_name].find_one({'_id': obj_id})
        if newsletter:
            return Newsletter.to_dict(newsletter)
        return None
    
    @staticmethod
    def update(db, newsletter_id, title=None, content=None, topic=None):
        """Update a newsletter."""
        try:
            obj_id = ObjectId(newsletter_id)
        except Exception:
            return False
            
        update_data = {}
        if title is not None:
            update_data['title'] = title
        if content is not None:
            update_data['content'] = content
        if topic is not None:
            update_data['topic'] = topic
            
        if not update_data:
            return False
            
        result = db[Newsletter.collection_name].update_one(
            {'_id': obj_id},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @staticmethod
    def delete(db, newsletter_id):
        """Delete a newsletter."""
        try:
            obj_id = ObjectId(newsletter_id)
        except Exception:
            return False
            
        result = db[Newsletter.collection_name].delete_one({'_id': obj_id})
        return result.deleted_count > 0
    
    @staticmethod
    def get_all(db, topic=None, limit=100, skip=0):
        """Get all newsletters, optionally filtered by topic."""
        query = {}
        
        if topic:
            query['topic'] = topic
            
        newsletters = list(db[Newsletter.collection_name]
                           .find(query)
                           .sort('createdDate', -1)
                           .skip(skip)
                           .limit(limit))
                           
        return [Newsletter.to_dict(newsletter) for newsletter in newsletters] 