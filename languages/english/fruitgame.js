function goGames() {
  window.location.href = "games.html";
}

const fruits = [
  {
    name: "apple",
    img: "assets/images/redapple.jpg",
    hints: ["I am red", "I am round", "Teachers like me"]
  },
  {
    name: "banana",
    img: "assets/images/banana.jpg",
    hints: ["I am yellow", "Monkeys love me", "I have a peel"]
  },
  {
    name: "orange",
    img: "assets/images/orange.jpg",
    hints: ["I am orange", "I am juicy", "I make orange juice"]
  },
  {
    name: "grape",
    img: "assets/images/grape.jpg",
    hints: ["I grow in bunches", "I am small", "I can be purple"]
  },
  {
    name: "strawberry",
    img: "assets/images/strawberry.jpg",
    hints: ["I am sweet", "I have tiny seeds"]
  },
  {
    name: "pear",
    img: "assets/images/pear.jpg",
    hints: ["I am green", "I am soft", "I look like a bell"]
  },
  {
    name: "watermelon",
    img: "assets/images/watermelon.jpg",
    hints: ["I am big", "I am green outside", "I have lots of water"]
  }
];

const hintText = document.getElementById("hintText");
const mysteryFruit = document.getElementById("mysteryFruit");
const fruitOptions = document.getElementById("fruitOptions");
const message = document.getElementById("message");

let shuffledFruits = [];
let currentFruit = null;
let hintIndex = 0;
let completedCount = 0;
let progressSaved = false;

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

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
        title: gameTitle || "Fruit Game",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Fruit game progress saved and badges checked.");

  } catch (error) {
    console.error("Error saving fruit game progress:", error);
  }
}

function startGame() {

  shuffledFruits = shuffle([...fruits]);
  completedCount = 0;
  progressSaved = false;

  loadNextFruit();
}

function loadNextFruit() {

  if (completedCount >= fruits.length) {

    hintText.textContent = "🎉 Game Complete!";
    mysteryFruit.innerHTML = "🏆";
    message.textContent = "You guessed all the fruits!";

    fruitOptions.innerHTML = "";

    if (!progressSaved) {
      progressSaved = true;
      saveGameProgress();
    }

    return;
  }

  currentFruit = shuffledFruits[completedCount];

  hintIndex = 0;

  message.textContent = "";

  mysteryFruit.innerHTML = "❓";

  showHint();

  renderOptions();
}

function showHint() {
  hintText.textContent = currentFruit.hints[hintIndex];
}

function renderOptions() {

  fruitOptions.innerHTML = "";

  const mixed = shuffle([...fruits]);

  mixed.forEach(fruit => {

    const div = document.createElement("div");
    div.className = "fruit-option";

    const img = document.createElement("img");
    img.src = fruit.img;

    div.appendChild(img);

    div.onclick = () => checkAnswer(fruit);

    fruitOptions.appendChild(div);
  });
}

function checkAnswer(fruit) {

  if (fruit.name === currentFruit.name) {

    mysteryFruit.innerHTML = `<img src="${currentFruit.img}">`;

    message.textContent = "🎉 You found the " + currentFruit.name + "!";

    mysteryFruit.classList.add("bounce");

    setTimeout(() => {

      mysteryFruit.classList.remove("bounce");

      completedCount++;

      loadNextFruit();

    }, 1500);

  } else {

    message.textContent = "Oops! Try again!";

    mysteryFruit.classList.add("shake");

    setTimeout(() => {
      mysteryFruit.classList.remove("shake");
    }, 500);

    if (hintIndex < currentFruit.hints.length - 1) {
      hintIndex++;
      showHint();
    }
  }
}

function playAgain() {
  startGame();
}

startGame();