let storyProgressSaved = false;

async function saveStoryProgress() {
  try {
    if (storyProgressSaved) return;

    const userId = localStorage.getItem("userId");
    const storyId = localStorage.getItem("storyId");
    const storyTitle = localStorage.getItem("storyTitle");

    if (!userId || !storyId) {
      console.log("Missing userId or storyId. Story progress not saved.");
      return;
    }

    storyProgressSaved = true;

    await fetch("http://localhost:5000/api/progress/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        contentType: "story",
        contentId: storyId,
        title: storyTitle || "Color Story",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Color story progress saved and badges checked.");
  } catch (error) {
    console.error("Error saving color story progress:", error);
  }
}

function goBack() {
  window.location.href = "stories.html";
}

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

  speech.onend = function() {
    saveStoryProgress();
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}