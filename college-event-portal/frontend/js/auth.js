function showError(message) {
  const box = document.getElementById("errorAlert");
  box.textContent = message;
  box.style.display = "block";
}

function redirectAfterAuth(user) {
  window.location.href = user.role === "admin" ? "admin.html" : "dashboard.html";
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("errorAlert").style.display = "none";
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in…";

    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const data = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
      saveSession(data.token, data.user);
      redirectAfterAuth(data.user);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  });
}

function setupRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("errorAlert").style.display = "none";
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account…";

    try {
      const body = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        rollNumber: document.getElementById("rollNumber").value.trim(),
        department: document.getElementById("department").value.trim(),
        adminCode: document.getElementById("adminCode").value.trim(),
      };
      const data = await apiRequest("/auth/register", { method: "POST", body });
      saveSession(data.token, data.user);
      redirectAfterAuth(data.user);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Create account";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  setupLoginForm();
  setupRegisterForm();
});
