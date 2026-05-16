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
        title: lessonTitle || "Fruit Lesson",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Fruit lesson progress saved and badges checked.");
  } catch (error) {
    console.error("Error saving fruit lesson progress:", error);
  }
}

const fruits = [
  { name: "banana", img: "assets/images/banana.jpg" },
  { name: "apple", img: "assets/images/redapple.jpg" },
  { name: "orange", img: "assets/images/orange.jpg" },
  { name: "grape", img: "assets/images/grape.jpg" },
  { name: "strawberry", img: "assets/images/strawberry.jpg" },
  { name: "watermelon", img: "assets/images/watermelon.jpg" }
];

let index = 0;

const fruitImage = document.getElementById("fruitImage");
const fruitText = document.getElementById("fruitText");

function showFruit() {
  fruitImage.src = fruits[index].img;
  fruitText.textContent = "This is a " + fruits[index].name;

  playVoice("This is a " + fruits[index].name);
}

showFruit();

function nextFruit() {
  index++;

  if (index < fruits.length) {
    showFruit();
  } else {
    goToPractice();
  }
}

function goToPractice() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  nextRound();
}

const instruction = document.getElementById("instruction");
const feedback = document.getElementById("feedback");
const choices = document.querySelectorAll(".choice");

let currentFruit = "";
let rounds = 0;

function nextRound() {
  const random = Math.floor(Math.random() * fruits.length);
  currentFruit = fruits[random].name;

  instruction.textContent = "Find the " + currentFruit;
  instruction.className = "big-text";

  feedback.textContent = "";

  playVoice("Find the " + currentFruit);
}

choices.forEach(choice => {
  choice.addEventListener("click", () => {
    if (choice.dataset.fruit === currentFruit) {
      feedback.textContent = " Good job!!!";
      feedback.className = "correct";

      playVoice("Good job");

      rounds++;

      if (rounds < 5) {
        setTimeout(() => {
          nextRound();
        }, 1200);
      } else {
        instruction.textContent = "🎉 Lesson Complete!";
        feedback.textContent = "";

        playVoice("Great job! Lesson complete");
        saveLessonProgress();
      }

    } else {
      feedback.textContent = "❌ Try again!";
      feedback.className = "wrong";

      playVoice("Try again");
    }
  });
});

function playVoice(text) {
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 0.85;

  window.speechSynthesis.speak(speech);
}

function restartLesson() {
  index = 0;
  rounds = 0;
  lessonProgressSaved = false;

  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen1").classList.add("active");

  showFruit();
}

function goBackToLessons() {
  saveLessonProgress();
  window.location.href = "lessons.html";
}