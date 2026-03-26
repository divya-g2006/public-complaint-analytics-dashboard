// import { useEffect, useMemo, useRef, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// import "./AdminMap.css";

// import InlineAlert from "../components/InlineAlert.jsx";
// import LoadingSpinner from "../components/LoadingSpinner.jsx";
// import FiltersBar from "../components/FiltersBar.jsx";
// import { cleanParams } from "../utils/cleanParams.js";
// import { complaintService } from "../services/complaintService.js";
// import { TAMIL_NADU_DISTRICTS } from "../constants/tamilNaduDistricts.js";
// import { TN_DISTRICT_CENTROIDS } from "../constants/tamilNaduDistrictCentroids.js";

// const TN_CENTER = { lat: 11.1271, lng: 78.6569 };
// // Rough bounding box for Tamil Nadu to prevent panning/zooming out to the world map.
// const TN_BOUNDS = {
//   southWest: { lat: 8.0, lng: 76.0 },
//   northEast: { lat: 13.7, lng: 80.6 }
// };

// // Rough outline of Tamil Nadu (approx) so we can render a TN-only view without world tiles.
// const TN_OUTLINE = [
//   [13.4, 80.35],
//   [13.0, 80.2],
//   [12.6, 80.05],
//   [12.1, 80.1],
//   [11.6, 79.95],
//   [11.2, 79.85],
//   [10.8, 79.75],
//   [10.4, 79.9],
//   [10.0, 79.85],
//   [9.65, 79.6],
//   [9.2, 79.25],
//   [8.95, 78.95],
//   [8.7, 78.2],
//   [8.3, 77.6],
//   [8.15, 77.25],
//   [8.25, 76.95],
//   [8.7, 76.75],
//   [9.2, 76.9],
//   [9.85, 77.1],
//   [10.5, 77.25],
//   [11.1, 77.2],
//   [11.8, 77.35],
//   [12.35, 77.6],
//   [12.85, 78.05],
//   [13.25, 78.55],
//   [13.45, 79.35],
//   [13.4, 80.35]
// ];

// function formatDate(iso) {
//   try {
//     return new Date(iso).toLocaleString();
//   } catch {
//     return iso;
//   }
// }

// function escapeHtml(str) {
//   return String(str || "")
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// }

// export default function AdminMap() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [complaints, setComplaints] = useState([]);
//   const [filters, setFilters] = useState({ department: "", district: "", status: "", priority: "" });
//   const mapRef = useRef(null);
//   const mapElRef = useRef(null);
//   const highlightsLayerRef = useRef(null);

