import express from "express";
import {
  confirmComplaintCompletion,
  createComplaint,
  deleteComplaint,
  getAllComplaints,
  getMyComplaints,
  submitComplaintFeedback,
  updateComplaintStatus
} from "../controllers/complaintController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

function maybeUploadImage(req, res, next) {
  const contentType = String(req.headers["content-type"] || "");
  if (contentType.includes("multipart/form-data")) {
    return upload.single("image")(req, res, next);
  }
  return next();
}

router.post("/", protect, maybeUploadImage, createComplaint);
router.get("/my", protect, getMyComplaints);
router.get("/", protect, requireAdmin, getAllComplaints);
router.post("/:id/confirm", protect, confirmComplaintCompletion);
router.post("/:id/feedback", protect, submitComplaintFeedback);
router.patch("/:id/status", protect, requireAdmin, updateComplaintStatus);
router.delete("/:id", protect, requireAdmin, deleteComplaint);

export default router;
