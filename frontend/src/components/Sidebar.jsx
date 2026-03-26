import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "../context/AuthContext.jsx";

function NavItem({ to, label, onClick }) {
  return (
    <NavLink to={to} className={({ isActive }) => `cad-side__link ${isActive ? "is-active" : ""}`} onClick={onClick}>
      {label}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <>
      <aside className={`cad-side ${open ? "is-open" : ""}`}>
        <div className="cad-side__panel gov-card">
          <div className="cad-side__title">Navigation</div>
          <nav className="cad-side__nav">
            <NavItem to="/dashboard" label="Dashboard" onClick={onClose} />
            <NavItem to="/submit" label="Submit Complaint" onClick={onClose} />
            <NavItem to="/my-complaints" label="My Complaints" onClick={onClose} />
            {isAdmin ? <NavItem to="/admin" label="Admin: All Complaints" onClick={onClose} /> : null}
            {isAdmin ? <NavItem to="/admin/profile" label="Admin: Profile" onClick={onClose} /> : null}
          </nav>
          <div className="cad-side__hint">
            <div className="cad-side__hintTitle">Tip</div>
            <div className="cad-side__hintText">Add clear titles and department names for better analytics.</div>
          </div>
        </div>
      </aside>
      <button type="button" className={`cad-side__backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
    </>
  );
}
