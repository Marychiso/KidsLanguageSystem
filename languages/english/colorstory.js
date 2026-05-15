function goBack() {
  window.location.href = "stories.html";
}

/* ---------------- VOICE ---------------- */
function readStory() {
  const textEl = document.getElementById("storyText");
  const fullText = textEl.innerText;
  const words = fullText.split(" ");

  let index = 0;

  const speech = new SpeechSynthesisUtterance(fullText);
  speech.lang = "en-US";
  speech.rate = 0.95;

  textEl.innerHTML = fullText;

  speech.onboundary = function(event) {
    if (event.name === "word") {
      textEl.innerHTML =
        words.map((w, i) =>
          i === index ? `<span class="highlight">${w}</span>` : w
        ).join(" ");
      index++;
    }
  };

  window.speechSynthesis.speak(speech);
}

function restartStory(){
  location.reload();
}

function finishStory(){
  window.location.href = "stories.html";
}