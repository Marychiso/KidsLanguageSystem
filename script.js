// Forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Switch buttons
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');

// Switch to Register
showRegister.addEventListener('click', () => {
  loginForm.classList.remove('active');
  registerForm.classList.add('active');
});

// Switch to Login
showLogin.addEventListener('click', () => {
  registerForm.classList.remove('active');
  loginForm.classList.add('active');
});

// LOGIN FUNCTION
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  alert(`Welcome back, ${username}!`);

  // Navigate to language selection
  window.location.href = "languages.html";

  loginForm.reset();
});

// REGISTER FUNCTION
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  alert(`Account created successfully!\nWelcome ${username}!\nEmail: ${email}`);

  registerForm.reset();

  // Switch back to login after register
  registerForm.classList.remove('active');
  loginForm.classList.add('active');

  // Navigate to language selection
  window.location.href = "languages.html";
});