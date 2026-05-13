const animals = [
  { name: "Fish", image: "assets/images/fish.jpg", home: "pond" },
  { name: "Cow", image: "assets/images/cow.jpg", home: "barn" },
  { name: "Bird", image: "assets/images/bird.jpg", home: "tree" },
  { name: "Lion", image: "assets/images/lion.jpg", home: "jungle" },
  { name: "Monkey", image: "assets/images/monkey.jpg", home: "jungle" },
  { name: "Dog", image: "assets/images/dog.jpg", home: "barn" },
  { name: "Frog", image: "assets/images/frog.jpg", home: "pond" }
];

function shuffle(array){
  return array.sort(() => Math.random() - 0.5);
}

shuffle(animals);

const animalImage = document.getElementById("animalImage");
const animalName = document.getElementById("animalName");
const feedback = document.getElementById("feedback");
const animalCard = document.getElementById("animalCard");
const homes = document.querySelectorAll(".home");
const finishScreen = document.getElementById("finishScreen");

let currentIndex = 0;
let progressSaved = false;

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
        title: gameTitle || "Animal Game",
        completed: true,
        score: null
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Animal game progress saved and badges checked.");

  } catch (error) {
    console.error("Error saving animal game progress:", error);
  }
}

function loadAnimal(){

  if(currentIndex >= animals.length){

    document.querySelector(".animal-section").style.display = "none";
    document.querySelector(".homes-grid").style.display = "none";

    finishScreen.style.display = "block";

    if (!progressSaved) {
      progressSaved = true;
      saveGameProgress();
    }

    return;
  }

  const current = animals[currentIndex];

  animalImage.src = current.image;
  animalName.textContent = current.name;

  feedback.textContent = "";
}

homes.forEach(home => {

  home.onclick = () => {

    const current = animals[currentIndex];

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

    } else {

      feedback.textContent = "Try again!";

      animalCard.classList.add("wrong");

      setTimeout(() => {
        animalCard.classList.remove("wrong");
      }, 500);
    }

  };

});

function restartGame(){

  currentIndex = 0;
  progressSaved = false;

  shuffle(animals);

  document.querySelector(".animal-section").style.display = "block";
  document.querySelector(".homes-grid").style.display = "grid";

  finishScreen.style.display = "none";

  loadAnimal();
}

function goGames(){
  window.location.href = "games.html";
}

loadAnimal();