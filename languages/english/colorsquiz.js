let currentScreen = 1;

// SWITCH SCREENS
function nextScreen() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  playVoice("Find a color red");
}

// SCREEN 2 (GUIDED PRACTICE)
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
      }, 1500);

    } else {
      feedback.textContent = "❌ Try again!";
      feedback.className = "wrong-text";
    }
  });
});

// GO TO SCREEN 3
function goToScreen3() {
  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen3").classList.add("active");

  nextRound();
}

// SCREEN 3 (FREE PLAY)
const colors = ["red", "blue", "yellow", "brown", "green", "white", "pink"];
let currentColor = "";

const choices2 = document.querySelectorAll(".choice2");
const feedback2 = document.getElementById("feedback2");
const promptText = document.getElementById("promptText");

function nextRound() {
  currentColor = colors[Math.floor(Math.random() * colors.length)];

  promptText.textContent = "Find something " + currentColor.toUpperCase();
  promptText.className = "big-text";

  playVoice("Find something " + currentColor);
}

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

// SIMPLE VOICE
function playVoice(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 0.8;
  window.speechSynthesis.speak(speech);
}

// BOUNCE EFFECT HELPER
function addBounce(el) {
  el.classList.remove("pop");
  void el.offsetWidth; // restart animation
  el.classList.add("pop");
}