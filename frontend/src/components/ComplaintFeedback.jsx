import { useMemo, useState } from "react";
import "./ComplaintFeedback.css";
import { complaintService } from "../services/complaintService.js";

export default function ComplaintFeedback({ complaint, onUpdated }) {
  const eligible = useMemo(
    () => complaint?.status === "Resolved" && !complaint?.isFeedbackGiven,
    [complaint?.status, complaint?.isFeedbackGiven]
  );
  const showSubmitted = useMemo(() => complaint?.isFeedbackGiven, [complaint?.isFeedbackGiven]);

  const [rating, setRating] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    setBusy(true);
    try {
      const result = await complaintService.submitFeedback(complaint._id, ratingNum, feedback);
      onUpdated?.(result.complaint);
      setSuccess("Thanks. Your feedback has been submitted.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setBusy(false);
    }
  }

  if (!eligible && !showSubmitted) return null;

  return (
    <section className="cad-feedback gov-card" aria-label="Complaint feedback">
      <div className="cad-feedback__head">
        <div className="cad-feedback__title">Resolution feedback</div>
        <div className="cad-feedback__meta">Complaint ID: {complaint?._id}</div>
      </div>

      {eligible ? (
        <form className="cad-feedback__form" onSubmit={onSubmit}>
          <label className="cad-feedback__label">
            Rating (required)
            <select
              className="cad-feedback__select"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              disabled={busy}
              required
            >
              <option value="">-- Select --</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>

          <label className="cad-feedback__label">
            Feedback (optional)
            <textarea
              className="cad-feedback__textarea"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={busy}
              rows={3}
              placeholder="Write a short note about the resolution..."
            />
          </label>

          {error ? <div className="cad-feedback__msg cad-feedback__msg--error">{error}</div> : null}
          {success ? <div className="cad-feedback__msg cad-feedback__msg--success">{success}</div> : null}

          <div className="cad-feedback__actions">
            <button type="submit" className="cad-feedback__btn" disabled={busy}>
              {busy ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      ) : (
        <div className="cad-feedback__submitted">
          <div>
            <span className="cad-feedback__k">Rating:</span> {complaint?.rating ? `${complaint.rating}/5` : "Not provided"}
          </div>
          <div className="cad-feedback__submittedText">
            <span className="cad-feedback__k">Feedback:</span>{" "}
            {complaint?.feedback ? complaint.feedback : "No feedback"}
          </div>
        </div>
      )}
    </section>
  );
}
