import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/suppliers")
      .then(r => r.json())
      .then(setSuppliers);
  }, []);

  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6 }}>Suppliers</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>Performance metrics for all suppliers</p>

      {/* Chart */}
      <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", marginBottom:24 }}>
        <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>On-Time Delivery Rate by Supplier</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={suppliers}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="supplier" tick={{ fontSize:12, fill:"#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0,100]} tick={{ fontSize:12, fill:"#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius:9, border:"1px solid #e5e7eb", fontSize:12 }} formatter={(v:any) => [`${v}%`, "On Time Rate"]} />
            <Bar dataKey="on_time_rate" name="On Time Rate" fill="#3b82f6" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Supplier cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
        {suppliers.map(s => (
          <div key={s.supplier} style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:10, background:"linear-gradient(135deg,#0ea5e9,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>
                  {s.supplier.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight:600, fontSize:15 }}>{s.supplier}</p>
                  <p style={{ fontSize:12, color:"#9ca3af" }}>{s.total_orders} total orders</p>
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10, background:s.on_time_rate>=75?"#f0fdf4":s.on_time_rate>=60?"#fffbeb":"#fef2f2", color:s.on_time_rate>=75?"#22c55e":s.on_time_rate>=60?"#f59e0b":"#ef4444" }}>
                {s.on_time_rate}% on time
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[
                { label:"Total Orders", value:s.total_orders,                     color:"#3b82f6" },
                { label:"Delayed",      value:s.delayed_orders,                    color:"#ef4444" },
                { label:"Total Value",  value:`$${Number(s.total_value).toFixed(0)}`, color:"#22c55e" },
              ].map(m => (
                <div key={m.label} style={{ background:"#f9fafb", borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:11, color:"#9ca3af", marginBottom:3 }}>{m.label}</p>
                  <p style={{ fontSize:16, fontWeight:700, color:m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}