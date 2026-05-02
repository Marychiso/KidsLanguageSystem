// ======================
// STATE
// ======================
let currentScreen = 1;
let pulseInterval = null;

// COLORS DATA
const colors = [
  { name: "red", img: "assets/images/watermelon.jpg" },
  { name: "blue", img: "assets/images/blueball.jpg" },
  { name: "yellow", img: "assets/images/yellowbanana.jpg" },
  { name: "orange", img: "assets/images/orange.jpg" },
  { name: "purple", img: "assets/images/grape.jpg" },
  { name: "white", img: "assets/images/whitebunny.jpg" },
  { name: "green", img: "assets/images/green.jpg" }
];

let index = 0;

// ELEMENTS
const colorText = document.getElementById("colorText");
const colorImage = document.getElementById("colorImage");

// ======================
// SHOW COLOR (SCREEN 1)
// ======================
function showColor() {
  const c = colors[index];

  colorText.textContent = "This is " + c.name;
  colorImage.src = c.img;

  // restart pop animation
  colorImage.classList.remove("pop");
  void colorImage.offsetWidth;
  colorImage.classList.add("pop");
}

// NEXT COLOR BUTTON
function nextColor() {
  if (index < colors.length - 1) {
    index++;
    showColor();
  }
}

// ======================
// SCREEN NAVIGATION
// ======================
function nextScreen() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  startPulse();
}

function back() {
  stopPulse();

  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen1").classList.add("active");
}

function goLessons() {
  stopPulse();
  window.location.href = "lessons.html"; // adjust if needed
}

// ======================
// SCREEN 2 ANIMATION
// ======================
function startPulse() {
  stopPulse(); // prevent duplicates

  const items = document.querySelectorAll(".color-item");
  let i = 0;

  pulseInterval = setInterval(() => {

    items.forEach(item => item.classList.remove("active"));

    items[i].classList.add("active");

    i++;
    if (i >= items.length) i = 0;

  }, 2000);
}

function stopPulse() {
  if (pulseInterval) {
    clearInterval(pulseInterval);
    pulseInterval = null;
  }
}

// ======================
// INIT
// ======================
window.onload = () => {
  showColor();
};