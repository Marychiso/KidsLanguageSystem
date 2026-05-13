let lessonProgressSaved = false;

async function saveLessonProgress() {
  try {
    if (lessonProgressSaved) return;

    const userId = localStorage.getItem("userId");
    const lessonId = localStorage.getItem("lessonId");
    const lessonTitle = localStorage.getItem("lessonTitle");

    if (!userId || !lessonId) {
      console.log("Missing userId or lessonId. Lesson progress not saved.");
      return;
    }

    lessonProgressSaved = true;

    await fetch("http://localhost:5000/api/progress/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        contentType: "lesson",
        contentId: lessonId,
        title: lessonTitle || "Colors Lesson",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Colors lesson progress saved and badges checked.");
  } catch (error) {
    console.error("Error saving colors lesson progress:", error);
  }
}

let currentScreen = 1;
let pulseInterval = null;

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

const colorText = document.getElementById("colorText");
const colorImage = document.getElementById("colorImage");

function showColor() {
  const c = colors[index];

  colorText.textContent = "This is " + c.name;
  colorImage.src = c.img;

  colorImage.classList.remove("pop");
  void colorImage.offsetWidth;
  colorImage.classList.add("pop");
}

function nextColor() {
  if (index < colors.length - 1) {
    index++;
    showColor();
  } else {
    saveLessonProgress();
  }
}

function nextScreen() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  startPulse();
  saveLessonProgress();
}

function back() {
  stopPulse();

  document.getElementById("screen2").classList.remove("active");
  document.getElementById("screen1").classList.add("active");
}

function goLessons() {
  stopPulse();
  window.location.href = "lessons.html";
}

function startPulse() {
  stopPulse();

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

window.onload = () => {
  showColor();
};