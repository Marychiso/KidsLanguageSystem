let currentScore = 0;
let playing = false;
let gameTimer;
let timeLeft = 30;

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

// ======================
// NAVIGATION
// ======================

function goGames(){
  window.location.href = "games.html";
}

// ======================
// RANDOM SHAPE
// ======================

function randomSelection(){

  let rand =
    Math.floor(Math.random() * shapes.length);

  return shapes[rand];
}

// ======================
// SHOW SHAPES
// ======================

function generateShapes(){

  shape1 = randomSelection();

  // sometimes match
  const shouldMatch =
    Math.random() > 0.5;

  shape2 =
    shouldMatch
    ? shape1
    : randomSelection();

  drawShape("shape1", shape1);

  drawShape("shape2", shape2);
}

// ======================
// DRAW SHAPE
// ======================

function drawShape(id, shape){

  const el =
    document.getElementById(id);

  el.style.width =
    shape.width + "px";

  el.style.height =
    shape.height + "px";

  el.style.background =
    shape.color;
}

// ======================
// START GAME
// ======================

document.getElementById("play").onclick = () => {

  if(playing) return;

  playing = true;

  document.getElementById("play").disabled = true;

  generateShapes();

  gameTimer = setInterval(() => {

    timeLeft--;

    document.getElementById("time").textContent =
      timeLeft;

    generateShapes();

    // slower for kids
  }, 2500);

  // END GAME
  setTimeout(() => {

    clearInterval(gameTimer);

    playing = false;

    document.getElementById("play").disabled = false;

    document.getElementById("resultMessage")
      .textContent =
      "🎉 Game Finished! Your Score: " +
      currentScore;

  }, 30000);
};

// ======================
// MATCH
// ======================

matchBtn.onclick = () => {

  if(!playing) return;

  if(Object.is(shape1, shape2)){

    currentScore++;

    document.getElementById("score")
      .textContent = currentScore;

    matchBtn.classList.add("correct");

    setTimeout(() => {
      matchBtn.classList.remove("correct");
    }, 400);
  }

  else{

    currentScore--;

    document.getElementById("score")
      .textContent = currentScore;

    matchBtn.classList.add("wrong");

    setTimeout(() => {
      matchBtn.classList.remove("wrong");
    }, 400);
  }
};

// ======================
// RESET
// ======================

document.getElementById("reset").onclick = () => {

  location.reload();
};