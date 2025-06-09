import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import Review from '../models/Review.js'; // Import the Review model

const router = express.Router();

// GET user review history
router.get('/', requireAuth, async (req, res) => {
  try {
    // Fetch review history from the database for the authenticated user
    const reviews = await Review.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({ 
      status: 'success', 
      data: reviews 
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 