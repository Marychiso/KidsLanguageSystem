const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  badgeName: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  icon: {
    type: String,
    default: "🏅"
  }

}, { timestamps: true });

const Badge = mongoose.model("Badge", badgeSchema);

module.exports = Badge;