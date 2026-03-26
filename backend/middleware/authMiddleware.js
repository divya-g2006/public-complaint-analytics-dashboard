import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Not authorized, missing token." });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured (JWT_SECRET missing)." });

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not authorized, user not found." });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid." });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Not authorized." });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  next();
}

