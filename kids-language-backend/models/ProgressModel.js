const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ["lesson", "story", "quiz", "game"]
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  score: {
    type: Number,
    default: null
  }
}, { timestamps: true });

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;