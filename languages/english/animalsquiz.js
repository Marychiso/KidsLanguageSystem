function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

/* ======================
   GLOBAL NAVIGATION (IMPORTANT FIX)
====================== */

window.goToScreen2 = function () {
  switchScreen("screen1", "screen2");
  index2 = 0;
  loadScreen2();
};

window.goToScreen3 = function () {
  switchScreen("screen2", "screen3");
  startParade();
};

window.back1 = function () {
  switchScreen("screen2", "screen1");
  loadScreen1();
};

window.back2 = function () {
  switchScreen("screen3", "screen2");
  loadScreen2();
};

window.goQuizzes = function () {
  window.location.href = "quizzes.html";
};

window.goQuizzesMenu = function () {
  window.location.href = "quizzes.html";
};

/* ======================
   CORE LOGIC
====================== */

let voiceEnabled = false;

function speak(text) {
  if (!voiceEnabled) return;

  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.85;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

document.body.addEventListener("click", () => {
  voiceEnabled = true;
});

function switchScreen(from, to) {
  window.speechSynthesis.cancel();
  document.getElementById(from).classList.remove("active");
  document.getElementById(to).classList.add("active");
}

/* ======================
   SCREEN 1
====================== */

const animals1 = [
  { name: "cow", sound: "Moo" },
  { name: "dog", sound: "Woof" },
  { name: "cat", sound: "Meow" }
];

let index1 = 0;

const instruction1 = document.getElementById("instruction1");
const feedback1 = document.getElementById("feedback1");
const buttons1 = document.querySelectorAll("#screen1 .animal");

function loadScreen1() {
  const current = animals1[index1];

  instruction1.textContent = `You hear ${current.sound}. Who is it?`;
  speak(instruction1.textContent);
}

loadScreen1();

buttons1.forEach(btn => {
  btn.onclick = () => {
    const current = animals1[index1];

    if (btn.dataset.animal === current.name) {
      feedback1.textContent = "Correct!";
      index1++;

      setTimeout(() => {
        loadScreen1();
      }, 800);
    } else {
      feedback1.textContent = "Try again!";
    }
  };
});

/* ======================
   SCREEN 2
====================== */

const questions2 = [
  { q: "Who can fly?", answer: "bird" },
  { q: "Who is big?", answer: "elephant" },
  { q: "Who roars?", answer: "lion" }
];

let index2 = 0;

const instruction2 = document.getElementById("instruction2");
const feedback2 = document.getElementById("feedback2");
const buttons2 = document.querySelectorAll("#screen2 .animal");

function loadScreen2() {
  const current = questions2[index2];

  instruction2.textContent = current.q;
  speak(current.q);
}

buttons2.forEach(btn => {
  btn.onclick = () => {
    const current = questions2[index2];

    if (btn.dataset.animal === current.answer) {
      feedback2.textContent = "Good job!";
      index2++;
      loadScreen2();
    } else {
      feedback2.textContent = "Try again!";
    }
  };
});

/* ======================
   SCREEN 3
====================== */

const paradeAnimals = ["dog","cat","cow","lion","elephant","bird","fish"];
let paradeOrder = [];

const paradeDisplay = document.getElementById("parade");
const instruction3 = document.getElementById("instruction3");
const feedback3 = document.getElementById("feedback3");
const buttons3 = document.querySelectorAll("#screen3 .animal");

function startParade() {
  paradeDisplay.innerHTML = "";
  paradeOrder = shuffle([...paradeAnimals]);

  let i = 0;

  function showNext() {
    if (i >= paradeOrder.length) {
      instruction3.textContent = "Which animal came first?";
      return;
    }

    const animal = paradeOrder[i];

    const div = document.createElement("div");
    div.className = "animal";

    const img = document.createElement("img");
    img.src = `assets/images/${animal}.jpg`;

    div.appendChild(img);
    paradeDisplay.appendChild(div);

    i++;
    setTimeout(showNext, 600);
  }

  showNext();
}

buttons3.forEach(btn => {
  btn.onclick = () => {
    const first = paradeOrder[0];

    if (btn.dataset.animal === first) {
      feedback3.textContent = "Correct!";
      setTimeout(startParade, 1000);
    } else {
      feedback3.textContent = "Try again!";
    }
  };
});