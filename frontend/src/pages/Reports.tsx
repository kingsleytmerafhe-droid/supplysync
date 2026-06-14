import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#6366f1"];

export default function Reports() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/suppliers").then(r=>r.json()).then(setSuppliers);
    fetch("http://127.0.0.1:8000/api/shipments").then(r=>r.json()).then(setShipments);
  }, []);

  const methodData = shipments.reduce((acc:any, s:any) => {
    acc[s.method] = (acc[s.method] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(methodData).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6 }}>Reports</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>Analytics and insights across your supply chain</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>

        {/* Supplier value chart */}
        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Total Value by Supplier</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={suppliers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="supplier" tick={{ fontSize:11, fill:"#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:"#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:9, border:"1px solid #e5e7eb", fontSize:12 }} formatter={(v:any) => [`$${Number(v).toFixed(0)}`, "Value"]} />
              <Bar dataKey="total_value" fill="#6366f1" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Shipping method pie */}
        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Shipments by Method</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius:9, border:"1px solid #e5e7eb", fontSize:12 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Supplier Summary Report</h2>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f9fafb" }}>
              {["Supplier","Total Orders","Delayed","On Time Rate","Total Value","Rating"].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:"#6b7280", borderBottom:"1px solid #f3f4f6" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s,i) => (
              <tr key={s.supplier} style={{ background:i%2===0?"#fff":"#fafafa" }}>
                <td style={{ padding:"12px 16px", fontWeight:600, fontSize:13 }}>{s.supplier}</td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>{s.total_orders}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:"#ef4444" }}>{s.delayed_orders}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:s.on_time_rate>=75?"#22c55e":s.on_time_rate>=60?"#f59e0b":"#ef4444" }}>{s.on_time_rate}%</span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>${Number(s.total_value).toFixed(0)}</td>
                <td style={{ padding:"12px 16px" }}>
                  {"★".repeat(Math.round(s.on_time_rate/20))}{"☆".repeat(5-Math.round(s.on_time_rate/20))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}