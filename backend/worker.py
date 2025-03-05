import os
import time
from app import get_db
from app.services.campaign_processor import CampaignProcessor

def process_campaigns():
    """Process due campaigns."""
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Campaign processor started")
    
    try:
        # Get database connection
        db = get_db()
        
        # Create processor
        processor = CampaignProcessor(db)
        
        # Process due campaigns
        processor.process_due_campaigns()
        
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Campaign processor completed")
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Error processing campaigns: {str(e)}")

if __name__ == '__main__':
    process_campaigns() 