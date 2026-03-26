import { useEffect, useMemo, useState } from "react";
import "./AdminAnalytics.css";

import InlineAlert from "../components/InlineAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { complaintService } from "../services/complaintService.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const GOV_BLUE = "rgba(11, 92, 171, 0.92)";
const GOV_BLUE_SOFT = "rgba(11, 92, 171, 0.25)";
const GOV_GREY = "rgba(107, 114, 128, 0.85)";
const GOV_LINE = "rgba(229, 231, 235, 0.9)";

function monthKey(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, 1);
  return dt.toLocaleString("en-IN", { month: "short", year: "numeric" });
}

function lastNMonths(n = 12) {
  const out = [];
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

function groupCount(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const k = keyFn(item);
    if (!k) continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const result = await complaintService.listAll();
        if (!cancelled) setComplaints(result.complaints || []);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load analytics data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = complaints.length;

  const deptData = useMemo(() => {
    const map = groupCount(complaints, (c) => String(c?.department || "").trim());
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
    return {
      labels: entries.map(([k]) => k),
      data: entries.map(([, v]) => v)
    };
  }, [complaints]);

  const statusData = useMemo(() => {
    const map = groupCount(complaints, (c) => String(c?.status || ""));
    const pending = map.get("Pending") || 0;
    const inProgress = map.get("In Progress") || 0;
    const waiting = map.get("Waiting for User Confirmation") || 0;
    const resolved = map.get("Resolved") || 0;
    return [pending, inProgress, waiting, resolved];
  }, [complaints]);

  const monthlyTrend = useMemo(() => {
    const keys = lastNMonths(12);
    const map = groupCount(complaints, (c) => (c?.createdAt ? monthKey(c.createdAt) : ""));
    const data = keys.map((k) => map.get(k) || 0);
    return { labels: keys.map(monthLabel), data };
  }, [complaints]);

  if (loading) return <LoadingSpinner label="Loading analytics dashboard..." />;

  return (
    <div className="cad-analytics">
      <div className="cad-analytics__head">
        <div>
          <div className="cad-analytics__title">Analytics Dashboard</div>
          <div className="cad-analytics__sub">Administrative insights across departments and time.</div>
        </div>
      </div>

      {error ? <InlineAlert type="error" title="Analytics error" message={error} /> : null}

      <section className="cad-analytics__stats">
        <div className="cad-analytics__card gov-card">
          <div className="cad-analytics__k">Total complaints</div>
          <div className="cad-analytics__v">{total}</div>
          <div className="cad-analytics__note">All complaints in the system</div>
        </div>
      </section>

      <section className="cad-analytics__grid">
        <div className="cad-analytics__panel gov-card">
          <div className="cad-analytics__panelTitle">Complaints by Department</div>
          <div className="cad-analytics__chart">
            <Bar
              data={{
                labels: deptData.labels,
                datasets: [
                  {
                    label: "Complaints",
                    data: deptData.data,
                    backgroundColor: GOV_BLUE_SOFT,
                    borderColor: GOV_BLUE,
                    borderWidth: 1.5,
                    borderRadius: 10
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: GOV_LINE } },
                  y: { grid: { color: GOV_LINE }, ticks: { precision: 0 } }
                }
              }}
            />
          </div>
        </div>

        <div className="cad-analytics__panel gov-card">
          <div className="cad-analytics__panelTitle">Complaints by Status</div>
          <div className="cad-analytics__chart">
            <Pie
              data={{
                labels: ["Pending", "In Progress", "Waiting for User Confirmation", "Resolved"],
                datasets: [
                  {
                    data: statusData,
                    backgroundColor: [
                      GOV_GREY,
                      "rgba(245, 158, 11, 0.75)",
                      "rgba(59, 130, 246, 0.70)",
                      "rgba(34, 197, 94, 0.75)"
                    ],
                    borderColor: ["rgba(255,255,255,0.95)"],
                    borderWidth: 2
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" }
                }
              }}
            />
          </div>
        </div>

        <div className="cad-analytics__panel gov-card cad-analytics__panel--wide">
          <div className="cad-analytics__panelTitle">Monthly Complaint Trends</div>
          <div className="cad-analytics__chart">
            <Line
              data={{
                labels: monthlyTrend.labels,
                datasets: [
                  {
                    label: "Complaints",
                    data: monthlyTrend.data,
                    borderColor: GOV_BLUE,
                    backgroundColor: GOV_BLUE_SOFT,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: GOV_LINE } },
                  y: { grid: { color: GOV_LINE }, ticks: { precision: 0 } }
                }
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
