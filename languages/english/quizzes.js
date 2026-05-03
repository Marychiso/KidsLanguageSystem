const quizContainer = document.getElementById("quizContainer");

const expectedQuizzes = [
  {
    title: "Colors Quiz",
    emoji: "🎨",
    category: "Colors"
  },
  {
    title: "Alphabet Quiz",
    emoji: "🔤",
    category: "Alphabet"
  },
  {
    title: "Shapes Quiz",
    emoji: "🔺",
    category: "Shapes"
  },
  {
    title: "Animals Quiz",
    emoji: "🐾",
    category: "Animals"
  },
  {
    title: "Fruit Quiz",
    emoji: "🍓",
    category: "Fruits"
  }
];

async function loadQuizzes() {
  try {
    const languageId = localStorage.getItem("languageId");

    if (!languageId) {
      quizContainer.innerHTML = "<p>No language selected.</p>";
      return;
    }

    const response = await fetch(`http://localhost:5000/api/quizzes/language/${languageId}`);
    const quizzesFromDB = await response.json();

    console.log("Quizzes from backend:", quizzesFromDB);

    quizContainer.innerHTML = "";

    expectedQuizzes.forEach((expectedQuiz) => {
      const quizFromDB = quizzesFromDB.find(
        (quiz) => quiz.title === expectedQuiz.title
      );

      const btn = document.createElement("button");
      btn.classList.add("quiz-btn");

      btn.innerText = `${expectedQuiz.emoji} ${expectedQuiz.title}`;

      btn.addEventListener("click", () => {
        if (quizFromDB && quizFromDB.page) {
          localStorage.setItem("quizId", quizFromDB._id);
          localStorage.setItem("quizTitle", quizFromDB.title);
          localStorage.setItem("quizPage", quizFromDB.page);

          window.location.href = quizFromDB.page;
        } else {
          alert(`${expectedQuiz.title} is coming soon!`);
        }
      });

      quizContainer.appendChild(btn);
    });

  } catch (error) {
    console.error("Error loading quizzes:", error);
    quizContainer.innerHTML = "<p>Failed to load quizzes.</p>";
  }
}

function goMenu() {
  window.location.href = "../../menu.html";
}

loadQuizzes();