import express from 'express';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Delete account
router.delete('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all reviews associated with the user
    const reviewResult = await Review.deleteMany({ user: userId });
    console.log(`Deleted ${reviewResult.deletedCount} reviews for user ${userId}`);

    // Delete the user
    const userResult = await User.findByIdAndDelete(userId);
    if (!userResult) {
      throw new Error('User not found');
    }
    console.log(`Deleted user ${userId}`);

    res.json({
      status: 'success',
      message: 'Account successfully deleted',
      data: {
        reviewsDeleted: reviewResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 