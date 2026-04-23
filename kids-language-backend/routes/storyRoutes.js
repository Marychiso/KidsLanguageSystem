const express = require("express");
const router = express.Router();
const Story = require("../models/StoryModel");

console.log("Story import:", Story);
console.log("Story type:", typeof Story);

// Add new story
router.post("/add", async (req, res) => {
  try {
    const { title, level, languageId, category, page, description } = req.body;

    const newStory = new Story({
      title,
      level,
      languageId,
      category,
      page,
      description
    });

    const savedStory = await newStory.save();

    res.status(201).json({
      message: "Story added successfully",
      story: savedStory
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get all stories
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().populate("languageId");
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get stories by language
router.get("/language/:languageId", async (req, res) => {
  try {
    const stories = await Story.find({
      languageId: req.params.languageId
    });

    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;