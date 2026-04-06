export default function StatsPanel({ reports }) {
  if (!reports || reports.length === 0) return null;

  const total = reports.length;

  const byType = {};
  const byTime = { Día: 0, Noche: 0, Madrugada: 0 };

  reports.forEach(r => {
    byType[r.type] = (byType[r.type] || 0) + 1;

    if (byTime[r.timeOfDay] !== undefined) {
      byTime[r.timeOfDay]++;
    }
  });

  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
  const riskScore = Math.min(100, Math.round(total / 10));

  return (
    <div style={{
      background: "#111827",
      padding: "12px",
      borderRadius: "10px",
      marginTop: "10px",
      fontSize: "13px"
    }}>
      <h3>📊 Zona visible</h3>

      <p>📍 Reportes: <strong>{total}</strong></p>
      <p>🔥 Principal: <strong>{topType?.[0]}</strong></p>

      <p>🌅 Día: {byTime["Día"]}</p>
      <p>🌙 Noche: {byTime["Noche"]}</p>
      <p>🌌 Madrugada: {byTime["Madrugada"]}</p>

      <p>⚠️ Riesgo: <strong>{riskScore}%</strong></p>
    </div>
  );
}