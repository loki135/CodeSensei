import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js'; // Assuming you have this middleware
import mongoose from 'mongoose';
import Review from '../models/Review.js';

const router = express.Router();

// Token blacklist to store invalidated tokens
const tokenBlacklist = new Set();

// Store active sessions
const activeSessions = new Map();

// Store logout history
const logoutHistory = new Map();

// Helper to create session info
const createSessionInfo = (token, userId, ip) => {
  const decoded = jwt.decode(token);
  return {
    token,
    userId,
    createdAt: new Date(decoded.iat * 1000),
    expiresAt: new Date(decoded.exp * 1000),
    device: 'Web Browser', // Could be enhanced with actual device info
    lastActive: new Date(),
    ipAddress: ip,
    logoutReason: null
  };
};

// Helper to add to logout history
const addToLogoutHistory = (session, reason) => {
  const history = logoutHistory.get(session.userId) || [];
  history.push({
    token: session.token,
    ipAddress: session.ipAddress,
    device: session.device,
    loggedOutAt: new Date(),
    reason: reason,
    sessionDuration: new Date() - session.createdAt
  });
  logoutHistory.set(session.userId, history);
};

// Middleware to check if token is blacklisted
const checkBlacklist = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token && tokenBlacklist.has(token)) {
    return res.status(401).json({
      status: 'error',
      message: 'Token has been invalidated'
    });
  }
  next();
};

// Middleware to update last active time
const updateLastActive = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token && activeSessions.has(token)) {
    const session = activeSessions.get(token);
    session.lastActive = new Date();
    // Update IP address if it has changed
    const currentIp = req.ip || req.connection.remoteAddress;
    if (currentIp !== session.ipAddress) {
      session.ipAddress = currentIp;
    }
    activeSessions.set(token, session);
  }
  next();
};

