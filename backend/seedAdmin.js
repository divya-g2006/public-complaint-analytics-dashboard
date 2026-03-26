import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import User from "./models/User.js";
import { DEFAULT_ADMINS } from "./utils/defaultAdmins.js";

dotenv.config();

const admins = DEFAULT_ADMINS;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function upsertAdmin(admin) {
  const email = normalizeEmail(admin.email);
  const existing = await User.findOne({ email });
  const resetPasswords = String(process.env.RESET_ADMIN_PASSWORDS || "") === "true";

  if (!existing) {
    const created = await User.create({
      name: admin.name,
      email,
      password: admin.password,
      role: "admin"
    });
    // eslint-disable-next-line no-console
    console.log(`Created admin: ${created.email}`);
    return;
  }

  existing.name = admin.name || existing.name;
  existing.role = "admin";
  // Do NOT overwrite password by default; otherwise profile updates would be lost.
  // If you want to force-reset seeded admin passwords, run with:
  //   RESET_ADMIN_PASSWORDS=true npm run seed:admin
  if (resetPasswords) existing.password = admin.password; // re-hash via pre-save hook
  await existing.save();
  // eslint-disable-next-line no-console
  console.log(`Updated admin: ${existing.email}`);
}

async function main() {
  await connectDb();
  for (const admin of admins) {
    // eslint-disable-next-line no-await-in-loop
    await upsertAdmin(admin);
  }
  // eslint-disable-next-line no-console
  console.log("Admin seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Admin seeding failed.", err);
  process.exit(1);
});
