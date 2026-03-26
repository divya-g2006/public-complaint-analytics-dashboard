import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function register(req, res) {
  const { name, email, password, role, adminKey } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const normalizedEmail = normalizeEmail(email);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ message: "Email is already registered." });

  let safeRole = "user";
  if (role === "admin") {
    // Prevent arbitrary admin signups unless explicitly enabled.
    const requiredKey = process.env.ADMIN_REGISTRATION_KEY;
    if (requiredKey && String(adminKey || "") === requiredKey) safeRole = "admin";
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
    role: safeRole
  });

  const token = generateToken(user._id);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) return res.status(401).json({ message: "Invalid credentials." });

  const ok = await user.matchPassword(String(password));
  if (!ok) return res.status(401).json({ message: "Invalid credentials." });

  const token = generateToken(user._id);
  res.json({
    token,
    role: user.role,
    user: { name: user.name, email: user.email }
  });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
