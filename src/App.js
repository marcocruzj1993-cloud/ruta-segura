import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import MapView from "./MapView";
import ReportForm from "./ReportForm";
import Dashboard from "./Dashboard";
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

  // 🔥 DATA (MEJORADA)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {

      // 🔥 AGREGAMOS ID REAL (NO QUITAMOS NADA)
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

      // 🔥 NUEVO: eliminar duplicados
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

  // 📊 FILTRO POR ZONA VISIBLE
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

  // 🔔 ALERTAS AUTOMÁTICAS
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
        <h1>🚨 RutaSegura</h1>

        {/* 🔔 ALERTAS */}
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

        {/* 📊 PREDICCIÓN */}
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

        {/* 📍 FORMULARIO */}
        <ReportForm
          onAdd={(report) => {
            // 🔥 AGREGAMOS FLAG PARA MAPVIEW
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
          }}
          selectedLocation={selectedLocation}
        />

        {/* 📊 STATS */}
        <StatsPanel reports={visibleReports} />

        {/* 📊 DASHBOARD */}
        <Dashboard reports={reports} />
      </div>

      <div className="map">
        <MapView
          reports={reports}
          onMapClick={handleMapClick}
          onBoundsChange={setBounds}
          userLocation={userLocation}
          selectedLocation={selectedLocation}
          reportMarker={reportMarker}
        />
      </div>

      <Analytics />
    </div>
  );
}

export default App;