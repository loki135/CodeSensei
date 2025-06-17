const express = require("express");
const router = express.Router();
const { reviewCode } = require("../controllers/codeReviewController");
const auth = require("../middleware/auth");
const Review = require("../models/Review");

// Submit code for review
router.post("/review", auth, reviewCode);

// Get user's review history
router.get("/history", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      status: "success",
      data: reviews
    });
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch review history"
    });
  }
});

module.exports = router;
