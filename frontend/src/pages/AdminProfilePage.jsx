import { useEffect, useMemo, useState } from "react";
import "./AdminProfilePage.css";

import InlineAlert from "../components/InlineAlert.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { adminService } from "../services/adminService.js";

function isValidEmail(email) {
  // Simple, safe check (backend also enforces non-empty + uniqueness)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function AdminProfilePage() {
  const { user } = useAuth();
  const currentEmail = String(user?.email || "");

  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setEmail(String(user?.email || ""));
  }, [user?.email]);

  const canSubmit = useMemo(() => !submitting, [submitting]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailClean = String(email || "").trim();
    const pwd = String(password || "");
    const conf = String(confirmPassword || "");

    if (emailClean && !isValidEmail(emailClean)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (pwd) {
      if (pwd.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (pwd !== conf) {
        setError("Password and Confirm Password must match.");
        return;
      }
    }

    const payload = {};
    // If email is empty, do not send it (keeps current email)
    if (emailClean) payload.email = emailClean;
    // If password is empty, do not send it (updates only email)
    if (pwd) payload.password = pwd;

    if (!payload.email && !payload.password) {
      setError("Nothing to update.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await adminService.updateProfile(payload);
      setSuccess("Profile updated successfully.");
      if (result?.user?.email) setEmail(result.user.email);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cad-page">
      <div className="cad-page__head">
        <div className="cad-page__title">Admin Profile</div>
        <div className="cad-page__sub">Update your admin email and password.</div>
      </div>

      <div className="cad-profile gov-card">
        {error ? <InlineAlert type="error" title="Update error" message={error} /> : null}
        {success ? <InlineAlert type="success" title="Updated" message={success} /> : null}

        <form className="cad-profile__form" onSubmit={onSubmit}>
          <label className="cad-field">
            <div className="cad-field__label">Email</div>
            <input
              className="cad-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
            <div className="cad-profile__hint">Current email is pre-filled. Leave empty to keep unchanged.</div>
          </label>

          <div className="cad-profile__row">
            <label className="cad-field">
              <div className="cad-field__label">Password</div>
              <input
                className="cad-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                minLength={6}
              />
            </label>

            <label className="cad-field">
              <div className="cad-field__label">Confirm Password</div>
              <input
                className="cad-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                minLength={6}
              />
            </label>
          </div>

          <div className="cad-profile__note">
            If you leave Password empty, only your email will be updated. Your password is never shown.
          </div>

          <div className="cad-profile__actions">
            <button className="cad-btnPrimary" type="submit" disabled={!canSubmit}>
              {submitting ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

