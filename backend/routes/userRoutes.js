import express from "express";
import { updateMe } from "../controllers/userController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/me", protect, requireAdmin, updateMe);

export default router;

