import User from "../models/User.js";
import { DEFAULT_ADMINS } from "./defaultAdmins.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function shouldAutoSeedAdmins() {
  // Safety:
  // - In production, require an explicit opt-in.
  // - In non-production, allow bootstrap by default.
  if (process.env.NODE_ENV === "production") return String(process.env.AUTO_SEED_ADMINS || "") === "true";
  return String(process.env.AUTO_SEED_ADMINS || "true") === "true";
}

export async function ensureDefaultAdmins() {
  if (!shouldAutoSeedAdmins()) return { ok: true, seeded: false, reason: "AUTO_SEED_ADMINS disabled" };

  const existingAdmin = await User.findOne({ role: "admin" }).lean();
  if (existingAdmin) return { ok: true, seeded: false, reason: "admin already exists" };

  // Create defaults (idempotent creation)
  for (const admin of DEFAULT_ADMINS) {
    const email = normalizeEmail(admin.email);
    const exists = await User.findOne({ email }).lean();
    if (exists) continue;
    // eslint-disable-next-line no-await-in-loop
    await User.create({
      name: String(admin.name || "Admin").trim(),
      email,
      password: String(admin.password),
      role: "admin"
    });
  }

  return { ok: true, seeded: true };
}

