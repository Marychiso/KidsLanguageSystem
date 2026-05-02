function openQuiz(type) {

  if (type === "colors") {
    window.location.href = "colorsquiz.html";
  }

  else if (type === "alphabet") {
    window.location.href = "alphabetquiz.html";
  }

  else if (type === "shapes") {
    window.location.href = "shapesquiz.html";
  }

  else if (type === "animals") {
    window.location.href = "animalsquiz.html";
  }

  else if (type === "fruits") {
    window.location.href = "fruitsquiz.html";
  }
}

// BACK TO MAIN MENU
function goMenu() {
  window.location.href = "menu.html";
}