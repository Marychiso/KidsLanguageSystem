// FRUITS DATA
const fruits = [
  { name: "banana", img: "assets/images/banana.jpg" },
  { name: "apple", img: "assets/images/redapple.jpg" },
  { name: "orange", img: "assets/images/orange.jpg" },
  { name: "grape", img: "assets/images/grape.jpg" },
  { name: "strawberry", img: "assets/images/strawberry.jpg" },
  { name: "watermelon", img: "assets/images/watermelon.jpg" }
];

// INTRO
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

// GO TO PRACTICE
function goToPractice() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  nextRound();
}

// PRACTICE
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

// CLICK EVENTS
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
      }

    } else {
      feedback.textContent = "❌ Try again!";
      feedback.className = "wrong";

      playVoice("Try again");
    }
  });
});

// 🔊 VOICE FUNCTION
function playVoice(text) {
  window.speechSynthesis.cancel(); // stops overlapping voices

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 0.85;

  window.speechSynthesis.speak(speech);
}