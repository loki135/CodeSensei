const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    res.json(req.user.getPublicProfile());
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res, next) => {
  const updates = req.body;
  const allowedUpdates = [
    'name',
    'bio',
    'preferredLanguages',
    'githubUsername',
    'avatarUrl',
    'settings',
  ];

  try {
    // Filter out any fields that aren't in allowedUpdates
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Update the user
    Object.assign(req.user, filteredUpdates);
    await req.user.save();

    res.json(req.user.getPublicProfile());
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/profile/change-password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/profile', auth, async (req, res, next) => {
  try {
    await req.user.remove();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user's review statistics
router.get('/profile/stats', auth, async (req, res, next) => {
  try {
    const Review = require('../models/Review');
    
    const stats = await Review.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$reviewType',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReviews = await Review.countDocuments({ userId: req.user._id });
    const lastReview = await Review.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('createdAt');

    res.json({
      totalReviews,
      lastReviewDate: lastReview?.createdAt,
      reviewsByType: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 