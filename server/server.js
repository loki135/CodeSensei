const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const codeRoutes = require('./routes/codeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Validate MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  console.error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,
      'https://codesensei.netlify.app',
      'https://68459040e6d0885eee73db5b--codesensei135.netlify.app',
      'https://*.netlify.app'  // Allow all Netlify preview deployments
    ]
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];

console.log('Environment:', process.env.NODE_ENV);
console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request with no origin - allowing');
      return callback(null, true);
    }
    
    console.log('Request origin:', origin);
    
    // Check if origin matches any of the allowed patterns
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard patterns
        const pattern = new RegExp('^' + allowedOrigin.replace('*', '.*') + '$');
        return pattern.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (!isAllowed) {
      console.log('CORS blocked request from origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'));
    }
    
    console.log('CORS allowed request from origin:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request origin:', req.headers.origin);
  next();
});

app.use(express.json());

// Database connection with retry logic
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Environment:', process.env.NODE_ENV);
    
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('Connected to MongoDB Atlas');
    console.log('Database:', conn.connection.name);
    console.log('Host:', conn.connection.host);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Connection URI format:', MONGODB_URI ? 'Present' : 'Missing');
    console.error('Connection URI type:', typeof MONGODB_URI);
    console.error('Connection URI length:', MONGODB_URI ? MONGODB_URI.length : 0);
    console.error('Connection URI starts with:', MONGODB_URI ? MONGODB_URI.substring(0, 20) + '...' : 'N/A');
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to CodeSensei API',
    documentation: '/api',
    version: '1.0.0'
  });
});

// Base API route
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to CodeSensei API',
    endpoints: {
      auth: {
        register: '/api/register',
        login: '/api/login'
      },
      code: {
        review: '/api/review',
        history: '/api/history'
      },
      profile: {
        get: '/api/profile',
        update: '/api/profile',
        changePassword: '/api/profile/change-password',
        delete: '/api/profile',
        stats: '/api/profile/stats'
      }
    }
  });
});

// Routes
app.use('/api', authRoutes);
app.use('/api', codeRoutes);
app.use('/api', profileRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 