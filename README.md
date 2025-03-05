# Newsletter Service - Full Stack Solution

A complete newsletter service built with:
- **Backend**: Flask RESTful API
- **Database**: MongoDB Atlas (Free Tier)
- **Email Service**: SendGrid
- **Hosting**: Heroku
- **Frontend**: React/TypeScript

## Project Structure

- `/backend` - Flask backend application
- `/src` - React frontend application

## Backend

The backend is a Flask application that provides the RESTful API for the newsletter service. It uses MongoDB Atlas for data storage and SendGrid for email delivery.

See the [backend README](backend/README.md) for detailed setup and deployment instructions.

### Key Features

- Subscriber management with double opt-in verification
- Newsletter creation with HTML content
- Campaign scheduling and batch sending
- Statistics and analytics
- Secure admin dashboard

## Frontend

The frontend is a React/TypeScript application that provides the user interface for both subscribers and administrators.

### Key Components

- **Subscription Form** - Allows visitors to subscribe to the newsletter
- **Admin Dashboard** - Secure interface for administrators
  - Subscriber Management
  - Newsletter Management with rich text editor
  - Campaign Management
  - Statistics and Analytics

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python 3.8+
- MongoDB Atlas account
- SendGrid account
- Heroku account

### Development Setup

1. Clone the repository
```
git clone <repository-url>
cd newsletter-service
```

2. Set up the backend (See backend README for details)
```
cd backend
# Follow setup instructions in backend/README.md
```

3. Set up the frontend
```
# From the project root
npm install
npm start
```

## Deployment

See the detailed deployment instructions in the backend README.

## License

MIT 