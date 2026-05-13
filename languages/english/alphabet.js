let lessonProgressSaved = false;

async function saveLessonProgress() {
  try {
    if (lessonProgressSaved) return;

    const userId = localStorage.getItem("userId");
    const lessonId = localStorage.getItem("lessonId");
    const lessonTitle = localStorage.getItem("lessonTitle");

    if (!userId || !lessonId) {
      console.log("Missing userId or lessonId. Lesson progress not saved.");
      return;
    }

    lessonProgressSaved = true;

    await fetch("http://localhost:5000/api/progress/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        contentType: "lesson",
        contentId: lessonId,
        title: lessonTitle || "Alphabet Lesson",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Alphabet lesson progress saved and badges checked.");
  } catch (error) {
    console.error("Error saving alphabet lesson progress:", error);
  }
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const words = {
  A: "Apple", B: "Ball", C: "Cat", D: "Dog", E: "Egg",
  F: "Fish", G: "Goat", H: "Hat", I: "Ice cream",
  J: "Juice", K: "Kite", L: "Lion", M: "Monkey",
  N: "Nest", O: "Orange", P: "Pen", Q: "Queen",
  R: "Rabbit", S: "Sun", T: "Tiger", U: "Umbrella",
  V: "Van", W: "Whale", X: "Xylophone", Y: "Yam", Z: "Zebra"
};

const viewedLetters = new Set();

const grid = document.getElementById("alphabetGrid");

alphabet.forEach(letter => {
  const btn = document.createElement("button");
  btn.textContent = letter;

  btn.onclick = () => showLetter(letter);

  grid.appendChild(btn);
});

function showLetter(letter) {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  document.getElementById("bigLetter").textContent = letter;
  document.getElementById("letterText").textContent =
    letter + " is for " + words[letter];

  viewedLetters.add(letter);

  if (viewedLetters.size >= 5) {
    saveLessonProgress();
  }

  playVoice(letter + " is for " + words[letter]);
}

function backToGrid() {
  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen1").classList.add("active");
}

function playVoice(text) {
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.8;
  window.speechSynthesis.speak(speech);
}