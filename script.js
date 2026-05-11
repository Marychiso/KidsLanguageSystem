const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// SHOW REGISTER FORM
showRegister.addEventListener("click", () => {
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
});

// SHOW LOGIN FORM
showLogin.addEventListener("click", () => {
  registerForm.classList.remove("active");
  loginForm.classList.add("active");
});

// REGISTER USER
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;

  // CHECK PASSWORD MATCH
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        role: "child"
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registration successful! Please login.");

      registerForm.reset();

      registerForm.classList.remove("active");
      loginForm.classList.add("active");

    } else {
      alert(data.message || "Registration failed.");
    }

  } catch (error) {
    console.error("Register error:", error);
    alert("Something went wrong during registration.");
  }
});

// LOGIN USER
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  console.log("Login username:", username);

  try {
    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login successful!");

      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role);

      window.location.href = "languages.html";

    } else {
      alert(data.message || "Login failed.");
    }

  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong during login.");
  }
});