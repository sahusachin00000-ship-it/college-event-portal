// ============================================================
// Central place to configure the backend URL.
// Change this if your backend runs on a different host/port.
// ============================================================
const API_BASE = "http://localhost:5000/api";

// ---------- Token / user storage ----------
function getToken() { return localStorage.getItem("cea_token"); }
function getUser() {
  const raw = localStorage.getItem("cea_user");
  return raw ? JSON.parse(raw) : null;
}
function saveSession(token, user) {
  localStorage.setItem("cea_token", token);
  localStorage.setItem("cea_user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("cea_token");
  localStorage.removeItem("cea_user");
}
function isLoggedIn() { return !!getToken(); }
function isAdmin() {
  const u = getUser();
  return u && u.role === "admin";
}

// ---------- Generic fetch wrapper ----------
async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error("Could not reach the server. Is the backend running?");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Session expired / invalid token -> force logout
    if (res.status === 401 && auth) {
      clearSession();
    }
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// ---------- Shared navbar rendering ----------
function renderNavbar() {
  const slot = document.getElementById("navUserSlot");
  if (!slot) return;

  if (isLoggedIn()) {
    const user = getUser();
    slot.innerHTML = `
      <span id="navGreeting">Hi, ${escapeHtml(user.name.split(" ")[0])}</span>
      ${user.role === "admin" ? `<a href="admin.html" class="btn btn-ghost">Admin Panel</a>` : `<a href="dashboard.html" class="btn btn-ghost">My Events</a>`}
      <button class="btn btn-danger" id="logoutBtn">Log out</button>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  } else {
    slot.innerHTML = `
      <a href="login.html" class="btn btn-ghost">Log in</a>
      <a href="register.html" class="btn btn-primary">Sign up</a>
    `;
  }
}

// ---------- Small utilities ----------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${suffix}`;
}

document.addEventListener("DOMContentLoaded", renderNavbar);
