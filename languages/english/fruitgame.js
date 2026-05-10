// ======================
// NAVIGATION
// ======================
function goGames() {
  window.location.href = "games.html";
}

// ======================
// FRUIT DATA
// ======================
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
    hints: ["I am sweet", "I have tiny seeds", ]
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

// ======================
// DOM
// ======================
const hintText = document.getElementById("hintText");
const mysteryFruit = document.getElementById("mysteryFruit");
const fruitOptions = document.getElementById("fruitOptions");
const message = document.getElementById("message");

// ======================
// GAME VARIABLES
// ======================
let shuffledFruits = [];
let currentFruit = null;
let hintIndex = 0;
let completedCount = 0;

// ======================
// SHUFFLE
// ======================
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ======================
// START GAME
// ======================
function startGame() {

  shuffledFruits = shuffle([...fruits]);
  completedCount = 0;

  loadNextFruit();
}

// ======================
// LOAD NEXT FRUIT
// ======================
function loadNextFruit() {

  // GAME COMPLETE
  if (completedCount >= fruits.length) {

    hintText.textContent = "🎉 Game Complete!";
    mysteryFruit.innerHTML = "🏆";
    message.textContent = "You guessed all the fruits!";

    fruitOptions.innerHTML = "";

    return;
  }

  currentFruit = shuffledFruits[completedCount];

  hintIndex = 0;

  message.textContent = "";

  mysteryFruit.innerHTML = "❓";

  showHint();

  renderOptions();
}

// ======================
// SHOW HINT
// ======================
function showHint() {

  hintText.textContent =
    currentFruit.hints[hintIndex];
}

// ======================
// RENDER OPTIONS
// ======================
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

// ======================
// CHECK ANSWER
// ======================
function checkAnswer(fruit) {

  // CORRECT
  if (fruit.name === currentFruit.name) {

    mysteryFruit.innerHTML =
      `<img src="${currentFruit.img}">`;

    message.textContent =
      "🎉 You found the " + currentFruit.name + "!";

    mysteryFruit.classList.add("bounce");

    setTimeout(() => {

      mysteryFruit.classList.remove("bounce");

      completedCount++;

      loadNextFruit();

    }, 1500);
  }

  // WRONG
  else {

    message.textContent =
      "Oops! Try again!";

    mysteryFruit.classList.add("shake");

    setTimeout(() => {
      mysteryFruit.classList.remove("shake");
    }, 500);

    // NEXT HINT
    if (hintIndex < currentFruit.hints.length - 1) {
      hintIndex++;
      showHint();
    }
  }
}

// ======================
// PLAY AGAIN
// ======================
function playAgain() {
  startGame();
}

// START
startGame();