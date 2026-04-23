const mongoose = require("mongoose");

console.log("STORY MODEL FILE LOADED");

const storySchema = new mongoose.Schema({
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

const Story = mongoose.model("Story", storySchema);

console.log("Story model created:", typeof Story);

module.exports = Story;