let allEvents = [];

function showAlert(message, type = "error") {
  const box = document.getElementById("alertBox");
  box.textContent = message;
  box.className = `alert alert-${type === "error" ? "error" : "success"}`;
  box.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => { box.style.display = "none"; }, 4000);
}

function guardAdminRoute() {
  if (!isLoggedIn()) { window.location.href = "login.html"; return false; }
  if (!isAdmin()) { window.location.href = "dashboard.html"; return false; }
  return true;
}

function statusPill(event) {
  const full = event.registeredCount >= event.maxParticipants;
  if (event.status === "closed") return `<span class="status-badge status-closed">Closed</span>`;
  if (full) return `<span class="status-badge status-full">Full</span>`;
  return `<span class="status-badge status-open">Open</span>`;
}

async function loadAdminEvents() {
  const tbody = document.getElementById("adminTableBody");
  try {
    const { events } = await apiRequest("/events");
    allEvents = events;

    if (events.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="color: var(--muted);">No events yet. Create your first one.</td></tr>`;
      return;
    }

    tbody.innerHTML = events.map((e) => `
      <tr>
        <td><strong>${escapeHtml(e.title)}</strong></td>
        <td>${escapeHtml(e.category)}</td>
        <td>${formatDate(e.date)}</td>
        <td>${e.registeredCount} / ${e.maxParticipants}</td>
        <td>${statusPill(e)}</td>
        <td style="display:flex; gap:8px;">
          <button class="btn btn-ghost" data-action="participants" data-id="${e.id}" style="padding:6px 12px; font-size:0.78rem;">Participants</button>
          <button class="btn btn-ghost" data-action="edit" data-id="${e.id}" style="padding:6px 12px; font-size:0.78rem;">Edit</button>
          <button class="btn btn-danger" data-action="delete" data-id="${e.id}" style="padding:6px 12px; font-size:0.78rem;">Delete</button>
        </td>
      </tr>
    `).join("");

    attachRowHandlers();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color: var(--coral);">${escapeHtml(err.message)}</td></tr>`;
  }
}

function attachRowHandlers() {
  document.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });
  document.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(btn.dataset.id));
  });
  document.querySelectorAll('[data-action="participants"]').forEach((btn) => {
    btn.addEventListener("click", () => openParticipantsModal(btn.dataset.id));
  });
}

// ---------- Create / Edit modal ----------
function openCreateModal() {
  document.getElementById("modalTitle").textContent = "New event";
  document.getElementById("eventForm").reset();
  document.getElementById("eventId").value = "";
  document.getElementById("eventModal").classList.add("show");
}

function openEditModal(id) {
  const event = allEvents.find((e) => e.id === id);
  if (!event) return;
  document.getElementById("modalTitle").textContent = "Edit event";
  document.getElementById("eventId").value = event.id;
  document.getElementById("title").value = event.title;
  document.getElementById("description").value = event.description;
  document.getElementById("category").value = event.category;
  document.getElementById("maxParticipants").value = event.maxParticipants;
  document.getElementById("date").value = event.date;
  document.getElementById("time").value = event.time;
  document.getElementById("venue").value = event.venue;
  document.getElementById("status").value = event.status;
  document.getElementById("eventModal").classList.add("show");
}

function closeEventModal() {
  document.getElementById("eventModal").classList.remove("show");
}

async function handleEventFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("eventId").value;
  const body = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value,
    maxParticipants: Number(document.getElementById("maxParticipants").value),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    venue: document.getElementById("venue").value.trim(),
    status: document.getElementById("status").value,
  };

  const saveBtn = document.getElementById("saveEventBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  try {
    if (id) {
      await apiRequest(`/events/${id}`, { method: "PUT", body, auth: true });
      showAlert("Event updated.", "success");
    } else {
      await apiRequest("/events", { method: "POST", body, auth: true });
      showAlert("Event created.", "success");
    }
    closeEventModal();
    loadAdminEvents();
  } catch (err) {
    showAlert(err.message, "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save event";
  }
}

async function handleDelete(id) {
  const event = allEvents.find((e) => e.id === id);
  if (!confirm(`Delete "${event ? event.title : "this event"}"? This cannot be undone.`)) return;
  try {
    await apiRequest(`/events/${id}`, { method: "DELETE", auth: true });
    showAlert("Event deleted.", "success");
    loadAdminEvents();
  } catch (err) {
    showAlert(err.message, "error");
  }
}

// ---------- Participants modal ----------
async function openParticipantsModal(id) {
  const event = allEvents.find((e) => e.id === id);
  document.getElementById("participantsTitle").textContent = `Participants — ${event ? event.title : ""}`;
  const list = document.getElementById("participantsList");
  list.innerHTML = `<p style="color: var(--muted);">Loading…</p>`;
  document.getElementById("participantsModal").classList.add("show");

  try {
    const { participants } = await apiRequest(`/events/${id}/participants`, { auth: true });
    if (participants.length === 0) {
      list.innerHTML = `<p style="color: var(--muted);">No one has registered yet.</p>`;
      return;
    }
    list.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Roll no.</th></tr></thead>
        <tbody>
          ${participants.map((p) => `
            <tr>
              <td>${escapeHtml(p.name)}</td>
              <td>${escapeHtml(p.email)}</td>
              <td>${escapeHtml(p.rollNumber || "—")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    list.innerHTML = `<p style="color: var(--coral);">${escapeHtml(err.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  if (!guardAdminRoute()) return;

  loadAdminEvents();
  document.getElementById("newEventBtn").addEventListener("click", openCreateModal);
  document.getElementById("cancelModalBtn").addEventListener("click", closeEventModal);
  document.getElementById("eventForm").addEventListener("submit", handleEventFormSubmit);
  document.getElementById("closeParticipantsBtn").addEventListener("click", () => {
    document.getElementById("participantsModal").classList.remove("show");
  });
});
