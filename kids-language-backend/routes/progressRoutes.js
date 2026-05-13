const express = require("express");
const router = express.Router();
const Progress = require("../models/ProgressModel");

// Add or update progress
router.post("/add", async (req, res) => {
  try {
    const { userId, contentType, contentId, title, completed, score } = req.body;

    const progress = await Progress.findOneAndUpdate(
      { userId, contentType, contentId },
      {
        userId,
        contentType,
        contentId,
        title,
        completed: completed !== undefined ? completed : true,
        score: score !== undefined ? score : null
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      message: "Progress saved successfully",
      progress
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get progress for one user
router.get("/user/:userId", async (req, res) => {
  try {
    const progress = await Progress.find({
      userId: req.params.userId
    });

    res.status(200).json(progress);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;