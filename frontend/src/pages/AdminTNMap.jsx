import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import tnDistricts from "../data/tn-districts.json";
import "./Map.css";

import InlineAlert from "../components/InlineAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { complaintService } from "../services/complaintService.js";
import { TN_DISTRICT_CENTROIDS } from "../constants/tamilNaduDistrictCentroids.js";

// Fix default marker icons in Vite (Leaflet expects these to be served as files).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow
});

const TN_CENTER = [11.1271, 78.6569];
const TN_BOUNDS = [
  [8.0, 76.0],
  [13.5, 80.5]
];

function districtToLatLng(districtName) {
  const key = String(districtName || "").trim();
  const c = TN_DISTRICT_CENTROIDS[key];
  if (!c) return null;
  return [c.lat, c.lng];
}

function getMarkerPos(complaint) {
  const lat = Number(complaint?.location?.lat);
  const lng = Number(complaint?.location?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  // Fallback: place marker at the district centroid if GPS is missing.
  return districtToLatLng(complaint?.location?.district || complaint?.district || "");
}

/**
 * AdminTNMap (StrictMode-safe)
 *
 * Why the "already initialized" error happens:
 * - In React 18 StrictMode (dev), components can mount/unmount/mount to detect side-effects.
 * - Leaflet will throw if it tries to initialize a map twice on the same DOM container.
 *
 * Fix:
 * - Delay rendering of <MapContainer> until after the first mount effect runs (`ready` flag).
 *   This prevents Leaflet from initializing during the StrictMode "test" mount.
 * - Also provide a stable per-mount unique `key` for MapContainer.
 */
export default function AdminTNMap() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);

  // StrictMode-safe: MapContainer is rendered only after the "real" mount.
  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        // Admin API (protected): GET /api/complaints
        const result = await complaintService.listAll();
        if (!cancelled) setComplaints(result.complaints || []);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load map data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mapKey = useMemo(() => `tn-admin-map-${Math.random().toString(36).slice(2)}`, []);

  const markers = useMemo(() => {
    return (complaints || [])
      .map((c) => {
        const pos = getMarkerPos(c);
        if (!pos) return null;
        const district = String(c?.location?.district || c?.district || "").trim();
        return { complaint: c, pos, district };
      })
      .filter(Boolean);
  }, [complaints]);

  if (!ready) return null;
  if (loading) return <LoadingSpinner label="Loading Tamil Nadu map..." />;

  return (
    <div className="cad-tnmap">
      <div className="cad-tnmap__head">
        <div className="cad-tnmap__title">Tamil Nadu Complaint Map</div>
        <div className="cad-tnmap__sub">
          Markers show each complaint (GPS if available, otherwise district centroid). Map is restricted to Tamil Nadu.
        </div>
      </div>

      {error ? <InlineAlert type="error" title="Map error" message={error} /> : null}

      <div className="cad-tnmap__wrap gov-card">
        <MapContainer
          key={mapKey}
          center={TN_CENTER}
          zoom={7}
          minZoom={6}
          maxBounds={TN_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          zoomControl
          attributionControl={false}
          className="cad-tnmap__leaflet"
        >
          <TileLayer
            // OpenStreetMap tiles
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Tamil Nadu district boundaries (GeoJSON) */}
          <GeoJSON
            data={tnDistricts}
            style={() => ({
              color: "rgba(11, 92, 171, 0.85)",
              weight: 1.6,
              fillColor: "rgba(11, 92, 171, 0.06)",
              fillOpacity: 0.35
            })}
          />

          {/* Complaint markers */}
          {markers.map(({ complaint, pos, district }) => (
            <Marker key={complaint._id} position={pos}>
              <Popup>
                <div className="cad-tnmap__popupTitle">{complaint?.title || "Complaint"}</div>
                <div className="cad-tnmap__popupRow">
                  <span className="cad-k">Status:</span> {complaint?.status || "-"}
                </div>
                <div className="cad-tnmap__popupRow">
                  <span className="cad-k">District:</span> {district || "Unknown"}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

