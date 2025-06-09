import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import Review from '../models/Review.js'; // Import the Review model

const router = express.Router();

// GET user review history
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('Fetching history for user:', req.user.id);
    
    // Fetch review history from the database for the authenticated user
    const reviews = await Review.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    console.log(`Found ${reviews.length} reviews for user ${req.user.id}`);

    // Always return success with data array (empty if no reviews)
    return res.json({ 
      status: 'success', 
      data: reviews || [],
      message: reviews.length === 0 ? 'No reviews found' : undefined
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 