import { useEffect, useState } from "react";
import { getStats, getShipments, getWarehouse, getOrders, BASE } from "../api/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import ShipmentMap from "../components/ShipmentMap";

const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#6366f1"];

const glass = {
  background: "rgba(15,23,42,0.75)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

const NAV = [
  { label:"Dashboard", icon:"▣" },
  { label:"Shipments", icon:"⬡" },
  { label:"Inventory", icon:"◫" },
  { label:"Suppliers", icon:"⬢" },
  { label:"Orders",    icon:"◧" },
  { label:"Reports",   icon:"◨" },
];

const CARD_CFG = [
  { key:"active_shipments",  label:"Active Shipments",  sub:"+8% vs last week",       color:"#22c55e", trend:"up"   },
  { key:"low_stock_items",   label:"Delayed Shipments", sub:"requires attention",      color:"#ef4444", trend:"down" },
  { key:"supplier_rating",   label:"Supplier Rating",   sub:"based on on-time rate",   color:"#3b82f6", trend:"up"   },
  { key:"pending_approvals", label:"Pending Approvals", sub:"awaiting action",         color:"#f59e0b", trend:"down" },
];

const txt    = { primary:"#f1f5f9", secondary:"#94a3b8", muted:"#64748b" };
const border = "1px solid rgba(255,255,255,0.07)";

// ─── DASHBOARD HOME ───────────────────────────────────────────────
function DashboardHome({ stats, shipments, warehouse, orders, suppliers, supplierChartData }: any) {
  const card = (key: string) => {
    if (!stats) return "—";
    return key === "supplier_rating" ? `${stats[key]}/5` : stats[key];
  };

  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:22, color:txt.primary }}>Dashboard</h1>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {CARD_CFG.map(c => (
          <div key={c.key} style={{ ...glass, padding:"18px 20px", borderTop:`3px solid ${c.color}` }}>
            <p style={{ color:txt.secondary, fontSize:13, marginBottom:10, fontWeight:500 }}>{c.label}</p>
            <p style={{ fontSize:32, fontWeight:700, letterSpacing:"-1px", marginBottom:6, color:txt.primary }}>{card(c.key)}</p>
            <p style={{ color:c.color, fontSize:12, fontWeight:500 }}>{c.trend==="up"?"▲":"▼"} {c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:22 }}>
        <div style={{ ...glass, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <h2 style={{ fontWeight:600, fontSize:15, color:txt.primary }}>Shipment Tracking</h2>
              <p style={{ color:txt.muted, fontSize:12, marginTop:2 }}>Real-time location of shipments in transit</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {["Map","Data"].map((t,i) => (
                <button key={t} style={{ padding:"5px 13px", borderRadius:7, border:"1px solid rgba(255,255,255,0.1)", background:i===0?"rgba(14,165,233,0.2)":"transparent", fontSize:12, cursor:"pointer", fontWeight:i===0?600:400, color:i===0?"#0ea5e9":txt.secondary }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:14, borderRadius:10, overflow:"hidden" }}><ShipmentMap /></div>
          {shipments.slice(0,5).map((s:any) => (
            <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:border }}>
              <div>
                <p style={{ fontWeight:600, fontSize:13, color:txt.primary }}>{s.product}</p>
                <p style={{ color:txt.muted, fontSize:12 }}>{s.origin} → {s.destination} · {s.method}</p>
              </div>
              <span style={{ padding:"3px 11px", borderRadius:20, fontSize:11, fontWeight:600, background:s.status==="delayed"?"rgba(239,68,68,0.15)":"rgba(34,197,94,0.15)", color:s.status==="delayed"?"#ef4444":"#22c55e" }}>
                {s.status==="delayed"?"Delayed":"On Time"}
              </span>
            </div>
          ))}
          <div style={{ display:"flex", gap:20, fontSize:12, marginTop:10, color:txt.muted }}>
            <span>Total: <strong style={{ color:txt.primary }}>{shipments.length}</strong></span>
            <span>On time: <strong style={{ color:"#22c55e" }}>{shipments.filter((s:any)=>s.status==="on_time").length}</strong></span>
            <span>Delayed: <strong style={{ color:"#ef4444" }}>{shipments.filter((s:any)=>s.status==="delayed").length}</strong></span>
          </div>
        </div>

        <div style={{ ...glass, padding:20 }}>
          <h2 style={{ fontWeight:600, fontSize:15, marginBottom:3, color:txt.primary }}>Warehouse Stock Levels</h2>
          <p style={{ color:txt.muted, fontSize:12, marginBottom:18 }}>Current inventory status across all locations</p>
          {warehouse.map((w:any) => (
            <div key={w.category} style={{ marginBottom:15 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <span style={{ fontSize:13, fontWeight:500, color:txt.primary }}>{w.category}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:10, background:w.status==="Optimal"?"rgba(34,197,94,0.15)":w.status==="Low"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)", color:w.status==="Optimal"?"#22c55e":w.status==="Low"?"#ef4444":"#f59e0b" }}>{w.status}</span>
              </div>
              <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:6, height:7 }}>
                <div style={{ height:7, borderRadius:6, width:`${Math.min((w.stock/w.capacity)*100,100)}%`, background:w.status==="Optimal"?"#22c55e":w.status==="Low"?"#ef4444":"#f59e0b", transition:"width 0.6s ease" }} />
              </div>
              <p style={{ fontSize:11, color:txt.muted, marginTop:3 }}>{w.stock}/{w.capacity} units</p>
            </div>
          ))}
          <button style={{ width:"100%", marginTop:6, padding:"9px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, fontSize:13, color:txt.secondary, cursor:"pointer", fontWeight:500 }}>See All Locations</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ ...glass, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <h2 style={{ fontWeight:600, fontSize:15, color:txt.primary }}>Supplier Performance</h2>
              <p style={{ color:txt.muted, fontSize:12, marginTop:2 }}>On-time delivery vs quality score</p>
            </div>
            <div style={{ display:"flex", gap:12, fontSize:11, color:txt.muted }}>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#3b82f6", display:"inline-block" }} />On Time</span>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />Quality</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={supplierChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:"#64748b" }} axisLine={false} tickLine={false} />
              <YAxis domain={[40,100]} tick={{ fontSize:11, fill:"#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:9, border:"1px solid rgba(255,255,255,0.1)", fontSize:12, background:"#1e293b", color:"#f1f5f9" }} />
              <Line type="monotone" dataKey="onTime"  name="On Time %" stroke="#3b82f6" strokeWidth={2.5} dot={{ r:4, fill:"#3b82f6" }} activeDot={{ r:6 }} />
              <Line type="monotone" dataKey="quality" name="Quality"    stroke="#22c55e" strokeWidth={2.5} dot={{ r:4, fill:"#22c55e" }} activeDot={{ r:6 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop:12, borderTop:border, paddingTop:12 }}>
            {suppliers.map((s:any) => (
              <div key={s.supplier} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:12 }}>
                <span style={{ fontWeight:500, color:txt.primary }}>{s.supplier}</span>
                <span style={{ fontWeight:600, color:s.on_time_rate>=75?"#22c55e":s.on_time_rate>=60?"#f59e0b":"#ef4444" }}>{s.on_time_rate}% on time</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...glass, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <h2 style={{ fontWeight:600, fontSize:15, color:txt.primary }}>Orders Pending Approval</h2>
              <p style={{ color:txt.muted, fontSize:12, marginTop:2 }}>{orders.length} orders require your attention</p>
            </div>
            <button style={{ color:"#0ea5e9", background:"none", border:"none", cursor:"pointer", fontWeight:600, fontSize:13 }}>View All</button>
          </div>
          {orders.slice(0,5).map((o:any) => (
            <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:border }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:txt.primary }}>{o.id}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:10, background:o.priority==="High"?"rgba(239,68,68,0.15)":"rgba(34,197,94,0.15)", color:o.priority==="High"?"#ef4444":"#22c55e" }}>{o.priority}</span>
                </div>
                <p style={{ color:txt.secondary, fontSize:12 }}>{o.supplier} | {o.items} units | ${Number(o.value).toFixed(2)}</p>
                <p style={{ color:txt.muted, fontSize:11, marginTop:2 }}>Via {o.requester}</p>
              </div>
              <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 14px", cursor:"pointer", fontWeight:500, fontSize:12, color:txt.secondary }}>Review</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SHIPMENTS PAGE ───────────────────────────────────────────────
function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  useEffect(() => { fetch(`${BASE}/api/shipments`).then(r=>r.json()).then(setShipments); }, []);
  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:txt.primary }}>Shipments</h1>
      <p style={{ color:txt.muted, fontSize:14, marginBottom:24 }}>All active and completed shipments</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total",    value:shipments.length,                                  color:"#3b82f6" },
          { label:"On Time",  value:shipments.filter(s=>s.status==="on_time").length,   color:"#22c55e" },
          { label:"Delayed",  value:shipments.filter(s=>s.status==="delayed").length,   color:"#ef4444" },
        ].map(c => (
          <div key={c.label} style={{ ...glass, padding:"18px 20px", borderLeft:`4px solid ${c.color}` }}>
            <p style={{ color:txt.secondary, fontSize:13, marginBottom:8 }}>{c.label}</p>
            <p style={{ fontSize:30, fontWeight:700, color:c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ ...glass, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:border }}>
          <h2 style={{ fontWeight:600, fontSize:15, color:txt.primary }}>All Shipments</h2>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.03)" }}>
              {["Order ID","Product","Warehouse","Method","Value","Date","Status"].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:txt.muted, borderBottom:border }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s,i) => (
              <tr key={s.id} style={{ background:i%2===0?"transparent":"rgba(255,255,255,0.02)" }}>
                <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#0ea5e9" }}>{s.id}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:txt.primary }}>{s.product}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:txt.secondary }}>{s.origin}</td>
                <td style={{ padding:"12px 16px" }}><span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(14,165,233,0.15)", color:"#0ea5e9" }}>{s.method}</span></td>
                <td style={{ padding:"12px 16px", fontSize:13, color:txt.primary }}>${Number(s.value).toFixed(2)}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:txt.secondary }}>{s.date}</td>
                <td style={{ padding:"12px 16px" }}><span style={{ padding:"3px 11px", borderRadius:20, fontSize:11, fontWeight:600, background:s.status==="delayed"?"rgba(239,68,68,0.15)":"rgba(34,197,94,0.15)", color:s.status==="delayed"?"#ef4444":"#22c55e" }}>{s.status==="delayed"?"Delayed":"On Time"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── INVENTORY PAGE ───────────────────────────────────────────────
function InventoryPage() {
  const [warehouse, setWarehouse] = useState<any[]>([]);
  useEffect(() => { fetch(`${BASE}/api/warehouse`).then(r=>r.json()).then(setWarehouse); }, []);
  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:txt.primary }}>Inventory</h1>
      <p style={{ color:txt.muted, fontSize:14, marginBottom:24 }}>Stock levels across all warehouse locations</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total Locations",  value:warehouse.length,                                color:"#3b82f6" },
          { label:"Optimal",          value:warehouse.filter(w=>w.status==="Optimal").length, color:"#22c55e" },
          { label:"Needs Attention",  value:warehouse.filter(w=>w.status!=="Optimal").length, color:"#ef4444" },
        ].map(c => (
          <div key={c.label} style={{ ...glass, padding:"18px 20px", borderLeft:`4px solid ${c.color}` }}>
            <p style={{ color:txt.secondary, fontSize:13, marginBottom:8 }}>{c.label}</p>
            <p style={{ fontSize:30, fontWeight:700, color:c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {warehouse.map(w => (
          <div key={w.category} style={{ ...glass, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ fontWeight:600, fontSize:15, color:txt.primary }}>{w.category}</h3>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10, background:w.status==="Optimal"?"rgba(34,197,94,0.15)":w.status==="Low"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)", color:w.status==="Optimal"?"#22c55e":w.status==="Low"?"#ef4444":"#f59e0b" }}>{w.status}</span>
            </div>
            <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:6, height:10, marginBottom:12 }}>
              <div style={{ height:10, borderRadius:6, width:`${Math.min((w.stock/w.capacity)*100,100)}%`, background:w.status==="Optimal"?"#22c55e":w.status==="Low"?"#ef4444":"#f59e0b" }} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[{ label:"Stock", value:w.stock },{ label:"Capacity", value:w.capacity }].map(m => (
                <div key={m.label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:11, color:txt.muted, marginBottom:3 }}>{m.label}</p>
                  <p style={{ fontSize:18, fontWeight:700, color:txt.primary }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SUPPLIERS PAGE ───────────────────────────────────────────────
function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  useEffect(() => { fetch(`${BASE}/api/suppliers`).then(r=>r.json()).then(setSuppliers); }, []);
  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:txt.primary }}>Suppliers</h1>
      <p style={{ color:txt.muted, fontSize:14, marginBottom:24 }}>Performance metrics for all suppliers</p>
      <div style={{ ...glass, padding:20, marginBottom:24 }}>
        <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16, color:txt.primary }}>On-Time Delivery Rate</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={suppliers}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="supplier" tick={{ fontSize:12, fill:"#64748b" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0,100]} tick={{ fontSize:12, fill:"#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius:9, border:"1px solid rgba(255,255,255,0.1)", fontSize:12, background:"#1e293b", color:"#f1f5f9" }} formatter={(v:any)=>[`${v}%`,"On Time"]} />
            <Bar dataKey="on_time_rate" fill="#3b82f6" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
        {suppliers.map(s => (
          <div key={s.supplier} style={{ ...glass, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:10, background:"linear-gradient(135deg,#0ea5e9,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16 }}>{s.supplier.charAt(0)}</div>
                <div>
                  <p style={{ fontWeight:600, fontSize:15, color:txt.primary }}>{s.supplier}</p>
                  <p style={{ fontSize:12, color:txt.muted }}>{s.total_orders} orders</p>
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10, background:s.on_time_rate>=75?"rgba(34,197,94,0.15)":s.on_time_rate>=60?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.15)", color:s.on_time_rate>=75?"#22c55e":s.on_time_rate>=60?"#f59e0b":"#ef4444" }}>{s.on_time_rate}% on time</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[
                { label:"Orders", value:s.total_orders,                         color:"#3b82f6" },
                { label:"Delayed", value:s.delayed_orders,                      color:"#ef4444" },
                { label:"Value",   value:`$${Number(s.total_value).toFixed(0)}`, color:"#22c55e" },
              ].map(m => (
                <div key={m.label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:11, color:txt.muted, marginBottom:3 }}>{m.label}</p>
                  <p style={{ fontSize:15, fontWeight:700, color:m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ORDERS PAGE ──────────────────────────────────────────────────
function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { fetch(`${BASE}/api/orders`).then(r=>r.json()).then(setOrders); }, []);
  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:txt.primary }}>Orders</h1>
      <p style={{ color:txt.muted, fontSize:14, marginBottom:24 }}>All pending orders requiring approval</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total Pending", value:orders.length,                                       color:"#3b82f6" },
          { label:"High Priority", value:orders.filter(o=>o.priority==="High").length,         color:"#ef4444" },
          { label:"Total Value",   value:`$${orders.reduce((a,o)=>a+o.value,0).toFixed(0)}`,   color:"#22c55e" },
        ].map(c => (
          <div key={c.label} style={{ ...glass, padding:"18px 20px", borderLeft:`4px solid ${c.color}` }}>
            <p style={{ color:txt.secondary, fontSize:13, marginBottom:8 }}>{c.label}</p>
            <p style={{ fontSize:30, fontWeight:700, color:c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ ...glass, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:border }}>
          <h2 style={{ fontWeight:600, fontSize:15, color:txt.primary }}>Pending Orders</h2>
        </div>
        {orders.map((o,i) => (
          <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:border, background:i%2===0?"transparent":"rgba(255,255,255,0.02)" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span style={{ fontWeight:700, fontSize:14, color:txt.primary }}>{o.id}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:10, background:o.priority==="High"?"rgba(239,68,68,0.15)":"rgba(34,197,94,0.15)", color:o.priority==="High"?"#ef4444":"#22c55e" }}>{o.priority}</span>
              </div>
              <p style={{ color:txt.secondary, fontSize:13 }}>{o.supplier} | {o.items} units | ${Number(o.value).toFixed(2)}</p>
              <p style={{ color:txt.muted, fontSize:12, marginTop:2 }}>Via {o.requester}</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ background:"rgba(34,197,94,0.15)", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontWeight:600, fontSize:12, color:"#22c55e" }}>✓ Approve</button>
              <button style={{ background:"rgba(239,68,68,0.15)", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontWeight:600, fontSize:12, color:"#ef4444" }}>✗ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────
function ReportsPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${BASE}/api/suppliers`).then(r=>r.json()).then(setSuppliers);
    fetch(`${BASE}/api/shipments`).then(r=>r.json()).then(setShipments);
  }, []);

  const methodData = Object.entries(
    shipments.reduce((acc:any, s:any) => { acc[s.method]=(acc[s.method]||0)+1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ padding:"24px 28px" }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, color:txt.primary }}>Reports</h1>
      <p style={{ color:txt.muted, fontSize:14, marginBottom:24 }}>Analytics and insights across your supply chain</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
        <div style={{ ...glass, padding:20 }}>
          <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16, color:txt.primary }}>Total Value by Supplier</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={suppliers}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="supplier" tick={{ fontSize:11, fill:"#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:"#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:9, border:"1px solid rgba(255,255,255,0.1)", fontSize:12, background:"#1e293b", color:"#f1f5f9" }} formatter={(v:any)=>[`$${Number(v).toFixed(0)}`,"Value"]} />
              <Bar dataKey="total_value" fill="#6366f1" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...glass, padding:20 }}>
          <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16, color:txt.primary }}>Shipments by Method</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={methodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                {methodData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius:9, border:"1px solid rgba(255,255,255,0.1)", fontSize:12, background:"#1e293b", color:"#f1f5f9" }} />
              <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ ...glass, padding:20 }}>
        <h2 style={{ fontWeight:600, fontSize:15, marginBottom:16, color:txt.primary }}>Supplier Summary</h2>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.03)" }}>
              {["Supplier","Orders","Delayed","On Time Rate","Value","Rating"].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:txt.muted, borderBottom:border }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s,i) => (
              <tr key={s.supplier} style={{ background:i%2===0?"transparent":"rgba(255,255,255,0.02)" }}>
                <td style={{ padding:"12px 16px", fontWeight:600, fontSize:13, color:txt.primary }}>{s.supplier}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:txt.secondary }}>{s.total_orders}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:"#ef4444" }}>{s.delayed_orders}</td>
                <td style={{ padding:"12px 16px" }}><span style={{ fontWeight:600, fontSize:12, color:s.on_time_rate>=75?"#22c55e":s.on_time_rate>=60?"#f59e0b":"#ef4444" }}>{s.on_time_rate}%</span></td>
                <td style={{ padding:"12px 16px", fontSize:13, color:txt.secondary }}>${Number(s.total_value).toFixed(0)}</td>
                <td style={{ padding:"12px 16px", fontSize:14, color:"#f59e0b" }}>{"★".repeat(Math.round(s.on_time_rate/20))}{"☆".repeat(5-Math.round(s.on_time_rate/20))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,     setStats]     = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [warehouse, setWarehouse] = useState<any[]>([]);
  const [orders,    setOrders]    = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [activeNav, setActiveNav] = useState("Dashboard");

  useEffect(() => {
    getStats().then(setStats);
    getShipments().then(setShipments);
    getWarehouse().then(setWarehouse);
    getOrders().then(setOrders);
    fetch(`${BASE}/api/suppliers`).then(r=>r.json()).then(setSuppliers);
  }, []);

  const supplierChartData = suppliers.map(s => ({
    name:    s.supplier,
    onTime:  s.on_time_rate,
    quality: Math.min(parseFloat((s.on_time_rate + 8).toFixed(1)), 100),
  }));

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"transparent" }}>

      <aside style={{ width:230, flexShrink:0, background:"rgba(15,23,42,0.85)", backdropFilter:"blur(16px)", borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(14,165,233,0.4)" }}>
              <span style={{ color:"#fff", fontSize:18 }}>⬡</span>
            </div>
            <span style={{ fontWeight:700, fontSize:17, color:"#f1f5f9", letterSpacing:"-0.3px" }}>SupplySync</span>
          </div>
        </div>
        <nav style={{ flex:1, padding:"10px 10px 0" }}>
          {NAV.map(n => {
            const active = activeNav === n.label;
            return (
              <div key={n.label} onClick={() => setActiveNav(n.label)} style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:9, cursor:"pointer", marginBottom:2, background:active?"rgba(14,165,233,0.15)":"transparent", color:active?"#0ea5e9":"#64748b", fontWeight:active?600:400, fontSize:14, transition:"all 0.15s" }}>
                <span style={{ fontSize:16, opacity:active?1:0.6 }}>{n.icon}</span>
                {n.label}
                {active && <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"#0ea5e9", boxShadow:"0 0 8px #0ea5e9" }} />}
              </div>
            );
          })}
        </nav>
        <div style={{ padding:"10px 10px 16px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {[{ label:"Settings", icon:"⚙" },{ label:"Help", icon:"?" }].map(n => (
            <div key={n.label} style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:9, cursor:"pointer", color:"#475569", fontSize:14 }}>
              <span style={{ fontSize:15 }}>{n.icon}</span>{n.label}
            </div>
          ))}
        </div>
      </aside>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <header style={{ background:"rgba(15,23,42,0.85)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#475569", fontSize:14 }}>🔍</span>
            <input placeholder="Search...." style={{ border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"8px 14px 8px 34px", width:260, fontSize:13, color:"#f1f5f9", background:"rgba(255,255,255,0.05)" }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <div style={{ position:"relative", cursor:"pointer" }}>
              <span style={{ fontSize:20 }}>🔔</span>
              <span style={{ position:"absolute", top:-5, right:-5, background:"#ef4444", color:"#fff", borderRadius:"50%", width:17, height:17, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #0f172a", boxShadow:"0 0 8px rgba(239,68,68,0.6)" }}>
                {orders.filter(o=>o.priority==="High").length || 0}
              </span>
            </div>
            <div style={{ width:1, height:28, background:"rgba(255,255,255,0.08)" }} />
            <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, boxShadow:"0 2px 12px rgba(99,102,241,0.4)" }}>SC</div>
              <div>
                <p style={{ fontWeight:600, fontSize:14, color:txt.primary }}>Supply Chain</p>
                <p style={{ fontSize:12, color:txt.muted }}>Manager</p>
              </div>
              <span style={{ color:txt.muted, fontSize:12 }}>▾</span>
            </div>
          </div>
        </header>

        <main style={{ flex:1, overflowY:"auto", background:"transparent" }}>
          {activeNav==="Dashboard" && <DashboardHome stats={stats} shipments={shipments} warehouse={warehouse} orders={orders} suppliers={suppliers} supplierChartData={supplierChartData} />}
          {activeNav==="Shipments" && <ShipmentsPage />}
          {activeNav==="Inventory" && <InventoryPage />}
          {activeNav==="Suppliers" && <SuppliersPage />}
          {activeNav==="Orders"    && <OrdersPage />}
          {activeNav==="Reports"   && <ReportsPage />}
        </main>
      </div>
    </div>
  );
}