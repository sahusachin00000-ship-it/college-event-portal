function getEventIdFromURL() {
  return new URLSearchParams(window.location.search).get("id");
}

function showAlert(message, type = "error") {
  const box = document.getElementById("alertBox");
  box.textContent = message;
  box.className = `alert alert-${type === "error" ? "error" : "success"}`;
  box.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function checkIfRegistered(eventId) {
  if (!isLoggedIn() || isAdmin()) return false;
  try {
    const { events } = await apiRequest("/registrations/me/list", { auth: true });
    return events.some((e) => e.id === eventId);
  } catch {
    return false;
  }
}

async function loadEventDetail() {
  const eventId = getEventIdFromURL();
  const body = document.getElementById("eventDetailBody");

  if (!eventId) {
    body.innerHTML = `<div class="empty-state"><h3>No event specified</h3><p><a href="events.html" style="color: var(--gold);">Browse all events →</a></p></div>`;
    return;
  }

  try {
    const { event } = await apiRequest(`/events/${eventId}`);
    const alreadyRegistered = await checkIfRegistered(eventId);
    const isFull = event.spotsLeft <= 0;
    const tagClass = `tag-${["Technical", "Sports", "Cultural"].includes(event.category) ? event.category : "Other"}`;

    let actionHTML = "";
    if (!isLoggedIn()) {
      actionHTML = `<a href="login.html" class="btn btn-primary btn-block">Log in to register</a>`;
    } else if (isAdmin()) {
      actionHTML = `<p style="color: var(--muted); font-size: 0.85rem;">Admin accounts can't register for events.</p>`;
    } else if (alreadyRegistered) {
      actionHTML = `<button class="btn btn-danger btn-block" id="cancelBtn">Cancel my registration</button>`;
    } else if (isFull || event.status === "closed") {
      actionHTML = `<button class="btn btn-primary btn-block" disabled>${event.status === "closed" ? "Registrations closed" : "Event full"}</button>`;
    } else {
      actionHTML = `<button class="btn btn-primary btn-block" id="registerBtn">Reserve my spot</button>`;
    }

    body.innerHTML = `
      <span class="category-tag ${tagClass}">${escapeHtml(event.category)}</span>
      <h1 style="margin-top: 14px;">${escapeHtml(event.title)}</h1>
      <p style="color: var(--muted); font-size: 1.02rem; margin-bottom: 28px;">${escapeHtml(event.description)}</p>

      <div class="card" style="max-width: none; padding: 28px;">
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); margin-bottom: 24px;">
          <div><div class="stub-label">Date</div><div class="stub-value">${formatDate(event.date)}</div></div>
          <div><div class="stub-label">Time</div><div class="stub-value">${formatTime(event.time)}</div></div>
          <div><div class="stub-label">Venue</div><div class="stub-value">${escapeHtml(event.venue)}</div></div>
          <div><div class="stub-label">Spots left</div><div class="stub-value">${Math.max(event.spotsLeft,0)} / ${event.maxParticipants}</div></div>
        </div>
        ${actionHTML}
      </div>
    `;

    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) registerBtn.addEventListener("click", () => handleRegister(eventId));

    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) cancelBtn.addEventListener("click", () => handleCancel(eventId));

  } catch (err) {
    body.innerHTML = `<div class="empty-state"><h3>Event not found</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

async function handleRegister(eventId) {
  try {
    const res = await apiRequest(`/registrations/${eventId}`, { method: "POST", auth: true });
    showAlert(res.message, "success");
    loadEventDetail();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

async function handleCancel(eventId) {
  if (!confirm("Cancel your registration for this event?")) return;
  try {
    const res = await apiRequest(`/registrations/${eventId}`, { method: "DELETE", auth: true });
    showAlert(res.message, "success");
    loadEventDetail();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  loadEventDetail();
});
