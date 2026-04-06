function randomOffset() {
  return (Math.random() - 0.5) * 0.01;
}

function randomDate() {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 60));
  return d.toISOString();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const types = ["Asalto", "RoboVehiculo", "Extorsion", "Fraude"];
const times = ["Día", "Noche", "Madrugada"];

function createCluster(lat, lng, count, label) {
  const data = [];

  for (let i = 0; i < count; i++) {
    data.push({
      type: pick(types),
      timeOfDay: pick(times),
      lat: lat + randomOffset(),
      lng: lng + randomOffset(),
      confidence: "Verificado",
      description: `Zona de alta incidencia: ${label}`,
      incidentDate: randomDate(),
      reportDate: randomDate(),
    });
  }

  return data;
}

const cdmxData = [
  // 🔥 TEPITO / MORELOS (muy alta densidad)
  ...createCluster(19.4436, -99.1377, 200, "Tepito / Morelos"),

  // 🔥 GUERRERO
  ...createCluster(19.4440, -99.1450, 150, "Colonia Guerrero"),

  // 🔥 ROMA NORTE
  ...createCluster(19.4194, -99.1623, 120, "Roma Norte"),

  // 🔥 DOCTORES
  ...createCluster(19.4215, -99.1500, 120, "Doctores"),

  // 🔥 IZTAPALAPA (alto volumen)
  ...createCluster(19.3570, -99.0670, 200, "Iztapalapa"),

  // 🔥 ECATEPEC (zona crítica metropolitana)
  ...createCluster(19.6010, -99.0500, 200, "Ecatepec"),

  // 🔥 NAUCALPAN
  ...createCluster(19.4750, -99.2370, 120, "Naucalpan"),

  // 🔥 TLALNEPANTLA
  ...createCluster(19.5370, -99.1940, 120, "Tlalnepantla"),
];

export default cdmxData;