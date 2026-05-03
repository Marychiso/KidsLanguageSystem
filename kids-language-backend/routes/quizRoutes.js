const express = require("express");
const router = express.Router();
const Quiz = require("../models/QuizModel");

// Add new quiz
router.post("/add", async (req, res) => {
  try {
    const { title, level, languageId, category, page, description } = req.body;

    const newQuiz = new Quiz({
      title,
      level,
      languageId,
      category,
      page,
      description
    });

    const savedQuiz = await newQuiz.save();

    res.status(201).json({
      message: "Quiz added successfully",
      quiz: savedQuiz
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get all quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("languageId");
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get quizzes by language
router.get("/language/:languageId", async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      languageId: req.params.languageId
    });

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;