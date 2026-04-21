const colorLesson = document.getElementById("colorLesson");

// Go to Color Hunt lesson
colorLesson.addEventListener("click", () => {
  window.location.href = "colors.html";
});

// Shapes
shapeLesson.addEventListener("click", () => {
  window.location.href = "shapes.html";
});

// Others (optional placeholders for now)
alphabetLesson.addEventListener("click", () => {
  window.location.href = "alphabet.html";
});

animalLesson.addEventListener("click", () => {
  window.location.href = "animals.html";
});

fruitLesson.addEventListener("click", () => {
   window.location.href = "fruit.html";
});


// Back to menu
function goBack() {
  window.location.href = "../../menu.html";
}