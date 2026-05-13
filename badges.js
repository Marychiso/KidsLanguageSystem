const badgeContainer = document.getElementById("badgeContainer");

async function loadBadges() {
  try {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      badgeContainer.innerHTML = "<p>Please login first to view badges.</p>";
      return;
    }

    const response = await fetch(`http://localhost:5000/api/badges/user/${userId}`);
    const badges = await response.json();

    console.log("Badges from backend:", badges);

    badgeContainer.innerHTML = "";

    if (!badges.length) {
      badgeContainer.innerHTML = "<p>No badges earned yet. Complete an activity to earn one!</p>";
      return;
    }

    badges.forEach((badge) => {
      const card = document.createElement("div");
      card.classList.add("badge-card");

      card.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.badgeName}</div>
        <div class="badge-description">${badge.description}</div>
      `;

      badgeContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading badges:", error);
    badgeContainer.innerHTML = "<p>Failed to load badges.</p>";
  }
}

function goBack() {
  window.location.href = "menu.html";
}

loadBadges();