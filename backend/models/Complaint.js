import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    department: { type: String, required: true, trim: true, maxlength: 120 },
    priority: { type: String, required: true, enum: ["Low", "Medium", "High"] },
    status: {
      type: String,
      required: true,
      // Keep legacy "Resolved" for backward compatibility.
      enum: ["Pending", "In Progress", "Waiting for User Confirmation", "Resolved"],
      default: "Pending"
    },
    // Optional user identity fields (backward-compatible)
    name: { type: String, default: "", trim: true, maxlength: 120 },
    phoneNumber: { type: String, default: "", trim: true, maxlength: 20 },
    rating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: "", trim: true, maxlength: 5000 },
    isFeedbackGiven: { type: Boolean, default: false },
    location: {
      address: { type: String, default: "" },
      district: { type: String, default: "", trim: true, maxlength: 80 },
      city: { type: String, default: "", trim: true, maxlength: 120 },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    image: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
