function goGame(type) {

  if(type === "color"){
    window.location.href = "colorgame.html";
  }

  else if(type === "alphabet"){
    window.location.href = "alphabetgame.html";
  }

  else if(type === "shapes"){
    window.location.href = "shapesgame.html";
  }

  else if(type === "animals"){
    window.location.href = "animalgame.html";
  }

  else if(type === "fruits"){
    window.location.href = "fruitgame.html";
  }

}

function goMenu() {
  window.location.href = "../../menu.html";
}