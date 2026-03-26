import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="cad-nf">
      <div className="cad-nf__card gov-card">
        <div className="cad-nf__title">Page not found</div>
        <div className="cad-nf__sub">The requested route does not exist.</div>
        <Link className="cad-btnPrimary cad-nf__btn" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

