import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="cad-navbar">
      <div className="cad-navbar__left">
        <button type="button" className="cad-navbar__burger" onClick={onToggleSidebar} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
        <Link className="cad-navbar__brand" to="/dashboard">
          Complaint Analytics Dashboard
        </Link>
      </div>

      <div className="cad-navbar__right">
        {user ? (
          <>
            <Link className="cad-btn cad-btn--ghost cad-btn--home" to="/">
              Home
            </Link>
            <div className="cad-navbar__user">
              <div className="cad-navbar__name">{user.name}</div>
              <div className="cad-navbar__role">{String(user.role || "user").toUpperCase()}</div>
            </div>
            <button
              type="button"
              className="cad-btn cad-btn--ghost"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link className="cad-btn cad-btn--primary" to="/login">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
