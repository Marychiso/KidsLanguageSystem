let current = 1;
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
        title: storyTitle || "Shape Story",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Shape story progress saved and badges checked.");
  } catch (error) {
    console.error("Error saving shape story progress:", error);
  }
}

function getCurrentText() {
  return document.querySelector("#screen" + current + " .story-text").textContent;
}

function getTotalScreens() {
  return document.querySelectorAll("[id^='screen']").length;
}

function playVoice(text) {
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 0.8;
  window.speechSynthesis.speak(speech);
}

function next() {
  document.getElementById("screen" + current).classList.remove("active");
  current++;
  document.getElementById("screen" + current).classList.add("active");

  playVoice(getCurrentText());

  if (current === getTotalScreens()) {
    saveStoryProgress();
  }
}

function back() {
  document.getElementById("screen" + current).classList.remove("active");
  current--;
  document.getElementById("screen" + current).classList.add("active");

  playVoice(getCurrentText());
}

function restart() {
  document.getElementById("screen" + current).classList.remove("active");
  current = 1;
  document.getElementById("screen1").classList.add("active");

  playVoice(getCurrentText());
}

function goStories() {
  window.location.href = "stories.html";
}

window.onload = () => {
  playVoice(getCurrentText());
};