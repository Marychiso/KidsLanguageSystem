const storyList = document.getElementById("storyList");

function getStoryEmoji(title) {
  if (title === "Color Story") return "🎈";
  if (title === "Shape Story" || title === "Shapes Story") return "🧩";
  if (title === "Alphabet Story") return "🔤";
  if (title === "Animal Story") return "🐾";
  if (title === "Fruit Story") return "🍎";
  return "📚";
}

function openStory(storyName) {
  window.location.href = storyName + ".html";
}

async function loadStories() {
  try {
    const languageId = localStorage.getItem("languageId");

    if (!languageId) {
      storyList.innerHTML = "<p>No language selected.</p>";
      return;
    }

    const response = await fetch(`http://localhost:5000/api/stories/language/${languageId}`);
    const stories = await response.json();

    console.log("Stories from backend:", stories);

    storyList.innerHTML = "";

    stories.forEach((story) => {
      const button = document.createElement("button");

      const storyName = story.page.replace(".html", "");
      const emoji = getStoryEmoji(story.title);

      button.innerText = `${emoji} ${story.title}`;
      button.onclick = function () {
        openStory(storyName);
      };

      storyList.appendChild(button);
    });

  } catch (error) {
    console.error("Error loading stories:", error);
    storyList.innerHTML = "<p>Failed to load stories.</p>";
  }
}

function goBack() {
  window.location.href = "../../menu.html";
}

loadStories();