// GET user profile
router.get('/profile', requireAuth, updateLastActive, async (req, res) => {
  try {
    // User ID is available from requireAuth middleware (assuming it adds user.id to req)
    const user = await User.findById(req.user.id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', data: user });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get active sessions
router.get('/sessions', checkBlacklist, updateLastActive, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get all sessions for this user
    const userSessions = Array.from(activeSessions.values())
      .filter(session => session.userId === userId)
      .map(session => ({
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        device: session.device,
        lastActive: session.lastActive,
        ipAddress: session.ipAddress,
        isCurrent: session.token === token
      }));

    res.json({
      status: 'success',
      data: {
        sessions: userSessions
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching sessions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get logout history
router.get('/logout-history', checkBlacklist, updateLastActive, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const history = logoutHistory.get(userId) || [];
    
    res.json({
      status: 'success',
      data: {
        history: history.map(entry => ({
          ...entry,
          sessionDuration: Math.floor(entry.sessionDuration / 1000) // Convert to seconds
        }))
      }
    });
  } catch (error) {
    console.error('Get logout history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching logout history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout from all devices
router.post('/logout-all', checkBlacklist, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get all sessions for this user
    const userSessions = Array.from(activeSessions.values())
      .filter(session => session.userId === userId);

    // Add all sessions to blacklist and history
    userSessions.forEach(session => {
      tokenBlacklist.add(session.token);
      addToLogoutHistory(session, 'Logged out from all devices');
      activeSessions.delete(session.token);
    });

    res.json({
      status: 'success',
      message: 'Successfully logged out from all devices',
      data: {
        sessionsTerminated: userSessions.length
      }
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout all',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout from all other devices
router.post('/logout-others', checkBlacklist, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get all other sessions for this user
    const otherSessions = Array.from(activeSessions.values())
      .filter(session => session.userId === userId && session.token !== token);

    // Add other sessions to blacklist and history
    otherSessions.forEach(session => {
      tokenBlacklist.add(session.token);
      addToLogoutHistory(session, 'Logged out from other device');
      activeSessions.delete(session.token);
    });

    res.json({
      status: 'success',
      message: 'Successfully logged out from other devices',
      data: {
        sessionsTerminated: otherSessions.length
      }
    });
  } catch (error) {
    console.error('Logout others error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout others',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// UPDATE user profile
router.patch('/profile', requireAuth, updateLastActive, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body; // Data to update profile

    // Find the user and update their profile
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password'); // Return updated user and exclude password

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// CHANGE user password
router.post('/profile/change-password', requireAuth, updateLastActive, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Both current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();

    // Add current session to blacklist to force re-login
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      tokenBlacklist.add(token);
      activeSessions.delete(token);
    }

    res.json({ 
      status: 'success', 
      message: 'Password changed successfully. Please log in again with your new password.' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error changing password',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE user account
router.delete('/account', requireAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    // Delete all reviews associated with the user
    const reviewResult = await Review.deleteMany({ user: userId }).session(session);
    console.log(`Deleted ${reviewResult.deletedCount} reviews for user ${userId}`);

    // Delete the user
    const userResult = await User.findByIdAndDelete(userId).session(session);
    if (!userResult) {
      throw new Error('User not found');
    }
    console.log(`Deleted user ${userId}`);

    // Add all user's sessions to blacklist
    const userSessions = Array.from(activeSessions.values())
      .filter(session => session.userId === userId);
    
    userSessions.forEach(session => {
      tokenBlacklist.add(session.token);
      addToLogoutHistory(session, 'Account deleted');
      activeSessions.delete(session.token);
    });
    console.log(`Blacklisted ${userSessions.length} sessions for user ${userId}`);

    // Clear user's logout history
    logoutHistory.delete(userId);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      status: 'success',
      message: 'Account successfully deleted',
      data: {
        reviewsDeleted: reviewResult.deletedCount,
        sessionsTerminated: userSessions.length
      }
    });
  } catch (error) {
    // If anything fails, rollback the transaction
    await session.abortTransaction();
    session.endSession();

    console.error('Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced logout route with reason
router.post('/logout', checkBlacklist, (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { reason } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const session = activeSessions.get(token);
    if (session) {
      // Add to logout history
      addToLogoutHistory(session, reason || 'User logged out');
    }

    // Add token to blacklist
    if (token) {
      tokenBlacklist.add(token);
      activeSessions.delete(token);
    }

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  // Set a timeout for this specific request
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('Register request timeout');
      res.status(408).json({
        status: 'error',
        message: 'Registration request timed out. Please try again.'
      });
    }
  }, 25000); // 25 second timeout

  try {
    const { username, email, password, name } = req.body;

    // Validate input
    if (!username || !email || !password) {
      clearTimeout(timeout);
      return res.status(400).json({
        status: 'error',
        message: 'Username, email, and password are required'
      });
    }

    // Check if username or email was previously used (including deleted accounts)
    const existingUser = await User.findOne({
      $or: [
        { username },
        { email }
      ]
    });

    if (existingUser) {
      clearTimeout(timeout);
      return res.status(400).json({
        status: 'error',
        message: 'Username or email is already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      name
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session info
    const sessionInfo = createSessionInfo(token, user._id, req.ip);
    activeSessions.set(token, sessionInfo);

    clearTimeout(timeout);
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (error) {
    clearTimeout(timeout);
    console.error('Register error:', error);
    
    // Handle specific database errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Username or email is already taken'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  // Set a timeout for this specific request
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('Login request timeout');
      res.status(408).json({
        status: 'error',
        message: 'Login request timed out. Please try again.'
      });
    }
  }, 25000); // 25 second timeout

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      clearTimeout(timeout);
      return res.status(400).json({
        status: 'error',
        message: 'Username and password are required'
      });
    }

    // Find user by username or email (active users only)
    const user = await User.findByCredentials(username);
    if (!user) {
      clearTimeout(timeout);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if account is deleted
    if (user.isDeleted) {
      clearTimeout(timeout);
      return res.status(401).json({
        status: 'error',
        message: 'This account has been deleted. Please create a new account.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      clearTimeout(timeout);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session info
    const sessionInfo = createSessionInfo(token, user._id, req.ip);
    activeSessions.set(token, sessionInfo);

    clearTimeout(timeout);
    res.json({
      status: 'success',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (error) {
    clearTimeout(timeout);
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET user stats
router.get('/profile/stats', requireAuth, updateLastActive, async (req, res) => {
  try {
    // In a real application, fetch user stats from the database
    // For now, return mock data
    const mockStats = {
      totalReviews: 42,
      lastReviewDate: new Date().toISOString(),
      reviewsByType: {
        javascript: 20,
        python: 15,
        java: 7
      }
    };

    res.json({ status: 'success', data: mockStats });
  } catch (error) {
    console.error('Fetch user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user stats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Temporary endpoint to check account status
router.post('/check-account', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    if (!username && !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide either username or email'
      });
    }

    const query = {};
    if (username) query.username = username;
    if (email) query.email = email;

    const user = await User.findOne(query).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Account not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        exists: true,
        isDeleted: user.isDeleted,
        deletedAt: user.deletedAt,
        createdAt: user.createdAt,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Check account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking account status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export the router
export default router; 