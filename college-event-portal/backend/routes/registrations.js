const express = require("express");
const { readDB, writeDB, generateId } = require("../utils/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/registrations/:eventId - student registers for an event
router.post("/:eventId", requireAuth, (req, res) => {
  const db = readDB();
  const event = db.events.find((e) => e.id === req.params.eventId);
  if (!event) return res.status(404).json({ message: "Event not found." });

  if (event.status === "closed") {
    return res.status(400).json({ message: "Registrations are closed for this event." });
  }

  const alreadyRegistered = db.registrations.some(
    (r) => r.eventId === event.id && r.userId === req.user.id
  );
  if (alreadyRegistered) {
    return res.status(409).json({ message: "You are already registered for this event." });
  }

  const currentCount = db.registrations.filter((r) => r.eventId === event.id).length;
  if (currentCount >= event.maxParticipants) {
    return res.status(400).json({ message: "This event is full." });
  }

  const registration = {
    id: generateId("reg"),
    eventId: event.id,
    userId: req.user.id,
    registeredAt: new Date().toISOString(),
  };
  db.registrations.push(registration);
  writeDB(db);

  res.status(201).json({ message: `You're registered for ${event.title}!`, registration });
});

// DELETE /api/registrations/:eventId - student cancels their registration
router.delete("/:eventId", requireAuth, (req, res) => {
  const db = readDB();
  const before = db.registrations.length;
  db.registrations = db.registrations.filter(
    (r) => !(r.eventId === req.params.eventId && r.userId === req.user.id)
  );
  if (db.registrations.length === before) {
    return res.status(404).json({ message: "Registration not found." });
  }
  writeDB(db);
  res.json({ message: "Registration cancelled." });
});

// GET /api/registrations/me - list events the logged-in student registered for
router.get("/me/list", requireAuth, (req, res) => {
  const db = readDB();
  const myRegs = db.registrations.filter((r) => r.userId === req.user.id);
  const events = myRegs.map((r) => {
    const event = db.events.find((e) => e.id === r.eventId);
    if (!event) return null;
    const registeredCount = db.registrations.filter((reg) => reg.eventId === event.id).length;
    return {
      ...event,
      registeredCount,
      spotsLeft: event.maxParticipants - registeredCount,
      registeredAt: r.registeredAt,
    };
  }).filter(Boolean);
  res.json({ events });
});

module.exports = router;
