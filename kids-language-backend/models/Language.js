const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Language", languageSchema);

async function loadLanguages() {
  try {
    const response = await fetch("http://localhost:5000/api/languages"); //sends request to backend
    const languages = await response.json();

    console.log("Languages from backend:", languages);
  } catch (error) {
    console.error("Error loading languages:", error);
  }
}

loadLanguages();