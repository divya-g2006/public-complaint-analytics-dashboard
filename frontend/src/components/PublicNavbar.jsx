import { Link } from "react-router-dom";
import "./PublicNavbar.css";
import { useAuth } from "../context/AuthContext.jsx";
import { homeRouteForRole } from "../utils/homeRoute.js";

export default function PublicNavbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="pubnav">
      <div className="pubnav__inner">
        <Link className="pubnav__brand" to="/">
          PCMS TN
        </Link>

        <nav className="pubnav__links">
          <Link className="pubnav__link" to="/">
            Home
          </Link>

          {!isAuthenticated ? (
            <>
              <Link className="pubnav__link" to="/login">
                Login
              </Link>
              <Link className="pubnav__btn" to="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link className="pubnav__btn" to={homeRouteForRole(user?.role)}>
                {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button type="button" className="pubnav__ghost" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

