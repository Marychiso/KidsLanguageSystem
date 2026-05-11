const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  level: {
    type: String,
    default: "Beginner"
  },
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Language",
    required: true
  },
  category: {
    type: String,
    required: true
  },
  page: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;