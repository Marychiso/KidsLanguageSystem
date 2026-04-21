let current = 1;

// GET TEXT FOR CURRENT SCREEN
function getCurrentText() {
  return document.querySelector("#screen" + current + " .story-text").textContent;
}

// VOICE FUNCTION
function playVoice(text) {
  window.speechSynthesis.cancel(); // stop overlapping speech
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 0.8;
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

// RESTART
function restart() {
  document.getElementById("screen" + current).classList.remove("active");
  current = 1;
  document.getElementById("screen1").classList.add("active");

  playVoice(getCurrentText());
}

// MENU
function goStories() {
  window.location.href = "stories.html"; 
}

// AUTO PLAY FIRST SCREEN
window.onload = () => {
  playVoice(getCurrentText());
};