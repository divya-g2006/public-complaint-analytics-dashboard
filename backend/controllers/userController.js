import User from "../models/User.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function updateMe(req, res) {
  // Requirement: admin can update email and password
  const { email, password } = req.body || {};

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found." });

  if (email !== undefined) {
    const normalized = normalizeEmail(email);
    if (!normalized) return res.status(400).json({ message: "Email cannot be empty." });

    const existing = await User.findOne({ email: normalized, _id: { $ne: user._id } }).lean();
    if (existing) return res.status(409).json({ message: "Email is already in use." });

    user.email = normalized;
  }

  if (password !== undefined) {
    const pwd = String(password);
    if (pwd.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
    user.password = pwd; // hashed via pre-save hook
  }

  await user.save();

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

