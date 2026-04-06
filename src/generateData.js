function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const types = ["Asalto","RoboVehiculo","RoboCasa","Extorsion"];
const times = ["Día","Noche","Madrugada"];

const descriptions = [
  "Incidente reportado en zona de riesgo",
  "Actividad sospechosa",
  "Robo con violencia",
  "Zona con múltiples reportes",
];

const cities = [
  { lat: 19.43, lng: -99.13 },
  { lat: 20.67, lng: -103.35 },
  { lat: 25.68, lng: -100.31 },
  { lat: 20.58, lng: -100.39 },
];

export function generateReports(count = 500) {
  const data = [];

  for (let i = 0; i < count; i++) {
    const city = getRandom(cities);

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    data.push({
      type: getRandom(types),
      timeOfDay: getRandom(times),
      lat: city.lat + (Math.random() - 0.5) * 0.2,
      lng: city.lng + (Math.random() - 0.5) * 0.2,
      confidence: "Estimado",
      description: getRandom(descriptions),
      incidentDate: date.toISOString(),
      reportDate: date.toISOString(),
    });
  }

  return data;
}