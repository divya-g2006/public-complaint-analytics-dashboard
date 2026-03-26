import { useMemo, useState } from "react";
import "./ComplaintConfirmation.css";
import { complaintService } from "../services/complaintService.js";

export default function ComplaintConfirmation({ complaint, onUpdated }) {
  const eligible = useMemo(
    () => complaint?.status === "Waiting for User Confirmation",
    [complaint?.status]
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(confirmed) {
    setBusy(true);
    setError("");
    try {
      const result = await complaintService.confirmCompletion(complaint._id, confirmed);
      onUpdated?.(result.complaint);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit confirmation.");
    } finally {
      setBusy(false);
    }
  }

  if (!eligible) return null;

  return (
    <section className="cad-confirm gov-card" aria-label="Complaint confirmation">
      <div className="cad-confirm__title">Was your issue resolved?</div>
      <div className="cad-confirm__sub">Admin marked this complaint as completed. Please confirm.</div>

      {error ? <div className="cad-confirm__err">{error}</div> : null}

      <div className="cad-confirm__actions">
        <button type="button" className="cad-confirm__btn is-yes" disabled={busy} onClick={() => submit(true)}>
          {busy ? "Submitting..." : "Yes"}
        </button>
        <button type="button" className="cad-confirm__btn is-no" disabled={busy} onClick={() => submit(false)}>
          {busy ? "Submitting..." : "No"}
        </button>
      </div>
    </section>
  );
}

