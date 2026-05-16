const lessonsBtn = document.querySelector(".lessons");
const quizzesBtn = document.querySelector(".quizzes");
const storiesBtn = document.querySelector(".stories");
const gamesBtn = document.querySelector(".games");
const badgesCard = document.querySelector(".badges");

lessonsBtn.addEventListener("click", () => {
  window.location.href = "languages/english/lessons.html";
});

quizzesBtn.addEventListener("click", () => {
  window.location.href = "languages/english/quizzes.html";
});

storiesBtn.addEventListener("click", () => {
  window.location.href = "languages/english/stories.html";
});

gamesBtn.addEventListener("click", () => {
  window.location.href = "languages/english/games.html";
});

badgesCard.addEventListener("click", () => {
  window.location.href = "badges.html";
});


function goLanguages() {
  window.location.href = "languages.html";
}