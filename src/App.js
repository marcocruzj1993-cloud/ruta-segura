import { useState, useEffect } from "react";
import MapView from "./MapView";
import ReportForm from "./ReportForm";
import StatsPanel from "./StatsPanel";

import realReports from "./realData";
import nationalReports from "./nationalData";
import highRiskReports from "./highRiskData";
import cdmxData from "./cdmxData";
import { generateReports } from "./generateData";

import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

import L from "leaflet";
import "./App.css";

function App() {
  const [reports, setReports] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reportMarker, setReportMarker] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // 📍 TRACKING EN VIVO
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 🔥 DATA
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const simulated = generateReports(500);

      const merged = [
        ...data,
        ...realReports,
        ...nationalReports,
        ...highRiskReports,
        ...cdmxData,
        ...simulated
      ];

      const unique = Array.from(
        new Map(
          merged.map(r => [
            r.id || `${r.lat}-${r.lng}-${r.timestamp || ""}`,
            r
          ])
        ).values()
      );

      setReports(unique);
    });

    return () => unsubscribe();
  }, []);

  // 📍 CLICK EN MAPA
  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
  };

  // 🚨 NUEVO: REPORTAR DESDE BOTÓN DEL MAPA
  const handleReportFromLocation = (coords) => {
    setSelectedLocation(coords);
  };

  // 📊 FILTRO POR ZONA
  const visibleReports = reports.filter(r => {
    if (!bounds) return true;
    return bounds.contains(L.latLng(r.lat, r.lng));
  });

  // 🧠 RIESGO CERCANO
  function getNearbyReports() {
    if (!userLocation) return [];

    return reports.filter(r => {
      const dx = r.lat - userLocation.lat;
      const dy = r.lng - userLocation.lng;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < 0.02;
    });
  }

  const nearbyReports = getNearbyReports();

  // 🔔 ALERTAS
  useEffect(() => {
    if (nearbyReports.length > 50) {
      setAlerts(prev => [
        {
          id: Date.now(),
          message: "🚨 Alta incidencia de delitos cerca de ti"
        },
        ...prev
      ].slice(0, 3));
    }
  }, [nearbyReports.length]);

  // 📊 PREDICCIÓN
  function getPrediction() {
    const n = nearbyReports.length;

    if (n > 80) return "🔴 Muy alta probabilidad de incidente";
    if (n > 40) return "🟠 Riesgo elevado en la zona";
    if (n > 10) return "🟡 Riesgo moderado";
    return "🟢 Riesgo bajo";
  }

  return (
    <div className="container">

      <div className="sidebar">

        {/* HEADER */}
        <div style={{ marginBottom: "10px" }}>
          <h1 style={{ margin: 0 }}>RutaSegura</h1>
          <small style={{ color: "#94a3b8" }}>
            Protege tu camino en tiempo real
          </small>
        </div>

        {/* INSTRUCCIÓN */}
        <div style={{
          background: "#1e293b",
          padding: "8px",
          borderRadius: "8px",
          marginBottom: "10px",
          fontSize: "12px"
        }}>
          📍 Haz clic en el mapa o usa 🚨 para reportar
        </div>

        {/* ALERTAS */}
        {alerts.map(a => (
          <div key={a.id} style={{
            background: "#7f1d1d",
            padding: "8px",
            borderRadius: "8px",
            marginBottom: "5px"
          }}>
            {a.message}
          </div>
        ))}

        {/* PREDICCIÓN */}
        <div style={{
          background: "#1e293b",
          padding: "10px",
          borderRadius: "10px",
          marginBottom: "10px"
        }}>
          {getPrediction()}
          <br />
          <small>{nearbyReports.length} incidentes cercanos</small>
        </div>

        {/* FORMULARIO */}
        <ReportForm
          onAdd={(report) => {
            const enrichedReport = {
              ...report,
              isNew: true
            };

            setReports(prev => [...prev, enrichedReport]);

            setReportMarker({
              lat: report.lat,
              lng: report.lng
            });

            setSelectedLocation(null);

            alert("✅ Reporte enviado correctamente");
          }}
          selectedLocation={selectedLocation}
        />

        {/* STATS */}
        <StatsPanel reports={visibleReports} />

      </div>

      <div className="map">
        <MapView
          reports={reports}
          onMapClick={handleMapClick}
          onBoundsChange={setBounds}
          userLocation={userLocation}
          selectedLocation={selectedLocation}
          reportMarker={reportMarker}
          onReportFromLocation={handleReportFromLocation} // 🔥 CLAVE
        />
      </div>

    </div>
  );
}

export default App;