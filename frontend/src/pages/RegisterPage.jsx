import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthBase.css";
import "./RegisterPage.css";
import { useAuth } from "../context/AuthContext.jsx";
import InlineAlert from "../components/InlineAlert.jsx";
import { homeRouteForRole } from "../utils/homeRoute.js";

export default function RegisterPage() {
  const { register, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated && user) navigate(homeRouteForRole(user.role), { replace: true });
  }, [loading, isAuthenticated, user, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await register({ name: name.trim(), email: email.trim(), password, role: "user" });
      navigate(homeRouteForRole(u.role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cad-auth">
      <div className="cad-auth__card gov-card">
        <div className="cad-auth__header">
          <div className="cad-auth__title">Create account</div>
          <div className="cad-auth__subtitle">Register to submit and track complaints.</div>
        </div>

        {error ? <InlineAlert type="error" title="Registration error" message={error} /> : null}

        <form className="cad-form" onSubmit={onSubmit}>
          <label className="cad-field">
            <div className="cad-field__label">Full name</div>
            <input
              className="cad-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={120}
            />
          </label>

          <label className="cad-field">
            <div className="cad-field__label">Email</div>
            <input
              className="cad-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="cad-field">
            <div className="cad-field__label">Password</div>
            <input
              className="cad-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </label>

       

          <button className="cad-btnPrimary" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="cad-auth__footer">Already have an account? <Link to="/login">Login</Link></div>
      </div>
    </div>
  );
}
