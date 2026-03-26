import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { updateMe } from "../controllers/userController.js";

const router = express.Router();

// Admin profile update endpoint (does not change login API)
// PUT /api/admin/update-profile
router.put("/update-profile", protect, requireAdmin, updateMe);

export default router;

