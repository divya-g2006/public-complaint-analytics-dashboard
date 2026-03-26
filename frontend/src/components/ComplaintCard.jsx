import "./ComplaintCard.css";
import StatusBadge from "./StatusBadge.jsx";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ComplaintCard({ complaint, apiBaseUrl }) {
  const imageUrl =
    complaint?.image && String(complaint.image).startsWith("/uploads/")
      ? `${apiBaseUrl}${complaint.image}`
      : complaint?.image || "";

  return (
    <article className="cad-complaint gov-card">
      <div className="cad-complaint__top">
        <div className="cad-complaint__title">{complaint.title}</div>
        <StatusBadge status={complaint.status} />
      </div>
      <div className="cad-complaint__meta">
        <div>
          <span className="cad-k">Department:</span> {complaint.department}
        </div>
        {complaint?.location?.address ? (
          <div>
            <span className="cad-k">Location:</span> {complaint.location.address}
          </div>
        ) : null}
        <div>
          <span className="cad-k">Priority:</span> {complaint.priority}
        </div>
        <div>
          <span className="cad-k">Created:</span> {formatDate(complaint.createdAt)}
        </div>
      </div>
      <p className="cad-complaint__desc">{complaint.description}</p>
      {imageUrl ? (
        <div className="cad-complaint__imgWrap">
          <img className="cad-complaint__img" src={imageUrl} alt="Complaint attachment" loading="lazy" />
        </div>
      ) : null}
    </article>
  );
}
