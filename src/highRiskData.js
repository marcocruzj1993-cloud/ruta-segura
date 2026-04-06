function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateCluster(lat, lng, count, type, confidence, description) {
  const data = [];

  for (let i = 0; i < count; i++) {
    const incidentDate = randomDate(new Date(2022, 0, 1), new Date());
    const reportDate = new Date(
      incidentDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000
    );

    data.push({
      type,
      lat: lat + (Math.random() - 0.5) * 0.05,
      lng: lng + (Math.random() - 0.5) * 0.05,
      timeOfDay: ["Día", "Noche", "Madrugada"][Math.floor(Math.random() * 3)],
      confidence,
      description,
      incidentDate: incidentDate.toISOString(),
      reportDate: reportDate.toISOString(),
    });
  }

  return data;
}

const highRiskReports = [
  ...generateCluster(20.5888, -100.3899, 150, "Accidente múltiple", "Verificado", "Carambolas frecuentes"),
  ...generateCluster(20.620, -100.420, 120, "Choque de tráiler", "Verificado", "Accidentes de carga pesada"),
  ...generateCluster(20.390, -99.980, 120, "Accidente", "Verificado", "Alta velocidad"),
  ...generateCluster(20.500, -100.150, 100, "Accidente", "Verificado", "Incidentes constantes"),
  ...generateCluster(19.900, -99.350, 200, "Asalto", "Verificado", "Robos organizados"),
  ...generateCluster(19.950, -99.500, 100, "Asalto", "Verificado", "Intentos de robo"),
  ...generateCluster(19.720, -99.220, 100, "Tráfico / accidente", "Verificado", "Congestión"),
  ...generateCluster(19.650, -99.200, 100, "Accidente", "Verificado", "Zona urbana"),
  ...generateCluster(19.500, -99.130, 120, "Riesgo alto", "Verificado", "Alta incidencia"),
];

export default highRiskReports;