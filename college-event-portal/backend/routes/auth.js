const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { readDB, writeDB, generateId } = require("../utils/db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || "COLLEGE-ADMIN-2026";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, rollNumber, department, adminCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  // If the correct admin code is supplied, the account is created as an admin (for event organisers)
  const role = adminCode && adminCode === ADMIN_SECRET_CODE ? "admin" : "student";

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: generateId("user"),
    name,
    email: email.toLowerCase(),
    passwordHash,
    rollNumber: rollNumber || "",
    department: department || "",
    role,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    message: "Account created successfully.",
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Logged in successfully.",
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
