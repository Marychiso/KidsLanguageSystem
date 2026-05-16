const buttons = document.querySelectorAll(".lang-btn");

async function loadLanguages() {
  try {
    const response = await fetch("http://localhost:5000/api/languages");
    const languages = await response.json();

    console.log("Languages from backend:", languages);

    buttons.forEach((btn) => {
      const text = btn.innerText.toLowerCase();

      const found = languages.find(lang =>
        text.includes(lang.name.toLowerCase())
      );

      if (found) {
        btn.classList.remove("disabled");
        btn.classList.add("active");

        btn.addEventListener("click", () => {
          localStorage.setItem("languageId", found._id);
          localStorage.setItem("languageName", found.name);

          window.location.href = "menu.html";
        });

      } else {
        btn.classList.remove("active");
        btn.classList.add("disabled");

        btn.addEventListener("click", () => {
          alert("This language is coming soon!");
        });
      }
    });

  } catch (error) {
    console.error("Error loading languages:", error);
    alert("Backend is not connected. Please start the server.");
  }
}

loadLanguages();