import "./StatusBadge.css";

function clsFor(status) {
  if (status === "Resolved") return "is-ok";
  if (status === "Waiting for User Confirmation") return "is-warn";
  if (status === "In Progress") return "is-warn";
  return "is-pend";
}

export default function StatusBadge({ status }) {
  const s = String(status || "Pending");
  return <span className={`cad-badge ${clsFor(s)}`}>{s}</span>;
}
