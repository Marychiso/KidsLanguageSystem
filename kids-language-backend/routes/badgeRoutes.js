const express = require("express");
const router = express.Router();

const Badge = require("../models/BadgeModel");
const Progress = require("../models/ProgressModel");

// ADD BADGE MANUALLY
router.post("/add", async (req, res) => {
  try {
    const { userId, badgeName, description, icon } = req.body;

    const newBadge = new Badge({
      userId,
      badgeName,
      description,
      icon
    });

    const savedBadge = await newBadge.save();

    res.status(201).json({
      message: "Badge added successfully",
      badge: savedBadge
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// GET USER BADGES
router.get("/user/:userId", async (req, res) => {
  try {
    const badges = await Badge.find({
      userId: req.params.userId
    });

    res.status(200).json(badges);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// helper function to avoid duplicate badges
async function awardBadge(userId, badgeName, description, icon) {
  const existingBadge = await Badge.findOne({
    userId,
    badgeName
  });

  if (!existingBadge) {
    await Badge.create({
      userId,
      badgeName,
      description,
      icon
    });
  }
}

// CHECK AND AWARD BADGES
router.post("/check/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const allProgress = await Progress.find({
      userId,
      completed: true
    });

    const totalCompleted = allProgress.length;

    const lessonCount = allProgress.filter(item => item.contentType === "lesson").length;
    const storyCount = allProgress.filter(item => item.contentType === "story").length;
    const quizCount = allProgress.filter(item => item.contentType === "quiz").length;
    const gameCount = allProgress.filter(item => item.contentType === "game").length;

    const highScoreQuiz = allProgress.some(item =>
      item.contentType === "quiz" && item.score !== null && item.score >= 80
    );

    const completedColorGame = allProgress.some(item =>
      item.contentType === "game" &&
      item.title &&
      item.title.toLowerCase().includes("color")
    );

    const completedAlphabetActivity = allProgress.some(item =>
      item.title &&
      item.title.toLowerCase().includes("alphabet")
    );

    // General badges
    if (totalCompleted >= 1) {
      await awardBadge(
        userId,
        "First Step",
        "Completed first learning activity",
        "🌟"
      );
    }

    if (totalCompleted >= 5) {
      await awardBadge(
        userId,
        "Learning Explorer",
        "Completed 5 learning activities",
        "🏆"
      );
    }

    if (totalCompleted >= 10) {
      await awardBadge(
        userId,
        "Super Learner",
        "Completed 10 learning activities",
        "🏅"
      );
    }

    // Lesson badge
    if (lessonCount >= 1) {
      await awardBadge(
        userId,
        "Lesson Starter",
        "Completed first lesson",
        "📚"
      );
    }

    // Story badge
    if (storyCount >= 1) {
      await awardBadge(
        userId,
        "Story Reader",
        "Completed first story",
        "📖"
      );
    }

    // Quiz badge
    if (quizCount >= 1) {
      await awardBadge(
        userId,
        "Quiz Beginner",
        "Completed first quiz",
        "🧠"
      );
    }

    if (highScoreQuiz) {
      await awardBadge(
        userId,
        "Quiz Master",
        "Scored 80 or above in a quiz",
        "🏆"
      );
    }

    // Game badge
    if (gameCount >= 3) {
      await awardBadge(
        userId,
        "Gamer",
        "Completed 3 games",
        "🎮"
      );
    }

    // Specific topic badges
    if (completedColorGame) {
      await awardBadge(
        userId,
        "Color Expert",
        "Completed a color activity",
        "🌈"
      );
    }

    if (completedAlphabetActivity) {
      await awardBadge(
        userId,
        "Alphabet Hero",
        "Completed an alphabet activity",
        "🔤"
      );
    }

    res.status(200).json({
      message: "Badge check completed",
      totalCompleted,
      badgesChecked: true
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;