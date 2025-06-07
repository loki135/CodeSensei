# CodeSensei


CodeSensei is an intelligent code review and analysis platform that helps developers improve their code quality through AI-powered reviews and suggestions.

## Features

- 🤖 AI-powered code review
- 🔐 User authentication and profile management
- 📊 Code review statistics and history
- 🌐 RESTful API architecture
- 🐳 Docker containerization
- 🔄 Real-time code analysis

## Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **AI Integration**: Cohere API
- **Containerization**: Docker
- **Authentication**: JWT

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- MongoDB (or use the Docker container)
- Cohere API key

## Getting Started

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/codesensei.git
cd codesensei
```

2. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/codesensei
JWT_SECRET=your_jwt_secret
COHERE_API_KEY=your_cohere_api_key
```

### Running with Docker

1. Build and start the containers:
```bash
docker compose up --build
```

2. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:5000

### Running Locally

1. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. Start the development servers:
```bash
# Start backend server
cd server
npm run dev

# Start frontend server
cd client
npm run dev
```

## API Documentation

### Authentication Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Code Review Endpoints

- `POST /api/review` - Submit code for review

### Profile Endpoints

- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile
- `POST /api/profile/change-password` - Change password
- `DELETE /api/profile` - Delete account
- `GET /api/profile/stats` - Get user's review statistics

## Project Structure

```
codesensei/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── server.js         # Main application file
├── docker-compose.yml     # Docker compose configuration
└── README.md             # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Cohere](https://cohere.ai/) for AI capabilities
- [Express.js](https://expressjs.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [MongoDB](https://www.mongodb.com/) for the database 