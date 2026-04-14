const mongoose = require("mongoose"); //import mongoose package

const userSchema = new mongoose.Schema({ //outline the user fields and rules
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema); //turn schema into model and export