import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000" });

export const getStats     = () => api.get("/api/stats").then(r => r.data);
export const getShipments = () => api.get("/api/shipments").then(r => r.data);
export const getWarehouse = () => api.get("/api/warehouse").then(r => r.data);
export const getOrders    = () => api.get("/api/orders").then(r => r.data);