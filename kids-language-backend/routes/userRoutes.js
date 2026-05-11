const express = require("express"); //import express into this file
const router = express.Router(); //create a route manager for users
const User = require("../models/User"); //import user model into this file

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const newUser = new User({
      username,
      email,
      password,
      role: role || "child"
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: savedUser
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (foundUser.password !== password) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: foundUser
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;