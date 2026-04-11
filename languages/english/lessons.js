const colorLesson = document.getElementById("colorLesson");

// Go to Color Hunt lesson
colorLesson.addEventListener("click", () => {
  window.location.href = "colors.html";
});

// Back to menu
function goBack() {
  window.location.href = "../menu.html";
}