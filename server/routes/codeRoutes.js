const express = require("express");
const router = express.Router();
const { reviewCode } = require("../controllers/codeReviewController");

router.post("/review", reviewCode);

module.exports = router;
