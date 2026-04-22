let current = 1;

// GET CURRENT TEXT
function getCurrentText() {
  return document.querySelector("#screen" + current + " .story-text").textContent;
}

// VOICE
function playVoice(text) {
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.8;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
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

// GO BACK TO STORIES
function goStories() {
  window.location.href = "stories.html"; // adjust if needed
}

// AUTO PLAY
window.onload = () => {
  playVoice(getCurrentText());
};