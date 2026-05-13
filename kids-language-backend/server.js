const express = require("express");  //bring express into the file
const mongoose = require("mongoose"); //bring mongoose so teh server can talk to MongoDB
const dotenv = require("dotenv");  //let server read values from env
const cors = require("cors");  //alow frontend to communicate with backend

dotenv.config();

const app = express();  //create express app

// middlewaree
app.use(cors()); //allow outside requests to come in
app.use(express.json());

// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB error:", err));

const userRoutes = require("./routes/userRoutes"); //load user routes
const languageRoutes = require("./routes/languageRoutes"); //load language routes
const lessonRoutes = require("./routes/lessonRoutes"); //load lesson routes

console.log("userRoutes type:", typeof userRoutes);
console.log("languageRoutes type:", typeof languageRoutes);
console.log("lessonRoutes type:", typeof lessonRoutes);

app.use("/api/users", userRoutes); //connect user routes
app.use("/api/languages", languageRoutes); //connect language routes
app.use("/api/lessons", lessonRoutes); //connect lesson routes
app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/games", require("./routes/gameRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/badges", require("./routes/badgeRoutes"));

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});