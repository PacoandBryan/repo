# Newsletter Service

A complete newsletter service built with Flask, MongoDB Atlas, and SendGrid.

## Features

- 📧 Subscriber management with double opt-in verification
- 📝 Newsletter creation with HTML content
- 🚀 Campaign scheduling and batch sending
- 📊 Statistics and analytics
- 🛡️ Secure admin dashboard

## Architecture

- **Backend**: Flask RESTful API
- **Database**: MongoDB Atlas (Free Tier)
- **Email Service**: SendGrid
- **Hosting**: Heroku

## Setup Instructions

### Prerequisites

- Python 3.8+
- MongoDB Atlas account
- SendGrid account
- Heroku account

### Local Development Setup

1. Clone the repository
```
git clone <repository-url>
cd newsletter-service/backend
```

2. Create a virtual environment
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example`
```
cp .env.example .env
```

5. Edit the `.env` file with your configuration

6. Run the application
```
python app.py
```

### MongoDB Atlas Setup

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (the free tier is sufficient for getting started)
3. Create a database user with read/write privileges
4. Set up IP access list (whitelist your IP or use 0.0.0.0/0 for development)
5. Get your connection string and update the `.env` file

### SendGrid Setup

1. Create a SendGrid account at https://sendgrid.com/
2. Create an API key with full access
3. Verify a sender identity (domain or single sender)
4. Set up event webhooks to point to `https://your-app-url.herokuapp.com/api/webhooks/sendgrid`
5. Update the `.env` file with your API key

### Heroku Deployment

1. Make sure you have the Heroku CLI installed
```
heroku login
```

2. Create a new Heroku app
```
heroku create your-newsletter-service
```

3. Add MongoDB and SendGrid add-ons (or use your existing accounts)
```
heroku addons:create mongolab:sandbox
heroku addons:create sendgrid:starter
```

4. Set environment variables
```
heroku config:set JWT_SECRET_KEY=your-secret-key
heroku config:set ADMIN_EMAIL=admin@example.com
heroku config:set ADMIN_PASSWORD=secure-password
heroku config:set APP_URL=https://your-newsletter-service.herokuapp.com
```

5. Deploy the application
```
git subtree push --prefix backend heroku main
```

6. Set up the Heroku Scheduler add-on
```
heroku addons:create scheduler:standard
```

7. Configure a job to run `python worker.py` every 10 minutes

## API Documentation

### Public Endpoints

- `POST /api/subscribe` - Subscribe to the newsletter
- `GET /api/verify/:token` - Verify subscription
- `GET /api/unsubscribe/:token` - Unsubscribe from the newsletter

### Admin Endpoints (Authentication Required)

- `POST /api/admin/auth` - Admin login
- `GET /api/admin/subscribers` - Get subscribers
- `GET/POST /api/admin/newsletters` - Manage newsletters
- `GET/POST /api/admin/campaigns` - Manage campaigns
- `GET /api/admin/stats` - Get service statistics

## Database Schema

### Subscribers Collection
- `_id`: ObjectId
- `email`: String (unique, indexed)
- `name`: String (optional)
- `subscriptionDate`: Date
- `isActive`: Boolean
- `verificationToken`: String
- `verificationExpiry`: Date
- `topics`: Array of Strings

### Newsletters Collection
- `_id`: ObjectId
- `title`: String
- `content`: String (HTML)
- `createdDate`: Date
- `topic`: String (optional)
- `createdBy`: String

### Campaigns Collection
- `_id`: ObjectId
- `name`: String
- `newsletterId`: ObjectId (reference)
- `status`: String (draft, scheduled, sending, completed, failed)
- `targetAudience`: Object
- `scheduledDate`: Date
- `sentDate`: Date
- `completedDate`: Date
- `statistics`: Object
- `sendGridCampaignId`: String
- `createdBy`: String
- `createdAt`: Date
- `batchingConfig`: Object

## License

MIT 