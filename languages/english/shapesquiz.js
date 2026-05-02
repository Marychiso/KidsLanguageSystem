// ======================
// VOICE FUNCTION
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
function goToScreen2() {
  window.speechSynthesis.cancel();

  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  currentIndex2 = 0;
  loadScreen2();
}

function goToScreen3() {
  window.speechSynthesis.cancel();

  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen3").classList.add("active");

  loadOdd();
}

function back1() {
  window.speechSynthesis.cancel();

  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen1").classList.add("active");

  updateInstruction1();
}

function back2() {
  window.speechSynthesis.cancel();

  document.getElementById("screen3").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  loadScreen2();
}

function goQuizzes() {
  window.speechSynthesis.cancel();
  window.location.href = "quizzes.html";
}

// ======================
// SCREEN 1 (EASY)
// ======================
const shapes1 = ["circle", "square", "triangle", ];
let index1 = 0;

const instruction1 = document.getElementById("instruction1");
const feedback1 = document.getElementById("feedback1");
const shapeButtons = document.querySelectorAll(".shape");

function updateInstruction1() {
  if (index1 >= shapes1.length) {
    instruction1.textContent = "Great job!";
    speak("Great job");

    // 👉 automatically go to next screen after short delay
    setTimeout(() => {
      goToScreen2();
    }, 1000);

    return;
  }

  const text = "Tap the " + shapes1[index1];
  instruction1.textContent = text;
  speak(text);
}

updateInstruction1();

shapeButtons.forEach(btn => {
  btn.addEventListener("click", () => {

    if (btn.dataset.shape === shapes1[index1]) {
      btn.classList.add("correct-anim");
      feedback1.textContent = "Yay!";
      speak("Yay");

      setTimeout(() => {
        btn.classList.remove("correct-anim");
        index1++;
        feedback1.textContent = "";
        updateInstruction1(); // ✅ safe update
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
// SCREEN 2 (MEDIUM)
// ======================
const instruction2 = document.getElementById("instruction2");
const feedback2 = document.getElementById("feedback2");
const objects = document.querySelectorAll(".object");

let shapes2 = ["circle", "square", "triangle"];
let currentIndex2 = 0;

// shuffle function
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// shuffle at start
shapes2 = shuffle(shapes2);

function loadScreen2() {
  if (currentIndex2 >= shapes2.length) {
    shapes2 = shuffle(["circle", "square", "triangle"]);
    currentIndex2 = 0;
  }

  const currentShape = shapes2[currentIndex2];

  const text = "Find the " + currentShape;
  instruction2.textContent = text;
  speak(text);

  feedback2.textContent = "";
}

// click logic
objects.forEach(obj => {
  obj.addEventListener("click", () => {

    const currentShape = shapes2[currentIndex2];

    if (obj.dataset.shape === currentShape) {
      obj.classList.add("correct-anim");
      feedback2.textContent = "⭐ Good job!";
      speak("Good job");

      setTimeout(() => {
        obj.classList.remove("correct-anim");
        currentIndex2++;
        loadScreen2();
      }, 800);

    } else {
      obj.classList.add("wrong-anim");
      feedback2.textContent = "Try again!";
      speak("Try again");

      setTimeout(() => {
        obj.classList.remove("wrong-anim");
      }, 500);
    }
  });
});

// ======================
// SCREEN 3 (ODD ONE OUT)
// ======================
const oddGrid = document.getElementById("oddGrid");
const feedback3 = document.getElementById("feedback3");

function loadOdd() {
  oddGrid.innerHTML = "";
  feedback3.textContent = "";

  speak("Find the different shape");

  const shapes = ["circle", "square", "triangle"];

  const main = shapes[Math.floor(Math.random() * shapes.length)];
  const others = shapes.filter(s => s !== main);
  const odd = others[Math.floor(Math.random() * others.length)];

  let set = [main, main, main, odd];

  // shuffle
  set.sort(() => Math.random() - 0.5);

  set.forEach(shape => {
    const div = document.createElement("div");
    div.className = "shape " + shape;

    div.onclick = () => {
      if (shape === odd) {
        div.classList.add("correct-anim");
        feedback3.textContent = "✨ Correct!";
        speak("Correct");

        setTimeout(() => {
          loadOdd();
        }, 1000);

      } else {
        div.classList.add("wrong-anim");
        feedback3.textContent = "Try again!";
        speak("Try again");

        setTimeout(() => {
          div.classList.remove("wrong-anim");
        }, 500);
      }
    };

    oddGrid.appendChild(div);
  });
}