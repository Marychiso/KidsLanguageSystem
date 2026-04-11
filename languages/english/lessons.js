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
toyLesson.addEventListener("click", () => {
  alert("Toy lesson coming soon!");
});

familyLesson.addEventListener("click", () => {
  alert("Family lesson coming soon!");
});

fruitLesson.addEventListener("click", () => {
  alert("Fruit lesson coming soon!");
});


// Back to menu
function goBack() {
  window.location.href = "../menu.html";
}