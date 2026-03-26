import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminComplaintsPage.css";
import InlineAlert from "../components/InlineAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { complaintService } from "../services/complaintService.js";
import FiltersBar from "../components/FiltersBar.jsx";
import { cleanParams } from "../utils/cleanParams.js";
import { TAMIL_NADU_DISTRICTS } from "../constants/tamilNaduDistricts.js";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminComplaintsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [filters, setFilters] = useState({ department: "", district: "", status: "", priority: "" });

  async function load(params) {
    setLoading(true);
    setError("");
    try {
      const result = await complaintService.listAll(params);
      const list = result.complaints || [];
      setComplaints(list);
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("Admin complaints:", list);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => complaints.length, [complaints]);

  async function onChangeStatus(id, status) {
    setBusyId(id);
    setError("");
    try {
      const result = await complaintService.updateStatus(id, status);
      setComplaints((prev) => prev.map((c) => (c._id === id ? result.complaint : c)));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setBusyId("");
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Delete this complaint? This cannot be undone.");
    if (!ok) return;
    setBusyId(id);
    setError("");
    try {
      await complaintService.remove(id);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete complaint.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) return <LoadingSpinner label="Loading all complaints..." />;

  return (
    <div className="cad-page">
      <div className="cad-page__head cad-page__headRow">
        <div>
          <div className="cad-page__title">Admin complaints</div>
          <div className="cad-page__sub">{totals} total complaints across all users and departments.</div>
        </div>
        <div className="cad-adminHeadActions">
          {/* <Link to="/admin/map" className="cad-btnRefresh cad-adminHeadActions__linkAlt">
            View Map
          </Link> */}
          <Link to="/admin/analytics" className="cad-btnPrimary cad-adminHeadActions__link">
            View Analytics Dashboard
          </Link>
          <button type="button" className="cad-btnRefresh" onClick={() => load(cleanParams(filters))}>
            Refresh
          </button>
        </div>
      </div>

      {error ? <InlineAlert type="error" title="Admin error" message={error} /> : null}

      <div className="cad-adminFilters">
        <FiltersBar
          value={filters}
          onChange={setFilters}
          onApply={() => load(cleanParams(filters))}
          onClear={() => {
            const cleared = { department: "", district: "", status: "", priority: "" };
            setFilters(cleared);
            load({});
          }}
          showDistrict
          districtOptions={TAMIL_NADU_DISTRICTS}
        />
      </div>

      <div className="cad-tableWrap gov-card">
        <table className="cad-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Created by</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id}>
                <td className="cad-tdTitle">
                  <div className="cad-tdTitle__t">{c.title}</div>
                  <div className="cad-tdTitle__d">{c.description}</div>
                </td>
                <td>{c.department}</td>
                <td className="cad-tdLoc">
                  {c.location?.address || "Location not provided"}
                </td>
                <td>{c.priority}</td>
                <td>
                  <div className="cad-statusCell">
                    <StatusBadge status={c.status} />
                    <select
                      className="cad-selectSm"
                      value={c.status}
                      disabled={busyId === c._id}
                      onChange={(e) => onChangeStatus(c._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting for User Confirmation">Waiting for User Confirmation</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </td>
                <td className="cad-tdRating">{c?.rating ? `${c.rating}/5` : "No rating"}</td>
                <td className="cad-tdFeedback" title={c?.feedback || ""}>
                  {c?.isFeedbackGiven ? (c?.feedback ? c.feedback : "No feedback") : "No feedback"}
                </td>
                <td className="cad-tdName">{c?.name ? c.name : "N/A"}</td>
                <td className="cad-tdPhone">{c?.phoneNumber ? c.phoneNumber : c?.phone ? c.phone : "N/A"}</td>
                <td>
                  <div className="cad-userCell">
                    <div className="cad-userCell__n">{c.createdBy?.name || "Unknown"}</div>
                    <div className="cad-userCell__e">{c.createdBy?.email || ""}</div>
                  </div>
                </td>
                <td className="cad-nowrap">{formatDate(c.createdAt)}</td>
                <td className="cad-nowrap">
                  <button type="button" className="cad-btnDanger" disabled={busyId === c._id} onClick={() => onDelete(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!complaints.length ? (
              <tr>
                <td colSpan={12} className="cad-emptyCell">
                  No complaints found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
