# Mini CRM Platform

A modern CRM platform built with the MERN stack that enables customer segmentation, personalized campaign delivery, and intelligent insights.

## Features

- 🔐 Google OAuth 2.0 Authentication
- 📊 Customer Data Management
- 🎯 Dynamic Audience Segmentation
- 📨 Campaign Management
- 📊 Campaign Analytics
- 🤖 AI-Powered Features
  - Natural Language to Segment Rules
  - AI-Driven Message Suggestions
  - Campaign Performance Summarization

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **Message Broker**: RabbitMQ (for async processing)
- **AI Integration**: OpenAI API

## Project Structure

```
crm/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── .env.example           # Example environment variables
└── README.md             # Project documentation
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- RabbitMQ
- Google Cloud Console account (for OAuth)
- OpenAI API key

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file based on .env.example:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file based on .env.example:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RABBITMQ_URL=amqp://localhost
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Architecture

The application follows a microservices architecture with the following components:

1. **API Layer**: Handles request validation and routing
2. **Message Broker**: Manages asynchronous processing of data ingestion and campaign delivery
3. **Consumer Services**: Process messages from the queue for data persistence and campaign delivery
4. **AI Service**: Handles natural language processing and campaign insights

## Known Limitations

- Campaign delivery simulation uses a dummy vendor API
- AI features require OpenAI API key
- Local development requires MongoDB and RabbitMQ to be running

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 