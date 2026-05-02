// ======================
// VOICE FUNCTION
// ======================
function speak(text) {
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.8;
  speech.pitch = 1;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

// ======================
// SCREEN CONTROL
// ======================
function goToScreen2() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  index2 = 0; // reset
  updateInstruction2();
}

function back() {
  window.speechSynthesis.cancel();

  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen1").classList.add("active");

  updateInstruction1();
}

function goQuizzes() {
  window.speechSynthesis.cancel();
  window.location.href = "quizzes.html";
}

// ======================
// SCREEN 1 (EASY)
// ======================
const letters1 = ["A", "B", "C", "D", "E", "F"];
let index1 = 0;

const instruction1 = document.getElementById("instruction1");
const feedback1 = document.getElementById("feedback1");
const buttons1 = document.querySelectorAll(".letter");

function updateInstruction1() {
  const text = "Tap " + letters1[index1];
  instruction1.textContent = text;
  speak(text);
}

updateInstruction1();

buttons1.forEach(btn => {
  btn.addEventListener("click", () => {

    if (btn.dataset.letter === letters1[index1]) {

      btn.classList.add("correct-anim");
      feedback1.textContent = "Good job!";
      speak("Good job");

      setTimeout(() => {
        btn.classList.remove("correct-anim");

        index1++;

        if (index1 < letters1.length) {
          updateInstruction1();
          feedback1.textContent = "";
        } else {
          feedback1.textContent = "Great!";
          speak("Great job");
        }

      }, 800);

    } else {
      btn.classList.add("wrong-anim");
      feedback1.textContent = "Try again!";
      speak("Try again");

      setTimeout(() => {
        btn.classList.remove("wrong-anim");
      }, 500);
    }

  });
});

// ======================
// SCREEN 2 (MEDIUM - RANDOM)
// ======================
const buttons2 = document.querySelectorAll(".letter2");

let allLetters = [];

// get letters from HTML
buttons2.forEach(btn => {
  allLetters.push(btn.dataset.letter);
});

let currentLetter = "";

const instruction2 = document.getElementById("instruction2");
const feedback2 = document.getElementById("feedback2");

// 🔀 SHUFFLE FUNCTION
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// LOAD NEW ROUND
function loadRound() {

  // shuffle letters visually
  const shuffled = shuffle([...allLetters]);

  buttons2.forEach((btn, index) => {
    btn.dataset.letter = shuffled[index];
    btn.textContent = shuffled[index];
  });

  // pick random correct answer
  currentLetter = shuffled[Math.floor(Math.random() * shuffled.length)];

  const text = "Find " + currentLetter;
  instruction2.textContent = text;
  speak(text);

  feedback2.textContent = "";
}

// START FIRST ROUND
function goToScreen2() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  loadRound();
}

// CLICK EVENTS
buttons2.forEach(btn => {
  btn.addEventListener("click", () => {

    if (btn.dataset.letter === currentLetter) {

      btn.classList.add("correct-anim");
      feedback2.textContent = "⭐ Good job!";
      speak("Good job");

      setTimeout(() => {
        btn.classList.remove("correct-anim");
        loadRound(); // 🔁 NEW RANDOM ROUND
      }, 800);

    } else {
      btn.classList.add("wrong-anim");
      feedback2.textContent = "Try again!";
      speak("Try again");

      setTimeout(() => {
        btn.classList.remove("wrong-anim");
      }, 500);
    }

  });
});