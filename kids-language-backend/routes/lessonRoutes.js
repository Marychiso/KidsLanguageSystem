
const express = require("express");
console.log("LESSON ROUTES FILE LOADED - REAL VERSION");
const router = express.Router();
const Lesson = require("../models/LessonModel");

// test route
router.get("/test", (req, res) => {
  res.send("Lesson test route works");
});

// Add new lesson
router.post("/add", async (req, res) => {
  try {
    const { title, level, languageId, category, page, description } = req.body;

    const newLesson = new Lesson({
      title,
      level,
      languageId,
      category,
      page,
      description
    });

    const savedLesson = await newLesson.save();

    res.status(201).json({
      message: "Lesson added successfully",
      lesson: savedLesson
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});
// Get all lessons
router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.find().populate("languageId");
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get lessons by language
router.get("/language/:languageId", async (req, res) => {
  try {
    const lessons = await Lesson.find({
      languageId: req.params.languageId
    });

    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;