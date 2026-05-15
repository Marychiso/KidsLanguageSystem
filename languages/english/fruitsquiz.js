let memoryRounds = 0;

// ======================
// NAVIGATION
// ======================
function switchScreen(a,b){
  document.getElementById(a).classList.remove("active");
  document.getElementById(b).classList.add("active");
}

function goToScreen2(){
  switchScreen("screen1","screen2");
  loadSizeQuestion();
}

function goToScreen3(){
  switchScreen("screen2","screen3");
  startMemory();
}

function back1(){ switchScreen("screen2","screen1"); }
function back2(){ switchScreen("screen3","screen2"); }
function goQuizzes(){ window.location.href="quizzes.html"; }


// ======================
// IMAGE LOOKUP
// ======================
const fruitImages = {};

document.querySelectorAll("#fruits1 .fruit").forEach(f => {
  fruitImages[f.dataset.fruit] = f.dataset.img;
});


// ======================
// SCREEN 1 (COLOR)
// ======================
const questions = [
  {q:"Which fruit is yellow?", a:"banana"},
  {q:"Which fruit is red?", a:"redapple"},
  {q:"Which fruit is green?", a:"pear"},
  {q:"Which fruit is orange?", a:"orange"},
  {q:"Which fruit is purple?", a:"grape"},
  {q:"Which fruit is blue?", a:"blueberry"}
];

let qIndex = 0;

const instruction1 = document.getElementById("instruction1");
const feedback1 = document.getElementById("feedback1");
const fruits1 = document.querySelectorAll("#fruits1 .fruit");

function loadQ(){
  if(qIndex >= questions.length){
    instruction1.textContent = "Great job!";
    return;
  }
  instruction1.textContent = questions[qIndex].q;
}

loadQ();

fruits1.forEach(f=>{
  f.onclick=()=>{
    if(f.dataset.fruit===questions[qIndex].a){
      feedback1.textContent="Yay!";
      f.classList.add("correct");

      setTimeout(()=>{
        f.classList.remove("correct");
        qIndex++;
        loadQ();
        feedback1.textContent="";
      },800);

    }else{
      feedback1.textContent="Try again!";
      f.classList.add("wrong");
      setTimeout(()=>f.classList.remove("wrong"),500);
    }
  }
});


// ======================
// SCREEN 2 (SIZE)
// ======================
const fruits2 = document.querySelectorAll("#fruits2 .fruit");
const feedback2 = document.getElementById("feedback2");
const sizeQuestion = document.getElementById("sizeQuestion");

const sizeQuestions = [
  {q:"Tap the biggest fruit", a:"biggest"},
  {q:"Tap a big fruit", a:"big"},
  {q:"Tap a small fruit", a:"small"},
  {q:"Tap the smallest fruit", a:"smallest"}
];

let sizeIndex = 0;

function loadSizeQuestion(){
  sizeQuestion.textContent =
    sizeQuestions[sizeIndex % sizeQuestions.length].q;

  feedback2.textContent = "";
}

fruits2.forEach(f=>{
  f.onclick=()=>{

    const current = sizeQuestions[sizeIndex % sizeQuestions.length];

    if(f.dataset.size === current.a){

      feedback2.textContent = "Correct!";
      f.classList.add("correct");

      setTimeout(()=>{
        f.classList.remove("correct");
        sizeIndex++;
        loadSizeQuestion();
      },800);

    } else {

      feedback2.textContent = "Try again!";
      f.classList.add("wrong");

      setTimeout(()=>f.classList.remove("wrong"),500);
    }
  };
});

// ======================
// SCREEN 3 (MEMORY LOOP)
// ======================
const memoryDisplay = document.getElementById("memoryDisplay");
const memoryOptions = document.getElementById("memoryOptions");
const instruction3 = document.getElementById("instruction3");
const feedback3 = document.getElementById("feedback3");

const allFruits = ["redapple","banana","grape","blueberry","orange","pear","watermelon2"];

let memorySet = [];

function getRandomFruits(count){
  let shuffled = [...allFruits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function startMemory(){
  memoryDisplay.innerHTML="";
  memoryOptions.innerHTML="";
  feedback3.textContent="";
  instruction3.textContent="Watch carefully...";

  // 🔁 NEW RANDOM SET EACH ROUND
  memorySet = getRandomFruits(3);

  let i = 0;

  function showNext(){
    if(i >= memorySet.length){
      setTimeout(()=>{
        memoryDisplay.innerHTML="";
        askMemory();
      },800);
      return;
    }

    const img = document.createElement("img");
    img.src = fruitImages[memorySet[i]];

    memoryDisplay.appendChild(img);

    i++;
    setTimeout(showNext, 600); // slower
  }

  showNext();
}

function askMemory(){
  memoryOptions.innerHTML="";
  feedback3.textContent="";

    memoryRounds++;

  if(memoryRounds >= 5){
    instruction3.textContent = "🎉 Quiz Complete!";
    feedback3.textContent = "Great job!";

    memoryOptions.innerHTML = "";

    setTimeout(() => {
      window.location.href = "quizzes.html";
    }, 2000);

    return;
  }

  // pick correct from what was shown
  const correct = memorySet[Math.floor(Math.random() * memorySet.length)];

  instruction3.textContent = "Which fruit did you see?";

  // build options (1 correct + 2 random wrong)
  let options = [correct];

  while(options.length < 3){
    const rand = allFruits[Math.floor(Math.random() * allFruits.length)];
    if(!options.includes(rand)){
      options.push(rand);
    }
  }

  // shuffle options
  options.sort(() => Math.random() - 0.5);

  options.forEach(f=>{
    const div = document.createElement("div");
    div.className = "fruit";

    const img = document.createElement("img");
    img.src = fruitImages[f];

    div.appendChild(img);

    div.onclick = () => {

      if(f === correct){
        feedback3.textContent = "✨ Correct!";

        setTimeout(()=>{
          startMemory(); // 🔁 NEXT ROUND
        },1000);

      } else {
        feedback3.textContent = "Try again!";

        setTimeout(()=>{
          startMemory(); // 🔁 RESTART ROUND
        },1000);
      }

    };

    memoryOptions.appendChild(div);
  });
}

function finishQuiz(){
  window.location.href = "quizzes.html";
}