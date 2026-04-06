import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents
} from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// 🔧 FIX ICONOS
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// 🔥 ICONOS
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const selectedIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const reportIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// 🧠 PANES
function SetupPanes() {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane("heatPane")) {
      map.createPane("heatPane").style.zIndex = 200;
    }

    if (!map.getPane("markerPaneCustom")) {
      map.createPane("markerPaneCustom").style.zIndex = 500;
    }
  }, [map]);

  return null;
}

// 📊 BOUNDS
function MapBounds({ onBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    let lastBounds = null;

    const update = () => {
      const bounds = map.getBounds();

      if (!lastBounds || !lastBounds.equals(bounds)) {
        lastBounds = bounds;
        onBoundsChange && onBoundsChange(bounds);
      }
    };

    map.on("moveend", update);

    return () => map.off("moveend", update);
  }, [map, onBoundsChange]);

  return null;
}

// 📍 CLICK MAPA
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick && onMapClick(e.latlng);
    },
  });
  return null;
}

// 🔥 HEATMAP
function Heatmap({ reports }) {
  const map = useMap();

  useEffect(() => {
    if (!map || reports.length === 0) return;

    let heatLayer;

    const create = () => {
      const pane = map.getPane("heatPane");
      if (!pane) return;

      const zoom = map.getZoom();
      if (zoom > 15) return;

      const points = reports.map(r => [
        r.lat,
        r.lng,
        r.confidence === "Verificado" ? 1 :
        r.confidence === "Reporte ciudadano" ? 0.5 : 0.2
      ]);

      heatLayer = L.heatLayer(points, {
        pane: "heatPane",
        radius: 30,
        blur: 30,
        minOpacity: 0.08,
        gradient: {
          0.1: "#60a5fa",
          0.3: "#34d399",
          0.6: "#facc15",
          0.85: "#fb923c",
          1.0: "#dc2626",
        }
      });

      heatLayer.addTo(map);
    };

    const t = setTimeout(create, 200);

    return () => {
      clearTimeout(t);
      if (heatLayer) map.removeLayer(heatLayer);
    };

  }, [reports, map]);

  return null;
}

// 📍 MARKERS
function MarkersLayer({ reports }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const update = () => setZoom(map.getZoom());
    map.on("zoomend", update);
    return () => map.off("zoomend", update);
  }, [map]);

  const recent = reports.slice(-20);

  let base = [];
  if (zoom < 10) base = reports.slice(0, 30);
  else if (zoom < 13) base = reports.slice(0, 100);
  else base = reports.slice(0, 300);

  const visible = [...new Set([...recent, ...base])];

  return (
    <>
      {visible.map((r, i) => (
        <Marker
          key={i}
          position={[r.lat, r.lng]}
          icon={customIcon}
          pane="markerPaneCustom"
        >
          <Popup>
            <div style={{
              fontSize: "13px",
              borderLeft: "4px solid #ef4444",
              paddingLeft: "6px"
            }}>
              <strong>{r.type || "Incidente"}</strong>
              <br />
              🕒 {r.timeOfDay || "Sin horario"}
              <br />
              {r.confidence === "Verificado" && "🟢 Verificado"}
              {r.confidence === "Reporte ciudadano" && "🟠 Ciudadano"}
              {r.confidence === "Estimado" && "🟡 Estimado"}
              <br />
              📅 {r.incidentDate
                ? new Date(r.incidentDate).toLocaleDateString()
                : "Sin fecha"}
              <br />
              📝 {r.description?.trim() || "Sin descripción"}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// 🎮 BOTONES MEJORADOS
function MapControls({ onReportFromLocation }) {
  const map = useMap();

  const getLocation = (callback) => {
    if (!navigator.geolocation) {
      alert("❌ Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        callback(latitude, longitude);
      },
      (err) => {
        console.error(err);

        if (err.code === 1) {
          alert("❌ Permiso de ubicación bloqueado");
        } else if (err.code === 2) {
          alert("❌ Ubicación no disponible");
        } else {
          alert("❌ Error obteniendo ubicación");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const goToMyLocation = () => {
    getLocation((lat, lng) => {
      map.setView([lat, lng], 16);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("Estás aquí 📍")
        .openPopup();
    });
  };

  const reportHere = () => {
    getLocation((lat, lng) => {
      onReportFromLocation({ lat, lng });
      map.setView([lat, lng], 16);
    });
  };

  return (
    <>
      <button
        onClick={goToMyLocation}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,0.5)"
        }}
      >
        📍
      </button>

      <button
        onClick={reportHere}
        style={{
          position: "absolute",
          bottom: 100,
          right: 20,
          zIndex: 1000,
          background: "#dc2626",
          color: "#fff",
          border: "none",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,0.5)"
        }}
      >
        🚨
      </button>
    </>
  );
}

// 🚀 MAPA PRINCIPAL
export default function MapView({
  reports = [],
  onMapClick,
  onBoundsChange,
  userLocation,
  selectedLocation,
  reportMarker,
  onReportFromLocation
}) {
  return (
    <MapContainer
      center={[20.5888, -100.3899]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" />

      <SetupPanes />
      <MapBounds onBoundsChange={onBoundsChange} />
      <MapClickHandler onMapClick={onMapClick} />

      <Heatmap reports={reports} />
      <MarkersLayer reports={reports} />

      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
          <Popup>📍 Ubicación seleccionada</Popup>
        </Marker>
      )}

      {reportMarker && (
        <Marker position={[reportMarker.lat, reportMarker.lng]} icon={reportIcon}>
          <Popup>✅ Reporte enviado aquí</Popup>
        </Marker>
      )}

      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>📍 Tu ubicación</Popup>
          </Marker>

          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={1500}
            pathOptions={{ color: "red", fillOpacity: 0.1 }}
          />
        </>
      )}

      <MapControls onReportFromLocation={onReportFromLocation} />
    </MapContainer>
  );
}