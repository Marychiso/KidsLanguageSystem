let current = 1;

// GET TEXT FOR EACH SCREEN
function getCurrentText() {
  return document.querySelector("#screen" + current + " .story-text").textContent;
}

// NEXT
function next() {
  document.getElementById("screen" + current).classList.remove("active");
  current++;
  document.getElementById("screen" + current).classList.add("active");

  playVoice(getCurrentText());
}

// BACK
function back() {
  document.getElementById("screen" + current).classList.remove("active");
  current--;
  document.getElementById("screen" + current).classList.add("active");

  playVoice(getCurrentText());
}

// ME

// LOAD A-Z GRID
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const grid = document.getElementById("alphabetGrid");

alphabet.forEach(letter => {
  const div = document.createElement("div");
  div.textContent = letter;
  grid.appendChild(div);
});

// VOICE FUNCTION
function playVoice(text) {
  window.speechSynthesis.cancel(); // stop overlapping speech
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.85;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

// AUTO PLAY FIRST SCREEN
window.onload = () => {
  playVoice(getCurrentText());
};

function restartStory(){
  location.reload();
}

function finishStory(){
  window.location.href = "stories.html";
}