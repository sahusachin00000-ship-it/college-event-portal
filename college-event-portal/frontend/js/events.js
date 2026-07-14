let currentCategory = "All";
let currentSearch = "";
let debounceTimer = null;

async function loadEventsGrid() {
  const grid = document.getElementById("eventsGrid");
  grid.innerHTML = `<p style="color: var(--muted);">Loading events…</p>`;

  const params = new URLSearchParams();
  if (currentCategory !== "All") params.set("category", currentCategory);
  if (currentSearch) params.set("search", currentSearch);

  try {
    const { events } = await apiRequest(`/events?${params.toString()}`);
    if (events.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>No matching events</h3><p>Try a different filter or search term.</p></div>`;
      return;
    }
    grid.innerHTML = events.map(ticketCardHTML).join("");
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><h3>Couldn't load events</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function setupFilters() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      currentCategory = chip.dataset.category;
      loadEventsGrid();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = e.target.value.trim();
      loadEventsGrid();
    }, 300);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  loadEventsGrid();
});
