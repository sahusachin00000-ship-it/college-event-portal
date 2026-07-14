function ticketCardHTML(event) {
  const isFull = event.spotsLeft <= 0;
  const statusClass = isFull ? "status-full" : event.status === "closed" ? "status-closed" : "status-open";
  const statusLabel = isFull ? "Full" : event.status === "closed" ? "Closed" : "Open";
  const tagClass = `tag-${["Technical", "Sports", "Cultural"].includes(event.category) ? event.category : "Other"}`;

  return `
    <a href="event-detail.html?id=${event.id}" class="ticket">
      <div class="ticket-main">
        <span class="category-tag ${tagClass}">${escapeHtml(event.category)}</span>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description.slice(0, 90))}${event.description.length > 90 ? "…" : ""}</p>
        <div class="ticket-meta">
          <span>📅 ${formatDate(event.date)}</span>
          <span>📍 ${escapeHtml(event.venue)}</span>
        </div>
      </div>
      <div class="ticket-stub">
        <span class="status-badge ${statusClass}">${statusLabel}</span>
        <div class="stub-spots">${Math.max(event.spotsLeft, 0)}</div>
        <div class="stub-label">spots left</div>
      </div>
    </a>
  `;
}

async function loadUpcoming() {
  const grid = document.getElementById("upcomingGrid");
  try {
    const { events } = await apiRequest("/events");
    const totalSpots = events.reduce((sum, e) => sum + Math.max(e.spotsLeft, 0), 0);
    document.getElementById("statEvents").textContent = events.length;
    document.getElementById("statSpots").textContent = totalSpots;

    if (events.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>No events yet</h3><p>Check back soon.</p></div>`;
      return;
    }

    grid.innerHTML = events.slice(0, 6).map(ticketCardHTML).join("");
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><h3>Couldn't load events</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadUpcoming);
