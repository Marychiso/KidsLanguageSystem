const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// SIMPLE WORDS
const words = {
  A: "Apple", B: "Ball", C: "Cat", D: "Dog", E: "Egg",
  F: "Fish", G: "Goat", H: "Hat", I: "Ice cream",
  J: "Juice", K: "Kite", L: "Lion", M: "Monkey",
  N: "Nest", O: "Orange", P: "Pen", Q: "Queen",
  R: "Rabbit", S: "Sun", T: "Tiger", U: "Umbrella",
  V: "Van", W: "Whale", X: "Xylophone", Y: "Yam", Z: "Zebra"
};

// GRID
const grid = document.getElementById("alphabetGrid");

alphabet.forEach(letter => {
  const btn = document.createElement("button");
  btn.textContent = letter;

  btn.onclick = () => showLetter(letter);

  grid.appendChild(btn);
});

// SHOW LETTER
function showLetter(letter) {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  document.getElementById("bigLetter").textContent = letter;
  document.getElementById("letterText").textContent =
    letter + " is for " + words[letter];

  playVoice(letter + " is for " + words[letter]);
}

// BACK
function backToGrid() {
  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen1").classList.add("active");
}

// VOICE
function playVoice(text) {
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.8;
  window.speechSynthesis.speak(speech);
}