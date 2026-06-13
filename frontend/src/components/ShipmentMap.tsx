import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

const ROUTES = [
  {
    id:"SHP-001", product:"GYM Equipment", status:"on_time",
    origin:      { lat:32.7767, lng:-96.7970, name:"Dallas, TX"   },
    destination: { lat:40.5187, lng:-74.4121, name:"Edison, NJ"   },
  },
  {
    id:"SHP-002", product:"Electronics", status:"delayed",
    origin:      { lat:41.8781, lng:-87.6298, name:"Chicago, IL"  },
    destination: { lat:40.7128, lng:-74.0060, name:"New York, NY" },
  },
  {
    id:"SHP-003", product:"Furniture", status:"on_time",
    origin:      { lat:29.7604, lng:-95.3698, name:"Houston, TX"  },
    destination: { lat:42.3601, lng:-71.0589, name:"Boston, MA"   },
  },
];

const MAP_STYLE = [
  { featureType:"poi",            elementType:"labels",            stylers:[{ visibility:"off" }] },
  { featureType:"transit",        elementType:"labels",            stylers:[{ visibility:"off" }] },
  { featureType:"water",          elementType:"geometry",          stylers:[{ color:"#dbeafe"   }] },
  { featureType:"landscape",      elementType:"geometry",          stylers:[{ color:"#f8fafc"   }] },
  { featureType:"road",           elementType:"geometry",          stylers:[{ color:"#e2e8f0"   }] },
  { featureType:"road.highway",   elementType:"geometry",          stylers:[{ color:"#94a3b8"   }] },
];

export default function ShipmentMap() {
  const [selected, setSelected] = useState<any>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY ?? "",
  });

  if (!isLoaded) return (
    <div style={{ height:400, display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", borderRadius:10, color:"#6b7280", fontSize:14 }}>
      🗺️ Loading map...
    </div>
  );

  return (
    <GoogleMap
      mapContainerStyle={{ width:"100%", height:400, borderRadius:10, overflow:"hidden" }}
      center={{ lat:37.5, lng:-92 }}
      zoom={4}
      options={{
        styles:              MAP_STYLE,
        zoomControl:         true,
        streetViewControl:   false,
        mapTypeControl:      false,
        fullscreenControl:   true,
      }}
    >
      {ROUTES.map(route => {
        const color = route.status === "delayed" ? "#ef4444" : "#22c55e";
        return (
          <div key={route.id}>

            {/* Animated route line */}
            <Polyline
              path={[route.origin, route.destination]}
              options={{
                strokeColor:   color,
                strokeWeight:  3,
                strokeOpacity: 0.75,
                geodesic:      true,
              }}
            />

            {/* Origin dot — blue */}
            <Marker
              position={route.origin}
              onClick={() => setSelected({ ...route, point:route.origin, type:"Origin" })}
              icon={{
                path:        window.google.maps.SymbolPath.CIRCLE,
                scale:       9,
                fillColor:   "#3b82f6",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight:2.5,
              }}
            />

            {/* Destination dot — green or red */}
            <Marker
              position={route.destination}
              onClick={() => setSelected({ ...route, point:route.destination, type:"Destination" })}
              icon={{
                path:        window.google.maps.SymbolPath.CIRCLE,
                scale:       9,
                fillColor:   color,
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight:2.5,
              }}
            />
          </div>
        );
      })}

      {/* Popup on click */}
      {selected && (
        <InfoWindow
          position={selected.point}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ fontFamily:"Inter, sans-serif", padding:"6px 8px", minWidth:180 }}>
            <p style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>📦 {selected.product}</p>
            <p style={{ fontSize:12, color:"#6b7280", marginBottom:2 }}>
              🔵 {selected.origin.name}
            </p>
            <p style={{ fontSize:12, color:"#6b7280", marginBottom:8 }}>
              ➡ {selected.destination.name}
            </p>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{
                fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10,
                background: selected.status==="delayed" ? "#fef2f2" : "#f0fdf4",
                color:      selected.status==="delayed" ? "#ef4444" : "#22c55e",
              }}>
                {selected.status==="delayed" ? "⚠ Delayed" : "✓ On Time"}
              </span>
              <span style={{ fontSize:11, color:"#9ca3af" }}>{selected.id}</span>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}