async function loadMyEvents() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const grid = document.getElementById("myEventsGrid");
  try {
    const { events } = await apiRequest("/registrations/me/list", { auth: true });
    if (events.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>No registrations yet</h3><p><a href="events.html" style="color: var(--gold);">Browse events to get started →</a></p></div>`;
      return;
    }
    grid.innerHTML = events.map(ticketCardHTML).join("");
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><h3>Couldn't load your events</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadMyEvents);
