const lessonContainer = document.getElementById("lessonContainer");

function getLessonEmoji(title) {
  const emojiMap = {
    "Alphabet Lesson": "🔤",
    "Animals Lesson": "🐶",
    "Colors Lesson": "🎨",
    "Fruit Lesson": "🍎",
    "Shapes Lesson": "🧩"
  };

  return emojiMap[title] || "📚";
}

async function loadLessons() {
  try {
    const languageId = localStorage.getItem("languageId");
    const languageName = localStorage.getItem("languageName");

    console.log("Selected language ID:", languageId);
    console.log("Selected language name:", languageName);

    if (!languageId) {
      lessonContainer.innerHTML = "<p>No language selected.</p>";
      return;
    }

    const response = await fetch(`http://localhost:5000/api/lessons/language/${languageId}`);
    const lessons = await response.json();

    console.log("Lessons from backend:", lessons);

    lessonContainer.innerHTML = "";

    if (!lessons.length) {
      lessonContainer.innerHTML = "<p>No lessons available yet.</p>";
      return;
    }

    lessons.forEach((lesson) => {
      const card = document.createElement("div");

card.classList.add("lesson-card");

card.innerHTML = `
  <div class="lesson-icon">${getLessonEmoji(lesson.title)}</div>
  <div class="lesson-title">${lesson.title}</div>
`;

card.addEventListener("click", () => {

  localStorage.setItem("lessonId", lesson._id);
  localStorage.setItem("lessonTitle", lesson.title);
  localStorage.setItem("lessonPage", lesson.page);

  if (lesson.page) {
    window.location.href = lesson.page;
  } else {
    alert("This lesson page is missing in the database.");
  }

});

lessonContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading lessons:", error);
    lessonContainer.innerHTML = "<p>Failed to load lessons.</p>";
  }
}

function goBack() {
  window.location.href = "../../menu.html";
}

loadLessons();