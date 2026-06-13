import { useEffect, useState } from "react";

export default function Inventory() {
  const [warehouse, setWarehouse] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/warehouse")
      .then(r => r.json())
      .then(setWarehouse);
  }, []);

  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6 }}>Inventory</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>Stock levels across all warehouse locations</p>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total Locations", value:warehouse.length,                                        color:"#3b82f6" },
          { label:"Optimal",         value:warehouse.filter(w=>w.status==="Optimal").length,         color:"#22c55e" },
          { label:"Needs Attention", value:warehouse.filter(w=>w.status!=="Optimal").length,         color:"#ef4444" },
        ].map(c => (
          <div key={c.label} style={{ background:"#fff", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", borderLeft:`4px solid ${c.color}` }}>
            <p style={{ color:"#6b7280", fontSize:13, marginBottom:8 }}>{c.label}</p>
            <p style={{ fontSize:30, fontWeight:700, color:c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Warehouse cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {warehouse.map(w => (
          <div key={w.category} style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ fontWeight:600, fontSize:15 }}>{w.category}</h3>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10, background:w.status==="Optimal"?"#f0fdf4":w.status==="Low"?"#fef2f2":"#fffbeb", color:w.status==="Optimal"?"#22c55e":w.status==="Low"?"#ef4444":"#f59e0b" }}>{w.status}</span>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:"#6b7280" }}>Stock Level</span>
                <span style={{ fontSize:12, fontWeight:600 }}>{Math.round((w.stock/w.capacity)*100)}%</span>
              </div>
              <div style={{ background:"#f3f4f6", borderRadius:6, height:10 }}>
                <div style={{ height:10, borderRadius:6, width:`${Math.min((w.stock/w.capacity)*100,100)}%`, background:w.status==="Optimal"?"#22c55e":w.status==="Low"?"#ef4444":"#f59e0b", transition:"width 0.6s ease" }} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:14 }}>
              <div style={{ background:"#f9fafb", borderRadius:8, padding:"10px 12px" }}>
                <p style={{ fontSize:11, color:"#9ca3af", marginBottom:3 }}>Current Stock</p>
                <p style={{ fontSize:18, fontWeight:700 }}>{w.stock}</p>
              </div>
              <div style={{ background:"#f9fafb", borderRadius:8, padding:"10px 12px" }}>
                <p style={{ fontSize:11, color:"#9ca3af", marginBottom:3 }}>Capacity</p>
                <p style={{ fontSize:18, fontWeight:700 }}>{w.capacity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}