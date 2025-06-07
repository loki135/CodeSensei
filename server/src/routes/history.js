import express from 'express';
import { auth } from '../middleware/auth.js';
import Review from '../models/Review.js'; // Import the Review model

const router = express.Router();

// GET user review history
router.get('/', auth, async (req, res) => {
  try {
    // Fetch review history from the database for the authenticated user
    const reviews = await Review.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json({ status: 'success', data: reviews });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router; 