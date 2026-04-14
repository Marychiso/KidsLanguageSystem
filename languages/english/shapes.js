let introIndex = 0;

const introShapes = [
  "circle",
  "square",
  "triangle",
  "rectangle",
  "oval",
  "star",
  "heart"
];

let currentShape = "circle";


let voices = [];

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

function playVoice(text) {
  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";
  speech.rate = 1.05;
  speech.pitch = 1.4;

  const voice = voices.find(v =>
    v.lang.includes("en") &&
    (v.name.toLowerCase().includes("female") ||
     v.name.toLowerCase().includes("google") ||
     v.name.toLowerCase().includes("zira"))
  );

  if (voice) speech.voice = voice;

  window.speechSynthesis.speak(speech);
}


function playSound(src) {
  const audio = new Audio(src);
  audio.volume = 0.8;
  audio.play();
}


function confettiBurst() {
  for (let i = 0; i < 25; i++) {
    const c = document.createElement("div");

    c.style.position = "fixed";
    c.style.width = "8px";
    c.style.height = "8px";
    c.style.background = randomColor();
    c.style.left = Math.random() * 100 + "vw";
    c.style.top = "-10px";
    c.style.zIndex = 9999;

    document.body.appendChild(c);

    const anim = c.animate([
      { transform: "translateY(0)" },
      { transform: "translateY(100vh)" }
    ], {
      duration: 1500 + Math.random() * 1000
    });

    anim.onfinish = () => c.remove();
  }
}

function randomColor() {
  const colors = ["#ff4d6d","#ffd43b","#4dabf7","#51cf66","#845ef7"];
  return colors[Math.floor(Math.random() * colors.length)];
}


function nextIntro() {
  introIndex++;

  if (introIndex < introShapes.length) {
    const shape = introShapes[introIndex];

    document.getElementById("introText").textContent =
      "This is a " + shape;

    document.getElementById("introShape").className =
      "shape " + shape;

    playVoice("This is a " + shape);

  } else {
    goToGame();
  }
}

function goToGame() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");
  nextTask();
}


const choices = document.querySelectorAll(".choice");
const feedback = document.getElementById("feedback");
const taskText = document.getElementById("taskText");

function nextTask() {
  currentShape = introShapes[Math.floor(Math.random() * introShapes.length)];
  taskText.textContent = "Find the " + currentShape;
  playVoice("Find the " + currentShape);
}

choices.forEach(choice => {
  choice.addEventListener("click", () => {

    if (choice.dataset.shape === currentShape) {
      feedback.textContent = "Correct!";
      feedback.className = "pop";

      playSound("assets/sounds/correct.mp3");
      playVoice("Yay! Correct!");
      confettiBurst();

      setTimeout(nextTask, 1200);

    } else {
      feedback.textContent = "Try again";
      feedback.className = "shake";

      playSound("assets/sounds/wrong.mp3");
      playVoice("Oops! Try again");
    }

  });
});


const draggables = document.querySelectorAll(".drag");
const dropzones = document.querySelectorAll(".dropzone");

draggables.forEach(item => {
  item.addEventListener("dragstart", e => {
    e.dataTransfer.setData("shape", item.dataset.shape);
  });
});

dropzones.forEach(zone => {
  zone.addEventListener("dragover", e => e.preventDefault());

  zone.addEventListener("drop", e => {
    const shape = e.dataTransfer.getData("shape");

    if (shape === zone.dataset.shape) {
      zone.classList.add("pop");
      zone.appendChild(document.querySelector(`[data-shape="${shape}"].drag`));

      playSound("assets/sounds/correct.mp3");
      playVoice("Good job!");

    } else {
      zone.classList.add("shake");

      playSound("assets/sounds/wrong.mp3");
      playVoice("Try again");
    }
  });
});