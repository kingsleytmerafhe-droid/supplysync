import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/orders")
      .then(r => r.json())
      .then(setOrders);
  }, []);

  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6 }}>Orders</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>All pending orders requiring approval</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total Pending", value:orders.length,                                   color:"#3b82f6" },
          { label:"High Priority", value:orders.filter(o=>o.priority==="High").length,    color:"#ef4444" },
          { label:"Total Value",   value:`$${orders.reduce((a,o)=>a+o.value,0).toFixed(0)}`, color:"#22c55e" },
        ].map(c => (
          <div key={c.label} style={{ background:"#fff", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", borderLeft:`4px solid ${c.color}` }}>
            <p style={{ color:"#6b7280", fontSize:13, marginBottom:8 }}>{c.label}</p>
            <p style={{ fontSize:30, fontWeight:700, color:c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #f3f4f6" }}>
          <h2 style={{ fontWeight:600, fontSize:15 }}>Pending Orders</h2>
        </div>
        {orders.map((o,i) => (
          <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:"1px solid #f9fafb", background:i%2===0?"#fff":"#fafafa" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{o.id}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:10, background:o.priority==="High"?"#fef2f2":"#f0fdf4", color:o.priority==="High"?"#ef4444":"#22c55e" }}>{o.priority}</span>
              </div>
              <p style={{ color:"#6b7280", fontSize:13 }}>{o.supplier} | {o.items} units | ${Number(o.value).toFixed(2)}</p>
              <p style={{ color:"#9ca3af", fontSize:12, marginTop:2 }}>Via {o.requester}</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ background:"#f0fdf4", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontWeight:600, fontSize:12, color:"#22c55e" }}>✓ Approve</button>
              <button style={{ background:"#fef2f2", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontWeight:600, fontSize:12, color:"#ef4444" }}>✗ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
