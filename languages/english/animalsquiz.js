function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

document.addEventListener("DOMContentLoaded", () => {

// ======================
// VOICE
// ======================
let voiceEnabled = false;

function speak(text) {
  if (!voiceEnabled) return;

  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.85;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

// unlock voice after first click
document.body.addEventListener("click", () => {
  voiceEnabled = true;
});

// ======================
// NAVIGATION
// ======================
function switchScreen(from, to) {
  window.speechSynthesis.cancel();

  document.getElementById(from).classList.remove("active");
  document.getElementById(to).classList.add("active");
}

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

// ======================
// SCREEN 1 (SOUNDS)
// ======================
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
  if (index1 >= animals1.length) {
    instruction1.textContent = "Great job!";
    speak("Great job");

    setTimeout(() => {
      window.goToScreen2();
    }, 1000);

    return;
  }

  const current = animals1[index1];
  const text = "You hear " + current.sound + ". Who is it?";

  instruction1.textContent = text;
  feedback1.textContent = "";
  speak(text);
}

loadScreen1();

buttons1.forEach(btn => {
  btn.onclick = () => {
    const current = animals1[index1];

    if (btn.dataset.animal === current.name) {
      feedback1.textContent = "Yay!";
      speak("Yay");

      btn.classList.add("correct-anim");

      setTimeout(() => {
        btn.classList.remove("correct-anim");
        index1++;
        loadScreen1();
      }, 800);

    } else {
      feedback1.textContent = "Try again!";
      speak("Try again");

      btn.classList.add("wrong-anim");

      setTimeout(() => {
        btn.classList.remove("wrong-anim");
      }, 500);
    }
  };
});

// ======================
// SCREEN 2 (LOGIC)
// ======================
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
  if (index2 >= questions2.length) {
    instruction2.textContent = "Well done!";
    feedback2.textContent = "";
    speak("Well done");
    return;
  }

  const current = questions2[index2];

  instruction2.textContent = current.q;
  feedback2.textContent = "";
  speak(current.q);
}

buttons2.forEach(btn => {
  btn.onclick = () => {
    const current = questions2[index2];

    if (btn.dataset.animal === current.answer) {
      feedback2.textContent = "Good job!";
      speak("Good job");

      btn.classList.add("correct-anim");

      setTimeout(() => {
        btn.classList.remove("correct-anim");
        index2++;
        loadScreen2();
      }, 800);

    } else {
      feedback2.textContent = "Try again!";
      speak("Try again");

      btn.classList.add("wrong-anim");

      setTimeout(() => {
        btn.classList.remove("wrong-anim");
      }, 500);
    }
  };
});

// ======================
// SCREEN 3 (PARADE)
// ======================
const paradeAnimals = ["dog", "cat", "cow", "lion", "elephant", "bird", "fish"];
let paradeOrder = [];

const paradeDisplay = document.getElementById("parade");
const instruction3 = document.getElementById("instruction3");
const feedback3 = document.getElementById("feedback3");
const paradeButtons = document.querySelectorAll("#screen3 .animal");

function startParade() {
  paradeDisplay.innerHTML = "";

  paradeOrder = shuffle([...paradeAnimals]);

  let i = 0;

  speak("Watch the animal parade");

  function showNext() {
    if (i >= paradeOrder.length) {
      askQuestion();
      return;
    }

    const animal = paradeOrder[i];

    const div = document.createElement("div");
    div.className = "animal";

    const img = document.createElement("img");
    img.src = "assets/images/" + animal + ".jpg";
    img.alt = animal;

    div.appendChild(img);
    paradeDisplay.appendChild(div);

    i++;
    setTimeout(showNext, 700);
  }

  showNext();
}

function askQuestion() {
  instruction3.textContent = "Which animal came first?";
  feedback3.textContent = "";
  speak("Which animal came first");
}

paradeButtons.forEach(btn => {
  btn.onclick = () => {
    const first = paradeOrder[0];

    if (btn.dataset.animal === first) {
      feedback3.textContent = "Correct!";
      speak("Correct");

      btn.classList.add("correct-anim");

      setTimeout(() => {
        btn.classList.remove("correct-anim");
        startParade(); // repeat game
      }, 1000);

    } else {
      feedback3.textContent = "Try again!";
      speak("Try again");

      btn.classList.add("wrong-anim");

      setTimeout(() => {
        btn.classList.remove("wrong-anim");
      }, 500);
    }
  };
});

});