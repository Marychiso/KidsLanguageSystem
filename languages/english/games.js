async function goGame(type) {
  try {
    const languageId = localStorage.getItem("languageId");

    if (!languageId) {
      alert("Please select a language first.");
      return;
    }

    const response = await fetch(`http://localhost:5000/api/games/language/${languageId}`);
    const games = await response.json();

    let selectedGame = null;

    if (type === "color") {
      selectedGame = games.find(game => game.page === "colorgame.html");
    } 
    else if (type === "alphabet") {
      selectedGame = games.find(game => game.page === "alphabetgame.html");
    } 
    else if (type === "shapes") {
      selectedGame = games.find(game => game.page === "shapesgame.html");
    } 
    else if (type === "animals") {
      selectedGame = games.find(game => game.page === "animalgame.html");
    } 
    else if (type === "fruits") {
      selectedGame = games.find(game => game.page === "fruitgame.html");
    }

    if (!selectedGame) {
      alert("This game is not available in the database yet.");
      return;
    }

    localStorage.setItem("gameId", selectedGame._id);
    localStorage.setItem("gameTitle", selectedGame.title);
    localStorage.setItem("gamePage", selectedGame.page);

    window.location.href = selectedGame.page;

  } catch (error) {
    console.error("Error opening game:", error);
    alert("Failed to open game.");
  }
}

function goMenu() {
  window.location.href = "../../menu.html";
}