const express = require("express");
const { readDB, writeDB, generateId } = require("../utils/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Helper: attach a live registeredCount to an event object
function withCount(event, db) {
  const count = db.registrations.filter((r) => r.eventId === event.id).length;
  return { ...event, registeredCount: count, spotsLeft: event.maxParticipants - count };
}

// GET /api/events  (public) - supports ?category=Technical search filter
router.get("/", (req, res) => {
  const db = readDB();
  let events = db.events.map((e) => withCount(e, db));

  const { category, search } = req.query;
  if (category && category !== "All") {
    events = events.filter((e) => e.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    events = events.filter(
      (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
    );
  }

  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json({ events });
});

// GET /api/events/:id (public)
router.get("/:id", (req, res) => {
  const db = readDB();
  const event = db.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found." });
  res.json({ event: withCount(event, db) });
});

// POST /api/events (admin only)
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { title, description, category, date, time, venue, maxParticipants } = req.body;

  if (!title || !description || !category || !date || !time || !venue || !maxParticipants) {
    return res.status(400).json({ message: "All event fields are required." });
  }

  const db = readDB();
  const newEvent = {
    id: generateId("evt"),
    title,
    description,
    category,
    date,
    time,
    venue,
    maxParticipants: Number(maxParticipants),
    createdBy: req.user.id,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  db.events.push(newEvent);
  writeDB(db);
  res.status(201).json({ message: "Event created.", event: withCount(newEvent, db) });
});

// PUT /api/events/:id (admin only)
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  const idx = db.events.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Event not found." });

  const allowedFields = ["title", "description", "category", "date", "time", "venue", "maxParticipants", "status"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) db.events[idx][field] = req.body[field];
  });

  writeDB(db);
  res.json({ message: "Event updated.", event: withCount(db.events[idx], db) });
});

// DELETE /api/events/:id (admin only)
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  const exists = db.events.some((e) => e.id === req.params.id);
  if (!exists) return res.status(404).json({ message: "Event not found." });

  db.events = db.events.filter((e) => e.id !== req.params.id);
  db.registrations = db.registrations.filter((r) => r.eventId !== req.params.id);
  writeDB(db);
  res.json({ message: "Event deleted." });
});

// GET /api/events/:id/participants (admin only) - see who registered
router.get("/:id/participants", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  const regs = db.registrations.filter((r) => r.eventId === req.params.id);
  const participants = regs.map((r) => {
    const user = db.users.find((u) => u.id === r.userId);
    return {
      name: user ? user.name : "Unknown",
      email: user ? user.email : "Unknown",
      rollNumber: user ? user.rollNumber : "",
      registeredAt: r.registeredAt,
    };
  });
  res.json({ participants });
});

module.exports = router;
