// ======================
// ANIMAL DATA
// ======================

const animals = [
  {
    name: "Fish",
    image: "assets/images/fish.jpg",
    home: "pond"
  },

  {
    name: "Cow",
    image: "assets/images/cow.jpg",
    home: "barn"
  },

  {
    name: "Bird",
    image: "assets/images/bird.jpg",
    home: "tree"
  },

  {
    name: "Lion",
    image: "assets/images/lion.jpg",
    home: "jungle"
  },

  {
    name: "Monkey",
    image: "assets/images/monkey.jpg",
    home: "jungle"
  },

  {
    name: "Dog",
    image: "assets/images/dog.jpg",
    home: "barn"
  },

  {
    name: "Frog",
    image: "assets/images/frog.jpg",
    home: "pond"
  }
];

// ======================
// SHUFFLE
// ======================

function shuffle(array){
  return array.sort(() => Math.random() - 0.5);
}

shuffle(animals);

// ======================
// DOM
// ======================

const animalImage = document.getElementById("animalImage");
const animalName = document.getElementById("animalName");
const feedback = document.getElementById("feedback");
const animalCard = document.getElementById("animalCard");
const homes = document.querySelectorAll(".home");
const finishScreen = document.getElementById("finishScreen");

// ======================
// GAME STATE
// ======================

let currentIndex = 0;

// ======================
// LOAD ANIMAL
// ======================

function loadAnimal(){

  if(currentIndex >= animals.length){

    document.querySelector(".animal-section").style.display = "none";
    document.querySelector(".homes-grid").style.display = "none";

    finishScreen.style.display = "block";

    return;
  }

  const current = animals[currentIndex];

  animalImage.src = current.image;
  animalName.textContent = current.name;

  feedback.textContent = "";
}

// ======================
// HOME CLICK
// ======================

homes.forEach(home => {

  home.onclick = () => {

    const current = animals[currentIndex];

    // CORRECT
    if(home.dataset.home === current.home){

      feedback.textContent = "🎉 Great job!";

      animalCard.classList.add("correct");
      home.classList.add("correct");

      setTimeout(() => {

        animalCard.classList.remove("correct");
        home.classList.remove("correct");

        currentIndex++;
        loadAnimal();

      }, 900);

    }

    // WRONG
    else{

      feedback.textContent = "Try again!";

      animalCard.classList.add("wrong");

      setTimeout(() => {
        animalCard.classList.remove("wrong");
      }, 500);
    }

  };

});

// ======================
// RESTART
// ======================

function restartGame(){

  currentIndex = 0;

  shuffle(animals);

  document.querySelector(".animal-section").style.display = "block";
  document.querySelector(".homes-grid").style.display = "grid";

  finishScreen.style.display = "none";

  loadAnimal();
}

// ======================
// NAVIGATION
// ======================

function goGames(){
  window.location.href = "games.html";
}

// START
loadAnimal();