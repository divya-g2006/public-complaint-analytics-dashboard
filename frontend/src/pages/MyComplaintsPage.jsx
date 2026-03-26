import { useEffect, useState } from "react";
import "./MyComplaintsPage.css";
import InlineAlert from "../components/InlineAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { complaintService } from "../services/complaintService.js";
import ComplaintCard from "../components/ComplaintCard.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import { cleanParams } from "../utils/cleanParams.js";
import ComplaintFeedback from "../components/ComplaintFeedback.jsx";
import ComplaintConfirmation from "../components/ComplaintConfirmation.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function MyComplaintsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ department: "", status: "", priority: "" });

  async function load(params) {
    setLoading(true);
    setError("");
    try {
      const result = await complaintService.listMine(params);
      setComplaints(result.complaints || []);
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

  if (loading) return <LoadingSpinner label="Loading your complaints..." />;

  return (
    <div className="cad-page">
      <div className="cad-page__head cad-page__headRow">
        <div>
          <div className="cad-page__title">My complaints</div>
          <div className="cad-page__sub">Track progress and updates.</div>
        </div>
        <button type="button" className="cad-btnRefresh" onClick={() => load(cleanParams(filters))}>
          Refresh
        </button>
      </div>

      {error ? <InlineAlert type="error" title="Error" message={error} /> : null}

      <div className="cad-listFilters">
        <FiltersBar
          value={filters}
          onChange={setFilters}
          onApply={() => load(cleanParams(filters))}
          onClear={() => {
            const cleared = { department: "", status: "", priority: "" };
            setFilters(cleared);
            load({});
          }}
        />
      </div>

      <div className="cad-list">
        {complaints.map((c) => (
          <div key={c._id} className="cad-listItem">
            <ComplaintCard complaint={c} apiBaseUrl={API_BASE} />
            <ComplaintConfirmation
              complaint={c}
              onUpdated={(updated) => setComplaints((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))}
            />
            <ComplaintFeedback
              complaint={c}
              onUpdated={(updated) => setComplaints((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))}
            />
          </div>
        ))}
        {!complaints.length ? <div className="cad-empty gov-card">No complaints found.</div> : null}
      </div>
    </div>
  );
}
