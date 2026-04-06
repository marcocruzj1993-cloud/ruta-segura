import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const crimeTypes = [
  "Asalto",
  "RoboVehiculo",
  "RoboCasa",
  "Extorsion",
  "Secuestro",
  "Fraude",
  "Violencia",
  "Narcomenudeo",
  "Homicidio",
  "RoboTransporte",
];

export default function ReportForm({ onAdd, selectedLocation }) {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [reportedToPolice, setReportedToPolice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type) return alert("Selecciona tipo");
    if (!timeOfDay) return alert("Selecciona momento");
    if (reportedToPolice === null) return alert("Indica validación");

    const location = selectedLocation || {
      lat: 20.5888,
      lng: -100.3899
    };

    const nowDate = new Date();
    const nowISO = nowDate.toISOString();

    // 🔥 SOLO AGREGAMOS CAMPOS (NO QUITAMOS NADA)
    const newReport = {
      id: Date.now(), // 🔥 NUEVO (clave para evitar duplicados)
      type,
      description,
      timeOfDay,
      reportedToPolice,
      confidence: reportedToPolice ? "Verificado" : "Reporte ciudadano",
      lat: location.lat,
      lng: location.lng,
      incidentDate: nowISO,
      reportDate: nowISO,

      // 🔥 NUEVO (mejor control de render)
      createdAtLocal: nowISO,
      timestamp: nowDate.getTime(),
      isNew: true,

      // 🔥 SE MANTIENE (Firebase)
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "reports"), newReport);

    // 🔥 IMPORTANTE: esto hace que aparezca INMEDIATO en el mapa
    onAdd(newReport);

    // reset
    setType("");
    setDescription("");
    setTimeOfDay("");
    setReportedToPolice(null);
  };

  // 🔥 BOTÓN ESTILO SELECCIÓN
  const activeStyle = {
    background: "#22c55e",
    color: "#022c22"
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Reportar incidente</h3>

      {/* 🔥 TIPOS DE DELITO */}
      <p>Tipo:</p>
      <div>
        {crimeTypes.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setType(c)}
            style={type === c ? activeStyle : {}}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 🕒 MOMENTO */}
      <p>Momento:</p>
      <button
        type="button"
        onClick={() => setTimeOfDay("Día")}
        style={timeOfDay === "Día" ? activeStyle : {}}
      >
        🌅 Día
      </button>

      <button
        type="button"
        onClick={() => setTimeOfDay("Noche")}
        style={timeOfDay === "Noche" ? activeStyle : {}}
      >
        🌙 Noche
      </button>

      <button
        type="button"
        onClick={() => setTimeOfDay("Madrugada")}
        style={timeOfDay === "Madrugada" ? activeStyle : {}}
      >
        🌌 Madrugada
      </button>

      {/* 🚓 VALIDACIÓN */}
      <p>¿Reportado a policía?</p>

      <button
        type="button"
        onClick={() => setReportedToPolice(true)}
        style={reportedToPolice === true ? activeStyle : {}}
      >
        Sí
      </button>

      <button
        type="button"
        onClick={() => setReportedToPolice(false)}
        style={reportedToPolice === false ? activeStyle : {}}
      >
        No
      </button>

      {/* 📝 DESCRIPCIÓN */}
      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit">Enviar</button>
    </form>
  );
}