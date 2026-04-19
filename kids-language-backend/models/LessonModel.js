const mongoose = require("mongoose");

console.log("LESSON MODEL FILE LOADED");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
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

const Lesson = mongoose.model("Lesson", lessonSchema);

console.log("Lesson model created:", typeof Lesson);

module.exports = Lesson;