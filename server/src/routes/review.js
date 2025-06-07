import express from 'express';
import { CohereClient } from 'cohere-ai';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import Review from '../models/Review.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Initialize Cohere client with environment variable
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

// Debug logging for Cohere configuration
console.log('Cohere Configuration:', {
  apiKeyLength: process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY.length : 0,
  apiKeyPrefix: process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY.substring(0, 4) + '...' : 'Not Set',
  nodeEnv: process.env.NODE_ENV
});

// Test Cohere API key validity
const testCohereConnection = async () => {
  try {
    await cohere.generate({
      prompt: 'Test connection',
      max_tokens: 1,
      temperature: 0.7,
      k: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    });
    console.log('Cohere API key is valid');
  } catch (error) {
    console.error('Cohere API key validation failed:', {
      status: error.statusCode,
      message: error.message,
      details: error.body
    });
  }
};

// Test connection on startup
testCohereConnection();

// Token blacklist to store invalidated tokens
const tokenBlacklist = new Set();

// Rate limit specifically for review endpoint
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  message: {
    status: 'error',
    message: 'Too many review requests. Please try again later.'
  }
});

// Validation middleware
const validateReviewRequest = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 5000 })
    .withMessage('Code must be less than 5000 characters'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Review type is required')
    .isIn(['bug', 'optimization', 'readability'])
    .withMessage('Invalid review type'),
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required')
    .isIn(['javascript', 'python', 'java', 'cpp'])
    .withMessage('Invalid language'),
];

// Middleware to verify authentication
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  const token = authHeader.split(' ')[1];
  
  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({
      status: 'error',
      message: 'Token has been invalidated'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

// GET endpoint for API information
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Code Review API',
    usage: {
      method: 'POST',
      endpoint: '/api/review',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: {
        code: 'Your code to review',
        type: 'bug | optimization | readability',
        language: 'javascript | python | java | cpp'
      }
    }
  });
});

// Submit code for review
router.post('/', auth, validateReviewRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { code, language, type } = req.body;
    const userId = req.user.id;

    if (!process.env.COHERE_API_KEY) {
      throw new Error('Cohere API key is not configured');
    }

    console.log('Received review request:', { language, type, codeLength: code.length });

    // Generate review using Cohere
    console.log('Sending request to Cohere...');
    try {
      const response = await cohere.generate({
        prompt: `Review this ${language} code for ${type} issues and provide feedback on code quality, potential bugs, and suggestions for improvement:\n\n${code}`,
        max_tokens: 500,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      });

      console.log('Received response from Cohere');

      // Save review to database
      const review = new Review({
        userId,
        code,
        language,
        type,
        review: response.generations[0].text,
        createdAt: new Date()
      });

      await review.save();
      console.log('Saved review to database:', review._id);

      res.json({
        status: 'success',
        data: {
          suggestions: response.generations[0].text,
          reviewId: review._id
        }
      });
    } catch (cohereError) {
      console.error('Cohere API Error:', {
        status: cohereError.statusCode,
        message: cohereError.message,
        details: cohereError.body
      });
      
      return res.status(502).json({
        status: 'error',
        message: 'Error communicating with AI service',
        details: cohereError.message
      });
    }
  } catch (error) {
    console.error('Error in review submission:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        details: error.message
      });
    }

    res.status(500).json({ 
      status: 'error',
      message: 'Failed to generate review',
      details: error.message
    });
  }
});

export default router; 