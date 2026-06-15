from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd
import os
import subprocess

app = FastAPI(title="SupplySync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-create database if it doesn't exist
if not os.path.exists("supplysync.db"):
    print("🔄 Database not found — running pipeline...")
    subprocess.run(["python", "data/pipeline.py"])
    print("✅ Database created!")

DB = "supplysync.db"

def query(sql):
    conn = sqlite3.connect(DB)
    df = pd.read_sql(sql, conn)
    conn.close()
    return df

@app.get("/")
def root():
    return {"message": "SupplySync API is running!"}

@app.get("/api/stats")
def get_stats():
    df = query("SELECT * FROM shipments")
    total        = len(df)
    delayed      = int(df["is_delayed"].sum())
    on_time      = total - delayed
    on_time_rate = round(on_time / total * 100, 1)
    total_value  = round(df["total_cost"].sum(), 2)
    pending      = len(df[df["delivery_status"].str.lower() == "pending"])
    return {
        "active_shipments":  total,
        "low_stock_items":   delayed,
        "supplier_rating":   round(on_time_rate / 20, 1),
        "pending_approvals": pending,
        "total_value":       total_value,
        "on_time_rate":      on_time_rate,
    }

@app.get("/api/shipments")
def get_shipments():
    df = query("SELECT * FROM shipments LIMIT 20")
    results = []
    for _, row in df.iterrows():
        results.append({
            "id":          row["order_id"],
            "product":     row["product"],
            "origin":      row["warehouse_location"],
            "destination": row["logistics_partner"],
            "status":      "delayed" if row["is_delayed"] else "on_time",
            "method":      row["shipping_method"],
            "value":       row["total_cost"],
            "date":        row["delivery_date"],
        })
    return results

@app.get("/api/warehouse")
def get_warehouse():
    df = query("SELECT * FROM warehouse")
    results = []
    for _, row in df.iterrows():
        stock    = int(row["total_items"])
        capacity = stock + 20
        pct      = stock / capacity * 100
        status   = "Optimal" if pct < 80 else "Overstocked" if pct > 95 else "Low"
        results.append({
            "category": row["warehouse_location"],
            "stock":    stock,
            "capacity": capacity,
            "status":   status,
        })
    return results

@app.get("/api/suppliers")
def get_suppliers():
    df = query("SELECT * FROM suppliers ORDER BY total_orders DESC")
    return df.to_dict(orient="records")

@app.get("/api/orders")
def get_orders():
    df = query("SELECT * FROM shipments WHERE delivery_status = 'Pending' LIMIT 10")
    results = []
    for _, row in df.iterrows():
        results.append({
            "id":        row["order_id"],
            "supplier":  row["supplier"],
            "items":     int(row["quantity"]),
            "value":     float(row["total_cost"]),
            "priority":  "High" if row["is_delayed"] else "Normal",
            "requester": row["logistics_partner"],
        })
    return results