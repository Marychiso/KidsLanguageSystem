let quizProgressSaved = false;

async function saveQuizProgress(score = 100) {
  try {
    if (quizProgressSaved) return;

    const userId = localStorage.getItem("userId");
    const quizId = localStorage.getItem("quizId");
    const quizTitle = localStorage.getItem("quizTitle");

    if (!userId || !quizId) {
      console.log("Missing userId or quizId. Quiz progress not saved.");
      return;
    }

    quizProgressSaved = true;

    await fetch("http://localhost:5000/api/progress/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        contentType: "quiz",
        contentId: quizId,
        title: quizTitle || "Alphabet Quiz",
        completed: true,
        score
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Alphabet quiz progress saved and badges checked.");
  } catch (error) {
    console.error("Error saving alphabet quiz progress:", error);
  }
}

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
          saveQuizProgress(100);
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

buttons2.forEach(btn => {
  allLetters.push(btn.dataset.letter);
});

let currentLetter = "";

const instruction2 = document.getElementById("instruction2");
const feedback2 = document.getElementById("feedback2");

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function loadRound() {
  const shuffled = shuffle([...allLetters]);

  buttons2.forEach((btn, index) => {
    btn.dataset.letter = shuffled[index];
    btn.textContent = shuffled[index];
  });

  currentLetter = shuffled[Math.floor(Math.random() * shuffled.length)];

  const text = "Find " + currentLetter;
  instruction2.textContent = text;
  speak(text);

  feedback2.textContent = "";
}

function goToScreen2() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  loadRound();
}

buttons2.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.letter === currentLetter) {
      btn.classList.add("correct-anim");
      feedback2.textContent = "⭐ Good job!";
      speak("Good job");

      saveQuizProgress(100);

      setTimeout(() => {
        btn.classList.remove("correct-anim");
        loadRound();
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