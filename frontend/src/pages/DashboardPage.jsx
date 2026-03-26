import { useEffect, useMemo, useState } from "react";
import "./DashboardPage.css";
import { complaintService } from "../services/complaintService.js";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import InlineAlert from "../components/InlineAlert.jsx";
import ComplaintCard from "../components/ComplaintCard.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import { cleanParams } from "../utils/cleanParams.js";

const API_BASE = import.meta.env.VITE_API_URL || "";

function countBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const k = String(item?.[key] || "Unknown");
    map.set(k, (map.get(k) || 0) + 1);
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ department: "", status: "", priority: "" });

  async function load(params) {
    setLoading(true);
    setError("");
    try {
      const result = isAdmin ? await complaintService.listAll(params) : await complaintService.listMine(params);
      setComplaints(result.complaints || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const statusCounts = useMemo(() => countBy(complaints, "status"), [complaints]);
  const deptCounts = useMemo(() => countBy(complaints, "department").slice(0, 6), [complaints]);
  const priorityCounts = useMemo(() => countBy(complaints, "priority"), [complaints]);

  const total = complaints.length;
  const resolved = statusCounts.find(([k]) => k === "Resolved")?.[1] || 0;
  const pending = statusCounts.find(([k]) => k === "Pending")?.[1] || 0;
  const inProgress = statusCounts.find(([k]) => k === "In Progress")?.[1] || 0;

  if (loading) return <LoadingSpinner label="Loading analytics..." />;

  return (
    <div className="cad-dash">
      <div className="cad-dash__head">
        <div>
          <div className="cad-dash__title">Overview</div>
          <div className="cad-dash__sub">
            {isAdmin ? "All departments" : "Your complaints"} updated in real time from the system of record.
          </div>
        </div>
      </div>

      {error ? <InlineAlert type="error" title="Dashboard error" message={error} /> : null}

      <div className="cad-dash__filters">
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

      <section className="cad-dash__grid">
        <div className="cad-stat gov-card">
          <div className="cad-stat__k">Total</div>
          <div className="cad-stat__v">{total}</div>
          <div className="cad-stat__note">All tracked complaints</div>
        </div>
        <div className="cad-stat gov-card">
          <div className="cad-stat__k">Pending</div>
          <div className="cad-stat__v">{pending}</div>
          <div className="cad-stat__note">Awaiting action</div>
        </div>
        <div className="cad-stat gov-card">
          <div className="cad-stat__k">In Progress</div>
          <div className="cad-stat__v">{inProgress}</div>
          <div className="cad-stat__note">Being handled</div>
        </div>
        <div className="cad-stat gov-card">
          <div className="cad-stat__k">Resolved</div>
          <div className="cad-stat__v">{resolved}</div>
          <div className="cad-stat__note">Resolved</div>
        </div>
      </section>

      <section className="cad-panels">
        <div className="cad-panel gov-card">
          <div className="cad-panel__title">By status</div>
          <div className="cad-bars">
            {statusCounts.map(([label, value]) => (
              <div key={label} className="cad-bar">
                <div className="cad-bar__top">
                  <div className="cad-bar__label">{label}</div>
                  <div className="cad-bar__value">{value}</div>
                </div>
                <div className="cad-bar__track">
                  <div className="cad-bar__fill" style={{ width: `${total ? Math.round((value / total) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cad-panel gov-card">
          <div className="cad-panel__title">Top departments</div>
          <div className="cad-bars">
            {deptCounts.length ? (
              deptCounts.map(([label, value]) => (
                <div key={label} className="cad-bar">
                  <div className="cad-bar__top">
                    <div className="cad-bar__label">{label}</div>
                    <div className="cad-bar__value">{value}</div>
                  </div>
                  <div className="cad-bar__track">
                    <div
                      className="cad-bar__fill"
                      style={{ width: `${total ? Math.round((value / total) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="cad-empty">No department data yet.</div>
            )}
          </div>
        </div>

        <div className="cad-panel gov-card">
          <div className="cad-panel__title">By priority</div>
          <div className="cad-bars">
            {priorityCounts.map(([label, value]) => (
              <div key={label} className="cad-bar">
                <div className="cad-bar__top">
                  <div className="cad-bar__label">{label}</div>
                  <div className="cad-bar__value">{value}</div>
                </div>
                <div className="cad-bar__track">
                  <div
                    className="cad-bar__fill"
                    style={{ width: `${total ? Math.round((value / total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cad-recent">
        <div className="cad-recent__title">Recent complaints</div>
        <div className="cad-recent__list">
          {complaints.slice(0, 4).map((c) => (
            <ComplaintCard key={c._id} complaint={c} apiBaseUrl={API_BASE} />
          ))}
          {!complaints.length ? <div className="cad-empty gov-card">No complaints yet. Submit one to start tracking.</div> : null}
        </div>
      </section>
    </div>
  );
}
