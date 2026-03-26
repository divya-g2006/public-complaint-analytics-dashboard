import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import Complaint from "./models/Complaint.js";
import { ensureDefaultAdmins } from "./utils/ensureDefaultAdmins.js";

// 1️⃣ Load environment variables
dotenv.config();

// 2️⃣ Test if env variables are loaded
console.log("MONGODB_URI:", process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
  console.error(
    "Error: MONGODB_URI is not defined in your .env file! Check backend/.env"
  );
  process.exit(1);
}

const app = express();

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = String(clientOrigin)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// 3️⃣ Connect to MongoDB
await connectDb();
try {
  await ensureDefaultAdmins();
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn("Default admin bootstrap skipped/failed:", e?.message || e);
}

// 4️⃣ Middleware
app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // Allow server-to-server / curl (no Origin) and allowlisted browser origins.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

// 5️⃣ Uploads directory
const uploadsDir = path.resolve("uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// 6️⃣ Routes
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);

// 7️⃣ Error handlers
app.use(notFound);
app.use(errorHandler);

// 8️⃣ Start server
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== "production") {
    console.log("Complaint schema has location:", Boolean(Complaint.schema.path("location")));
    console.log("Complaint schema has name:", Boolean(Complaint.schema.path("name")));
    console.log("Complaint schema has phoneNumber:", Boolean(Complaint.schema.path("phoneNumber")));
  }
});
