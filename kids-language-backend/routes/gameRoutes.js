const express = require("express");
const router = express.Router();
const Game = require("../models/GameModel");

// Add new game
router.post("/add", async (req, res) => {
  try {
    const { title, level, languageId, category, page, description } = req.body;

    const newGame = new Game({
      title,
      level,
      languageId,
      category,
      page,
      description
    });

    const savedGame = await newGame.save();

    res.status(201).json({
      message: "Game added successfully",
      game: savedGame
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get all games
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().populate("languageId");
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get games by language
router.get("/language/:languageId", async (req, res) => {
  try {
    const games = await Game.find({
      languageId: req.params.languageId
    });

    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;