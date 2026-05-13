let lessonProgressSaved = false;
let correctRounds = 0;

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
        title: lessonTitle || "Animals Lesson",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Animals lesson progress saved and badges checked.");
  } catch (error) {
    console.error("Error saving animals lesson progress:", error);
  }
}

const animals = [
  { name: "dog", img: "assets/images/dog.jpg" },
  { name: "cat", img: "assets/images/cat.jpg" },
  { name: "cow", img: "assets/images/cow.jpg" },
  { name: "lion", img: "assets/images/lion.jpg" },
  { name: "elephant", img: "assets/images/elephant.jpg" },
  { name: "bird", img: "assets/images/bird.jpg" },
  { name: "fish", img: "assets/images/fish.jpg" }
];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

const learnText = document.getElementById("learnText");
const animalDivs = document.querySelectorAll(".animal");

animalDivs.forEach(div => {
  div.addEventListener("click", () => {
    const name = div.dataset.name;

    learnText.textContent = "This is a " + name;
    playVoice("This is a " + name);

    div.classList.add("correct-anim");

    setTimeout(() => {
      div.classList.remove("correct-anim");
    }, 300);
  });
});

function goToGame() {
  showScreen("screen2");
  loadRound();
}

const gameGrid = document.getElementById("gameGrid");
const instruction = document.getElementById("instruction");
const feedback = document.getElementById("feedback");

let currentAnimal = "";

function loadRound() {
  gameGrid.innerHTML = "";
  feedback.textContent = "";

  const shuffled = [...animals].sort(() => 0.5 - Math.random());
  currentAnimal = shuffled[Math.floor(Math.random() * shuffled.length)].name;

  instruction.textContent = "Find the " + currentAnimal;
  playVoice("Find the " + currentAnimal);

  shuffled.forEach(animal => {
    const div = document.createElement("div");
    div.classList.add("animal");

    div.innerHTML = `
      <img src="${animal.img}">
      <p>${animal.name}</p>
    `;

    div.onclick = () => {
      if (animal.name === currentAnimal) {
        feedback.textContent = "⭐ Good job!";
        feedback.className = "correct";
        playVoice("Good job");

        div.classList.add("correct-anim");

        correctRounds++;

        if (correctRounds >= 5) {
          instruction.textContent = "🎉 Lesson Complete!";
          feedback.textContent = "";
          saveLessonProgress();
          return;
        }

        setTimeout(loadRound, 1200);
      } else {
        feedback.textContent = "❌ Try again!";
        feedback.className = "wrong";
        playVoice("Try again");

        div.classList.add("shake");

        setTimeout(() => {
          div.classList.remove("shake");
        }, 300);
      }
    };

    gameGrid.appendChild(div);
  });
}

function playVoice(text) {
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.8;
  window.speechSynthesis.speak(speech);
}