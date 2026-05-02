const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
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

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;