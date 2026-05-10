let currentColor = null;
let paintedCount = 0;

const objects = document.querySelectorAll(".object");
const totalObjects = objects.length;
const message = document.getElementById("message");

// ======================
// CORRECT COLORS (UPDATED)
// ======================
const correctColors = {
  tree: "green",
  sun: "yellow",
  ball: "blue",     // 
  apple: "red",
  banana: "yellow",
  cloud: "white",   // 
  leaf: "green"
};

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

    // ✅ CORRECT
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

      if (paintedCount === totalObjects) {
        message.textContent = "✨ Wow! You colored everything!";
      }

    } 
    // ❌ WRONG
    else {

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
      "green-painted"
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