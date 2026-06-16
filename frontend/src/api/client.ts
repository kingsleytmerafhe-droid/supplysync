import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export { BASE };

const api = axios.create({ baseURL: BASE });

export const getStats     = () => api.get("/api/stats").then(r => r.data);
export const getShipments = () => api.get("/api/shipments").then(r => r.data);
export const getWarehouse = () => api.get("/api/warehouse").then(r => r.data);
export const getOrders    = () => api.get("/api/orders").then(r => r.data);
export const getSuppliers = () => api.get("/api/suppliers").then(r => r.data);