//   async function load(params) {
//     setLoading(true);
//     setError("");
//     try {
//       const result = await complaintService.listAll(params);
//       setComplaints(result.complaints || []);
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to load map data.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load({});
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const districtCounts = useMemo(() => {
//     const map = new Map();
//     for (const c of complaints || []) {
//       const d = String(c?.location?.district || "").trim();
//       if (!d) continue;
//       map.set(d, (map.get(d) || 0) + 1);
//     }
//     return map;
//   }, [complaints]);

//   // Init map once
//   useEffect(() => {
//     if (!mapElRef.current || mapRef.current) return;

//     const bounds = L.latLngBounds(
//       [TN_BOUNDS.southWest.lat, TN_BOUNDS.southWest.lng],
//       [TN_BOUNDS.northEast.lat, TN_BOUNDS.northEast.lng]
//     );

//     const map = L.map(mapElRef.current, {
//       zoomControl: true,
//       maxBounds: bounds,
//       maxBoundsViscosity: 1.0,
//       minZoom: 7,
//       maxZoom: 13
//     });

//     map.fitBounds(bounds, { padding: [18, 18] });

//     // TN-only visualization: no world basemap tiles. We render an outline + district highlights.
//     L.rectangle(bounds, {
//       color: "rgba(229, 231, 235, 0.95)",
//       weight: 1,
//       fillColor: "rgba(247, 249, 252, 1)",
//       fillOpacity: 1
//     }).addTo(map);

//     L.polyline(TN_OUTLINE, {
//       color: "rgba(11, 31, 51, 0.55)",
//       weight: 2.5
//     }).addTo(map);

//     const highlightsLayer = L.layerGroup().addTo(map);

//     mapRef.current = map;
//     highlightsLayerRef.current = highlightsLayer;

//     // Fix initial size when rendered inside flex/grid
//     setTimeout(() => map.invalidateSize(), 0);
//   }, []);

//   // Highlight only Tamil Nadu districts that have complaints.
//   useEffect(() => {
//     const map = mapRef.current;
//     const highlightsLayer = highlightsLayerRef.current;
//     if (!map || !highlightsLayer) return;
//     highlightsLayer.clearLayers();

//     for (const [district, count] of districtCounts.entries()) {
//       const centroid = TN_DISTRICT_CENTROIDS[district];
//       if (!centroid) continue;
//       const radius = Math.min(45000, 14000 + count * 2500);
//       const circle = L.circle([centroid.lat, centroid.lng], {
//         radius,
//         color: "rgba(11, 92, 171, 0.70)",
//         weight: 2.2,
//         fillColor: "rgba(11, 92, 171, 0.14)",
//         fillOpacity: 1
//       }).bindPopup(`<b>${escapeHtml(district)}</b><br/>${count} complaints`);
//       circle.addTo(highlightsLayer);

//       // District label
//       const label = L.marker([centroid.lat, centroid.lng], {
//         interactive: false,
//         icon: L.divIcon({
//           className: "tn-district-label",
//           html: `<div class="tn-district-label__inner">${escapeHtml(district)}<span class="tn-district-label__count">${count}</span></div>`
//         })
//       });
//       label.addTo(highlightsLayer);
//     }
//   }, [districtCounts]);

//   return (
//     <div className="cad-map">
//       <div className="cad-map__head cad-page__headRow">
//         <div>
//           <div className="cad-page__title">Tamil Nadu Complaint Map</div>
//           <div className="cad-page__sub">
//             {complaints.length} complaints. Districts with complaints are highlighted (approx).
//           </div>
//         </div>
//         <button type="button" className="cad-btnRefresh" onClick={() => load(cleanParams(filters))}>
//           Refresh
//         </button>
//       </div>

//       {error ? <InlineAlert type="error" title="Map error" message={error} /> : null}

//       {loading ? <LoadingSpinner label="Loading Tamil Nadu map..." /> : null}

//       <div className="cad-map__controls">
//         <FiltersBar
//           value={filters}
//           onChange={setFilters}
//           onApply={() => load(cleanParams(filters))}
//           onClear={() => {
//             const cleared = { department: "", district: "", status: "", priority: "" };
//             setFilters(cleared);
//             load({});
//           }}
//           showDistrict
//           districtOptions={TAMIL_NADU_DISTRICTS}
//         />

//         <div className="cad-map__toggles gov-card">
//           <div className="cad-map__togTitle">Display</div>
//           <div className="cad-map__legend">
//             <div className="cad-map__legendItem">
//               <span className="cad-dot is-hi" /> Highlighted district
//             </div>
//             <div className="cad-map__legendNote">Circle size increases with complaint count.</div>
//           </div>
//         </div>
//       </div>

//       <div className="cad-map__wrap gov-card">
//         <div ref={mapElRef} className="cad-map__leaflet" />
//       </div>
//     </div>
//   );
// }





import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./AdminMap.css";

import InlineAlert from "../components/InlineAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import FiltersBar from "../components/FiltersBar.jsx";
import { cleanParams } from "../utils/cleanParams.js";
import { complaintService } from "../services/complaintService.js";
import { TAMIL_NADU_DISTRICTS } from "../constants/tamilNaduDistricts.js";
import { TN_DISTRICT_CENTROIDS } from "../constants/tamilNaduDistrictCentroids.js";

const TN_BOUNDS = {
  southWest: { lat: 8.0, lng: 76.0 },
  northEast: { lat: 13.7, lng: 80.6 }
};

const TN_OUTLINE = [
  [13.4,80.35],[13.0,80.2],[12.6,80.05],[12.1,80.1],
  [11.6,79.95],[11.2,79.85],[10.8,79.75],[10.4,79.9],
  [10.0,79.85],[9.65,79.6],[9.2,79.25],[8.95,78.95],
  [8.7,78.2],[8.3,77.6],[8.15,77.25],[8.25,76.95],
  [8.7,76.75],[9.2,76.9],[9.85,77.1],[10.5,77.25],
  [11.1,77.2],[11.8,77.35],[12.35,77.6],[12.85,78.05],
  [13.25,78.55],[13.45,79.35],[13.4,80.35]
];

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function AdminMap() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    district: "",
    status: "",
    priority: ""
  });

  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const highlightsLayerRef = useRef(null);

  // ✅ FIX 2: prevent duplicate API calls
  const hasLoadedRef = useRef(false);

  async function load(params) {
    setLoading(true);
    setError("");
    try {
      const result = await complaintService.listAll(params);
      setComplaints(result.complaints || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load map data.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ FIX 2 applied here
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    load({});
  }, []);

  const districtCounts = useMemo(() => {
    const map = new Map();
    for (const c of complaints || []) {
      const d = String(c?.location?.district || "").trim();
      if (!d) continue;
      map.set(d, (map.get(d) || 0) + 1);
    }
    return map;
  }, [complaints]);

  // ✅ FIX 1: Leaflet map safe initialization
  useEffect(() => {
    if (!mapElRef.current) return;

    // remove old map (React 18 Strict Mode fix)
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const bounds = L.latLngBounds(
      [TN_BOUNDS.southWest.lat, TN_BOUNDS.southWest.lng],
      [TN_BOUNDS.northEast.lat, TN_BOUNDS.northEast.lng]
    );

    const map = L.map(mapElRef.current, {
      zoomControl: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      minZoom: 7,
      maxZoom: 13
    });

    map.fitBounds(bounds, { padding: [18, 18] });

    L.rectangle(bounds, {
      color: "rgba(229,231,235,0.95)",
      weight: 1,
      fillColor: "rgba(247,249,252,1)",
      fillOpacity: 1
    }).addTo(map);

    L.polyline(TN_OUTLINE, {
      color: "rgba(11,31,51,0.55)",
      weight: 2.5
    }).addTo(map);

    const highlightsLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    highlightsLayerRef.current = highlightsLayer;

    setTimeout(() => map.invalidateSize(), 0);

    // cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Highlight districts
  useEffect(() => {
    const highlightsLayer = highlightsLayerRef.current;
    if (!highlightsLayer) return;

    highlightsLayer.clearLayers();

    for (const [district, count] of districtCounts.entries()) {
      const centroid = TN_DISTRICT_CENTROIDS[district];
      if (!centroid) continue;

      const radius = Math.min(45000, 14000 + count * 2500);

      const circle = L.circle([centroid.lat, centroid.lng], {
        radius,
        color: "rgba(11,92,171,0.7)",
        weight: 2.2,
        fillColor: "rgba(11,92,171,0.14)",
        fillOpacity: 1
      }).bindPopup(`<b>${escapeHtml(district)}</b><br/>${count} complaints`);

      circle.addTo(highlightsLayer);

      const label = L.marker([centroid.lat, centroid.lng], {
        interactive: false,
        icon: L.divIcon({
          className: "tn-district-label",
          html: `<div class="tn-district-label__inner">${escapeHtml(district)}<span class="tn-district-label__count">${count}</span></div>`
        })
      });

      label.addTo(highlightsLayer);
    }
  }, [districtCounts]);

  return (
    <div className="cad-map">
      <div className="cad-map__head cad-page__headRow">
        <div>
          <div className="cad-page__title">Tamil Nadu Complaint Map</div>
          <div className="cad-page__sub">
            {complaints.length} complaints
          </div>
        </div>

        <button
          className="cad-btnRefresh"
          onClick={() => load(cleanParams(filters))}
        >
          Refresh
        </button>
      </div>

      {error && <InlineAlert type="error" title="Map error" message={error} />}
      {loading && <LoadingSpinner label="Loading map..." />}

      <div className="cad-map__controls">
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

      <div className="cad-map__wrap gov-card">
        <div ref={mapElRef} className="cad-map__leaflet" />
      </div>
    </div>
  );
}