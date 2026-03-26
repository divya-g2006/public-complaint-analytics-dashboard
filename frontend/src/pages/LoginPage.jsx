import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthBase.css";
import "./LoginPage.css";
import { useAuth } from "../context/AuthContext.jsx";
import InlineAlert from "../components/InlineAlert.jsx";
import { homeRouteForRole } from "../utils/homeRoute.js";

export default function LoginPage() {
  const { login, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
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
      const u = await login(email.trim(), password);
      navigate(homeRouteForRole(u.role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cad-auth">
      <div className="cad-auth__card gov-card">
        <div className="cad-auth__header">
          <div className="cad-auth__title">Sign in</div>
          <div className="cad-auth__subtitle">Use your registered email to access the dashboard.</div>
        </div>

        {error ? <InlineAlert type="error" title="Authentication error" message={error} /> : null}

        <form className="cad-form" onSubmit={onSubmit}>
          <label className="cad-field">
            <div className="cad-field__label">Email</div>
            <input
              className="cad-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
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
              placeholder="Your password"
              autoComplete="current-password"
              required
              minLength={6}
            />
          </label>

          <button className="cad-btnPrimary" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="cad-auth__footer">New user? <Link to="/register">Create an account</Link></div>
      </div>
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "./AuthBase.css";
// import "./LoginPage.css";
// import { useAuth } from "../context/AuthContext.jsx";
// import InlineAlert from "../components/InlineAlert.jsx";
// import { homeRouteForRole } from "../utils/homeRoute.js";

// export default function LoginPage() {
//   const { login, isAuthenticated, loading, user } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!loading && isAuthenticated && user) {
//       navigate(homeRouteForRole(user.role), { replace: true });
//     }
//   }, [loading, isAuthenticated, user, navigate]);

//   async function onSubmit(e) {
//     e.preventDefault();

//     // 🔥 Clear old tokens before login to prevent 403
//     localStorage.removeItem("token");
//     localStorage.removeItem("cad_token");

//     setError("");
//     setSubmitting(true);
//     try {
//       const u = await login(email.trim(), password);
//       navigate(homeRouteForRole(u.role), { replace: true });
//     } catch (err) {
//       setError(err?.response?.data?.message || "Login failed.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="cad-auth">
//       <div className="cad-auth__card gov-card">
//         <div className="cad-auth__header">
//           <div className="cad-auth__title">Sign in</div>
//           <div className="cad-auth__subtitle">
//             Use your registered email to access the dashboard.
//           </div>
//         </div>

//         {error && (
//           <InlineAlert type="error" title="Authentication error" message={error} />
//         )}

//         <form className="cad-form" onSubmit={onSubmit}>
//           <label className="cad-field">
//             <div className="cad-field__label">Email</div>
//             <input
//               className="cad-input"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="name@example.com"
//               autoComplete="email"
//               required
//             />
//           </label>

//           <label className="cad-field">
//             <div className="cad-field__label">Password</div>
//             <input
//               className="cad-input"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Your password"
//               autoComplete="current-password"
//               required
//               minLength={6}
//             />
//           </label>

//           <button className="cad-btnPrimary" type="submit" disabled={submitting}>
//             {submitting ? "Signing in..." : "Login"}
//           </button>
//         </form>

//         <div className="cad-auth__footer">
//           New user? <Link to="/register">Create an account</Link>
//         </div>
//       </div>
//     </div>
//   );
// }