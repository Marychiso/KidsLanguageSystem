let currentColor = null;
let paintedCount = 0;
let progressSaved = false;

const objects = document.querySelectorAll(".object");
const totalObjects = objects.length;
const message = document.getElementById("message");

// ======================
// CORRECT COLORS
// ======================
const correctColors = {
  tree: "green",
  sun: "yellow",
  ball: "blue",
  apple: "red",
  banana: "yellow",
  cloud: "white",
  leaf: "green"
};

// ======================
// SAVE GAME PROGRESS + CHECK BADGES
// ======================
async function saveGameProgress() {
  try {
    const userId = localStorage.getItem("userId");
    const gameId = localStorage.getItem("gameId");
    const gameTitle = localStorage.getItem("gameTitle");

    if (!userId || !gameId) {
      console.log("Missing userId or gameId. Progress not saved.");
      return;
    }

    await fetch("http://localhost:5000/api/progress/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        contentType: "game",
        contentId: gameId,
        title: gameTitle || "Color Game",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Game progress saved and badges checked.");

  } catch (error) {
    console.error("Error saving game progress:", error);
  }
}

// ======================
// SELECT COLOR
// ======================
function selectColor(color) {
  currentColor = color;

  document.querySelectorAll(".color").forEach(btn => {
    btn.classList.remove("selected");
  });

  document.querySelector("." + color).classList.add("selected");

  message.textContent = "Now tap the correct object!";
}

// ======================
// PAINT LOGIC
// ======================
objects.forEach(obj => {

  obj.addEventListener("click", () => {

    if (!currentColor) {
      message.textContent = "Pick a color first!";
      return;
    }

    if (obj.dataset.painted === "true") return;

    const name = obj.dataset.name;
    const correct = correctColors[name];

    if (currentColor === correct) {

      obj.classList.remove(
        "red-painted",
        "blue-painted",
        "yellow-painted",
        "green-painted",
        "white-painted"
      );

      obj.classList.add(currentColor + "-painted");
      obj.classList.add("painted");

      obj.dataset.painted = "true";
      paintedCount++;

      message.textContent = "Great job!";

      obj.classList.add("correct-anim");

      setTimeout(() => {
        obj.classList.remove("correct-anim");
      }, 500);

      if (paintedCount === totalObjects && progressSaved === false) {
        progressSaved = true;
        message.textContent = "✨ Wow! You colored everything!";

        saveGameProgress();
      }

    } else {

      message.textContent = "Oops! Try another color";

      obj.classList.add("wrong-anim");

      setTimeout(() => {
        obj.classList.remove("wrong-anim");
      }, 500);
    }

  });

});

// ======================
// RESET
// ======================
function resetGame() {
  currentColor = null;
  paintedCount = 0;
  progressSaved = false;

  message.textContent = "Pick a color, then tap the correct object!";

  document.querySelectorAll(".color").forEach(btn => {
    btn.classList.remove("selected");
  });

  objects.forEach(obj => {
    obj.classList.remove(
      "painted",
      "red-painted",
      "blue-painted",
      "yellow-painted",
      "green-painted",
      "white-painted"
    );

    obj.style.filter = "grayscale(100%)";
    obj.dataset.painted = "false";
  });
}

// ======================
// NAVIGATION
// ======================
function goGames() {
  window.location.href = "games.html";
}

// START MESSAGE
message.textContent = "Pick a color, then tap the correct object!";