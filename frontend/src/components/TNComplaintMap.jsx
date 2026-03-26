// import { useEffect, useMemo, useRef } from "react";
// import { CircleMarker, MapContainer, Marker, Popup, Tooltip } from "react-leaflet";
// import L from "leaflet";

// import "leaflet/dist/leaflet.css";
// import marker2x from "leaflet/dist/images/marker-icon-2x.png";
// import marker1x from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// import "./TNComplaintMap.css";

// import { TAMIL_NADU_DISTRICTS } from "../constants/tamilNaduDistricts.js";
// import { TN_DISTRICT_CENTROIDS } from "../constants/tamilNaduDistrictCentroids.js";

// // Fix default marker icons in Vite.
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: marker2x,
//   iconUrl: marker1x,
//   shadowUrl: markerShadow
// });

// const TN_CENTER = [11.1271, 78.6569];
// const TN_BOUNDS = [
//   [8.0, 76.0],
//   [13.5, 80.5]
// ];

// function districtToLatLng(districtName) {
//   const key = String(districtName || "").trim();
//   const c = TN_DISTRICT_CENTROIDS[key];
//   if (!c) return null;
//   return [c.lat, c.lng];
// }

// /**
//  * TNComplaintMap (Admin)
//  * - Shows Tamil Nadu only (no world basemap tiles)
//  * - Uses district centroids for markers (hardcoded dictionary in `TN_DISTRICT_CENTROIDS`)
//  *
//  * To add more districts:
//  * - Add the district name to `TAMIL_NADU_DISTRICTS`
//  * - Add coordinates to `TN_DISTRICT_CENTROIDS` (lat/lng)
//  */
// export default function TNComplaintMap({ complaints = [] }) {
//   const mapRef = useRef(null);
//   const mapKeyRef = useRef(`tn-complaint-map-${Math.random().toString(36).slice(2)}`);

//   useEffect(() => {
//     return () => {
//       try {
//         mapRef.current?.remove?.();
//       } catch {
//         // ignore
//       } finally {
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   const markers = useMemo(() => {
//     return (complaints || [])
//       .map((c) => {
//         const district = c?.district || c?.location?.district || "";
//         const pos = districtToLatLng(district);
//         if (!pos) return null;
//         return { complaint: c, district: String(district).trim(), pos };
//       })
//       .filter(Boolean);
//   }, [complaints]);

//   const districtDots = useMemo(() => {
//     return (TAMIL_NADU_DISTRICTS || [])
//       .map((d) => {
//         const pos = districtToLatLng(d);
//         if (!pos) return null;
//         return { district: d, pos };
//       })
//       .filter(Boolean);
//   }, []);

//   return (
//     <div className="tncm">
//       <MapContainer
//         // Key helps avoid Leaflet "Map container is already initialized"
//         // when this component is conditionally mounted/unmounted in React.
//         key={mapKeyRef.current}
//         center={TN_CENTER}
//         zoom={7}
//         minZoom={6}
//         maxBounds={TN_BOUNDS}
//         maxBoundsViscosity={1.0}
//         scrollWheelZoom
//         zoomControl
//         attributionControl={false}
//         className="tncm__map"
//         whenCreated={(map) => {
//           mapRef.current = map;
//         }}
//       >
//         {/* No TileLayer on purpose: we avoid any world map basemap. */}

//         {/* District locations (all possible complaint districts) */}
//         {districtDots.map((d) => (
//           <CircleMarker
//             key={d.district}
//             center={d.pos}
//             radius={5}
//             pathOptions={{
//               color: "rgba(11, 92, 171, 0.9)",
//               weight: 1,
//               fillColor: "rgba(11, 92, 171, 0.18)",
//               fillOpacity: 1
//             }}
//           >
//             <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
//               {d.district}
//             </Tooltip>
//           </CircleMarker>
//         ))}

//         {/* Complaint markers (placed by district centroid) */}
//         {markers.map(({ complaint, district, pos }) => (
//           <Marker key={complaint._id} position={pos}>
//             <Popup>
//               <div className="tncm__popupTitle">{complaint?.title || "Complaint"}</div>
//               <div className="tncm__popupRow">
//                 <span className="tncm__k">Department:</span> {complaint?.department || "-"}
//               </div>
//               <div className="tncm__popupRow">
//                 <span className="tncm__k">District:</span> {district || "-"}
//               </div>
//               <div className="tncm__popupRow">
//                 <span className="tncm__k">Status:</span> {complaint?.status || "-"}
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }




import { useMemo } from "react";
import { MapContainer, Marker, Popup, CircleMarker, Tooltip } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { TAMIL_NADU_DISTRICTS } from "../constants/tamilNaduDistricts.js";
import { TN_DISTRICT_CENTROIDS } from "../constants/tamilNaduDistrictCentroids.js";
import "./TNComplaintMap.css";

// Fix default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

const TN_CENTER = [11.1271, 78.6569];
const TN_BOUNDS = [
  [8.0, 76.0],
  [13.5, 80.5],
];

function districtToLatLng(districtName) {
  const c = TN_DISTRICT_CENTROIDS[String(districtName || "").trim()];
  return c ? [c.lat, c.lng] : null;
}

export default function TNComplaintMap({ complaints = [] }) {
  const markers = useMemo(() => {
    return complaints
      .map((c) => {
        const district = c?.district || c?.location?.district || "";
        const pos = districtToLatLng(district);
        if (!pos) return null;
        return { complaint: c, district: district.trim(), pos };
      })
      .filter(Boolean);
  }, [complaints]);

  const districtDots = useMemo(() => {
    return TAMIL_NADU_DISTRICTS.map((d) => {
      const pos = districtToLatLng(d);
      if (!pos) return null;
      return { district: d, pos };
    }).filter(Boolean);
  }, []);

  return (
    <div className="tncm">
      {/* Always use a unique key per mount */}
      <MapContainer
        key="tn-map" // keep a fixed key if mounted once
        center={TN_CENTER}
        zoom={7}
        minZoom={6}
        maxBounds={TN_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        zoomControl
        attributionControl={false}
        className="tncm__map"
      >
        {/* District dots */}
        {districtDots.map((d) => (
          <CircleMarker
            key={d.district}
            center={d.pos}
            radius={6}
            pathOptions={{
              color: "rgba(11, 92, 171, 0.9)",
              weight: 1,
              fillColor: "rgba(11, 92, 171, 0.18)",
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              {d.district}
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Complaint markers */}
        {markers.map(({ complaint, district, pos }) => (
          <Marker key={complaint._id} position={pos}>
            <Popup>
              <div className="tncm__popupTitle">{complaint?.title || "Complaint"}</div>
              <div>
                <strong>Department:</strong> {complaint?.department || "-"}
              </div>
              <div>
                <strong>District:</strong> {district || "-"}
              </div>
              <div>
                <strong>Status:</strong> {complaint?.status || "-"}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}