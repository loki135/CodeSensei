// Load environment variables first
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { validateEnv } from './config/validateEnv.js';
import authRoutes from './routes/auth.js';
import reviewRoutes from './routes/review.js';
import historyRoutes from './routes/history.js';
import accountRoutes from './routes/account.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug environment variables
console.log('Current directory:', __dirname);
console.log('Environment file path:', path.join(__dirname, '../.env'));
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? '[SET]' : '[NOT SET]',
  JWT_SECRET: process.env.JWT_SECRET ? '[SET]' : '[NOT SET]',
  COHERE_API_KEY: process.env.COHERE_API_KEY ? '[SET]' : '[NOT SET]',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '[SET]' : '[NOT SET]'
});

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 5000;

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = [
  'https://codesensei135.netlify.app',
  'https://68459040e6d0885eee73db5b--codesensei135.netlify.app',
  'https://codesensei.netlify.app',
  'https://*.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin - allowing request');
      return callback(null, true);
    }

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = new RegExp('^' + allowedOrigin.replace('*', '.*') + '$');
        return pattern.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Add request logging and response time tracking middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set timeout for all requests
  req.setTimeout(30000, () => {
    console.error('Request timeout:', {
      method: req.method,
      url: req.url,
      duration: Date.now() - start
    });
    if (!res.headersSent) {
      res.status(408).json({
        status: 'error',
        message: 'Request timeout',
        path: req.path,
        method: req.method
      });
    }
  });

  // Track response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('x-response-time', `${duration}ms`);
    console.log(`Response time: ${duration}ms - ${req.method} ${req.url} - ${res.statusCode}`);
  });

  next();
});

// Apply rate limiting
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profile', accountRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to CodeSensei API',
    documentation: '/api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to CodeSensei API',
    endpoints: {
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login'
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
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    duration: Date.now() - req._startTime
  });

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(408).json({
      status: 'error',
      message: 'Request timeout',
      path: req.path,
      method: req.method
    });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      status: 'error',
      message: 'CORS error: Origin not allowed',
      path: req.path,
      method: req.method
    });
  }

  // Handle other errors
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB and start server
let server;
connectDB()
  .then(() => {
    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${port}/api/health`);
      console.log('Allowed CORS origins:', allowedOrigins);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
      }
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server?.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server?.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
}); 