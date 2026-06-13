import { useEffect, useState } from "react";

export default function Shipments() {
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/shipments")
      .then(r => r.json())
      .then(setShipments);
  }, []);

  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6 }}>Shipments</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>All active and completed shipments</p>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total Shipments", value:shipments.length,                                          color:"#3b82f6" },
          { label:"On Time",         value:shipments.filter(s=>s.status==="on_time").length,           color:"#22c55e" },
          { label:"Delayed",         value:shipments.filter(s=>s.status==="delayed").length,           color:"#ef4444" },
        ].map(c => (
          <div key={c.label} style={{ background:"#fff", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", borderLeft:`4px solid ${c.color}` }}>
            <p style={{ color:"#6b7280", fontSize:13, marginBottom:8 }}>{c.label}</p>
            <p style={{ fontSize:30, fontWeight:700, color:c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ fontWeight:600, fontSize:15 }}>All Shipments</h2>
          <input placeholder="🔍 Search..." style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"7px 12px", fontSize:13, width:200 }} />
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f9fafb" }}>
              {["Order ID","Product","Supplier","Method","Value","Date","Status"].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:"#6b7280", borderBottom:"1px solid #f3f4f6" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s,i) => (
              <tr key={s.id} style={{ background: i%2===0?"#fff":"#fafafa" }}>
                <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#3b82f6" }}>{s.id}</td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>{s.product}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:"#6b7280" }}>{s.origin}</td>
                <td style={{ padding:"12px 16px", fontSize:13 }}>
                  <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:"#f0f9ff", color:"#0ea5e9" }}>{s.method}</span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:13, fontWeight:500 }}>${Number(s.value).toFixed(2)}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:"#6b7280" }}>{s.date}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ padding:"3px 11px", borderRadius:20, fontSize:11, fontWeight:600, background:s.status==="delayed"?"#fef2f2":"#f0fdf4", color:s.status==="delayed"?"#ef4444":"#22c55e" }}>
                    {s.status==="delayed"?"Delayed":"On Time"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}