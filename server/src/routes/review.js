import express from 'express';
import { CohereClient } from 'cohere-ai';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import Review from '../models/Review.js';
import { requireAuth } from '../middleware/authMiddleware.js';

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

// POST endpoint for code review
router.post('/', requireAuth, reviewLimiter, validateReviewRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, type, language } = req.body;
    const userId = req.user.id;

    // Create review record
    const review = new Review({
      user: userId,
      code,
      type,
      language,
      status: 'pending'
    });

    await review.save();

    // Call Cohere API for code review
    const response = await cohere.generate({
      prompt: `Review this ${language} code for ${type}:\n\n${code}`,
      max_tokens: 500,
      temperature: 0.7,
      k: 0,
      p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    });

    // Update review with suggestions
    review.review = response.generations[0].text;
    review.status = 'completed';
    await review.save();

    res.json({
      status: 'success',
      data: {
        suggestions: review.review,
        reviewId: review._id
      }
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during code review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 