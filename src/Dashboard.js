import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function Dashboard({ reports }) {

  // 📊 POR TIPO
  const typeData = Object.values(
    reports.reduce((acc, r) => {
      acc[r.type] = acc[r.type] || { name: r.type, total: 0 };
      acc[r.type].total++;
      return acc;
    }, {})
  );

  // 🕒 POR HORARIO
  const timeData = Object.values(
    reports.reduce((acc, r) => {
      acc[r.timeOfDay] = acc[r.timeOfDay] || { name: r.timeOfDay, total: 0 };
      acc[r.timeOfDay].total++;
      return acc;
    }, {})
  );

  return (
    <div style={{ padding: "10px" }}>
      <h3>📊 Reportes por tipo</h3>

      <BarChart width={280} height={200} data={typeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" />
      </BarChart>

      <h3>🕒 Reportes por horario</h3>

      <BarChart width={280} height={200} data={timeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" />
      </BarChart>
    </div>
  );
}