let currentScore = 0;
let playing = false;
let gameTimer;
let timeLeft = 30;
let progressSaved = false;

let shape1;
let shape2;

const matchBtn = document.getElementById("match");

const shapes = [
  {color:"#ff595e", width:120, height:120},
  {color:"#ffca3a", width:140, height:100},
  {color:"#8ac926", width:110, height:130},
  {color:"#1982c4", width:150, height:90},
  {color:"#6a4c93", width:130, height:130}
];

function goGames(){
  window.location.href = "games.html";
}

function randomSelection(){
  let rand = Math.floor(Math.random() * shapes.length);
  return shapes[rand];
}

function generateShapes(){

  shape1 = randomSelection();

  const shouldMatch = Math.random() > 0.5;

  shape2 = shouldMatch ? shape1 : randomSelection();

  drawShape("shape1", shape1);
  drawShape("shape2", shape2);
}

function drawShape(id, shape){

  const el = document.getElementById(id);

  el.style.width = shape.width + "px";
  el.style.height = shape.height + "px";
  el.style.background = shape.color;
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
        title: gameTitle || "Shapes Game",
        completed: true,
        score: currentScore
      })
    });

    await fetch(`http://localhost:5000/api/badges/check/${userId}`, {
      method: "POST"
    });

    console.log("Shapes game progress saved and badges checked.");

  } catch (error) {
    console.error("Error saving shapes game progress:", error);
  }
}

document.getElementById("play").onclick = () => {

  if(playing) return;

  playing = true;
  progressSaved = false;
  currentScore = 0;
  timeLeft = 30;

  document.getElementById("score").textContent = currentScore;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("resultMessage").textContent = "";

  document.getElementById("play").disabled = true;

  generateShapes();

  gameTimer = setInterval(() => {

    timeLeft--;

    document.getElementById("time").textContent = timeLeft;

    generateShapes();

  }, 2500);

  setTimeout(() => {

    clearInterval(gameTimer);

    playing = false;

    document.getElementById("play").disabled = false;

    document.getElementById("resultMessage").textContent =
      "🎉 Game Finished! Your Score: " + currentScore;

    if (!progressSaved) {
      progressSaved = true;
      saveGameProgress();
    }

  }, 30000);
};

matchBtn.onclick = () => {

  if(!playing) return;

  if(Object.is(shape1, shape2)){

    currentScore++;

    document.getElementById("score").textContent = currentScore;

    matchBtn.classList.add("correct");

    setTimeout(() => {
      matchBtn.classList.remove("correct");
    }, 400);

  } else {

    currentScore--;

    document.getElementById("score").textContent = currentScore;

    matchBtn.classList.add("wrong");

    setTimeout(() => {
      matchBtn.classList.remove("wrong");
    }, 400);
  }
};

document.getElementById("reset").onclick = () => {
  location.reload();
};