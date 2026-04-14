const express = require("express");
console.log("languageRoutes file loaded");
const router = express.Router();
const Language = require("../models/Language");

// Add new language
router.post("/add", async (req, res) => {
  try {
    const { name, code } = req.body;

    const newLanguage = new Language({
      name,
      code
    });

    const savedLanguage = await newLanguage.save();

    res.status(201).json({
      message: "Language added successfully",
      language: savedLanguage
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get all languages
router.get("/", async (req, res) => {
  try {
    const languages = await Language.find();
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;