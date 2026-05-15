let currentColor = "";

// ======================
// SCREEN 2 (FIRST SCREEN)
// ======================
const choices = document.querySelectorAll(".choice");
const feedback = document.getElementById("feedback");

choices.forEach(choice => {
  choice.addEventListener("click", () => {

    if (choice.dataset.color === "red") {
      feedback.textContent = "✅ Yes! Red!";
      feedback.className = "correct-text";

      addBounce(feedback);

      setTimeout(() => {
        goToScreen3();
      }, 1000);

    } else {
      feedback.textContent = "❌ Try again!";
      feedback.className = "wrong-text";
    }

  });
});

// ======================
// NAV: SCREEN 2 → SCREEN 3
// ======================
function goToScreen3() {
  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen3").classList.add("active");

  nextRound();
}

// ======================
// SCREEN 3 GAME
// ======================
const colors = ["red", "blue", "yellow", "brown", "green", "white", "pink"];

const choices2 = document.querySelectorAll(".choice2");
const feedback2 = document.getElementById("feedback2");
const promptText = document.getElementById("promptText");

function nextRound() {
  currentColor = colors[Math.floor(Math.random() * colors.length)];

  promptText.textContent = "Find something " + currentColor.toUpperCase();

  playVoice("Find something " + currentColor);
}

// SCREEN 3 CLICK HANDLER
choices2.forEach(choice => {
  choice.addEventListener("click", () => {

    if (choice.dataset.color === currentColor) {
      feedback2.textContent = "✅ Correct!";
      feedback2.className = "correct-text";

      addBounce(feedback2);

      setTimeout(() => {
        nextRound();
      }, 1000);

    } else {
      feedback2.textContent = "❌ Try again!";
      feedback2.className = "wrong-text";
    }

  });
});

// ======================
// NAVIGATION (FIXED PART YOU WERE MISSING)
// ======================

// back to quiz menu
function backToMenu() {
  window.location.href = "quizzes.html";
}

// back from screen 3 → screen 2
function back2() {
  document.getElementById("screen3").classList.remove("active");
  document.getElementById("screen2").classList.add("active");
}

// finish button (same as back to menu)
function goQuizzes() {
  window.location.href = "quizzes.html";
}

// ======================
// VOICE
// ======================
function playVoice(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 0.8;
  window.speechSynthesis.speak(speech);
}

// ======================
// ANIMATION
// ======================
function addBounce(el) {
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}