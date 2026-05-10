let completed = false;

const words = [
  { word: "APPLE", emoji: "🍎" },
  { word: "BALL", emoji: "⚽" },
  { word: "CAT", emoji: "🐱" },
  { word: "DOG", emoji: "🐶" },
  { word: "FISH", emoji: "🐟" },
  { word: "BIRD", emoji: "🐦" },
  { word: "BOOK", emoji: "📚" },
  { word: "STAR", emoji: "⭐" }
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffleArray(words);

let currentIndex = 0;
let letterIndex = 0;
let slots = [];

const slotsContainer = document.getElementById("slots");
const lettersContainer = document.getElementById("letters");
const objectDisplay = document.getElementById("object");
const message = document.getElementById("message");

function loadWord() {
  letterIndex = 0;
  completed = false;
  message.textContent = "";

  const current = words[currentIndex];
  objectDisplay.textContent = current.emoji;

  // slots
  slotsContainer.innerHTML = "";
  current.word.split("").forEach(() => {
    const div = document.createElement("div");
    div.className = "slot";
    slotsContainer.appendChild(div);
  });

  slots = document.querySelectorAll(".slot");

  // letters
  let letters = current.word.split("");

  const extras = ["B", "C", "D", "E", "F"];
  const availableExtras = extras.filter(l => !letters.includes(l));

  shuffleArray(availableExtras);
  letters.push(availableExtras[0], availableExtras[1]);

  shuffleArray(letters);

  lettersContainer.innerHTML = "";

  letters.forEach(letter => {
    const div = document.createElement("div");
    div.className = "letter";
    div.textContent = letter;

    div.onclick = () => handleClick(div, letter);

    lettersContainer.appendChild(div);
  });
}

function handleClick(el, letter) {
  if (completed) return;

  const current = words[currentIndex];
  const correctLetter = current.word[letterIndex];

  if (letter === correctLetter) {

    slots[letterIndex].textContent = letter;

    el.classList.add("correct");

    setTimeout(() => {
      el.style.opacity = "0.3";
      el.style.pointerEvents = "none";
    }, 300);

    letterIndex++;

    if (letterIndex === current.word.length) {
      completed = true;

      message.textContent = "🎉 Completed! " + current.word;

      objectDisplay.classList.add("correct");

      setTimeout(() => {
        objectDisplay.classList.remove("correct");
      }, 500);
    }

  } else {
    message.textContent = "Try again!";

    el.classList.add("wrong");

    setTimeout(() => {
      el.classList.remove("wrong");
    }, 300);
  }
}

function nextWord() {
  currentIndex = (currentIndex + 1) % words.length;
  loadWord();
}

function replayWord() {
  message.textContent = "Try again!";
  loadWord();
}

function goGames() {
  window.location.href = "games.html";
}

loadWord();