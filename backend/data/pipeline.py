import pandas as pd
import sqlite3
import os

DB_PATH = "supplysync.db"
CSV_PATH = "data/raw/Supply_Chain___Logistics_Dataset.csv"

def run_pipeline():
    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH)

    # Clean column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    # Add is_delayed column
    df["is_delayed"] = df["delivery_status"].str.lower().str.contains("delay").astype(int)

    # Add order_id
    df["order_id"] = ["ORD-" + str(1000 + i) for i in range(len(df))]

    print("Columns:", df.columns.tolist())
    print("Rows:", len(df))
    print("Sample:\n", df.head(3))

    # Save to SQLite
    conn = sqlite3.connect(DB_PATH)
    df.to_sql("shipments", conn, if_exists="replace", index=False)

    # Create warehouse summary
    warehouse = df.groupby("warehouse_location").agg(
        total_items=("quantity", "sum"),
        total_value=("total_cost", "sum"),
        delayed_count=("is_delayed", "sum"),
    ).reset_index()
    warehouse.to_sql("warehouse", conn, if_exists="replace", index=False)

    # Create supplier summary
    suppliers = df.groupby("supplier").agg(
        total_orders=("order_id", "count"),
        delayed_orders=("is_delayed", "sum"),
        total_value=("total_cost", "sum"),
        avg_unit_price=("unit_price", "mean"),
    ).reset_index()
    suppliers["on_time_rate"] = (
        (suppliers["total_orders"] - suppliers["delayed_orders"]) / suppliers["total_orders"] * 100
    ).round(1)
    suppliers.to_sql("suppliers", conn, if_exists="replace", index=False)

    conn.close()
    print("✅ Database created at:", DB_PATH)
    print(f"   → {len(df)} shipments loaded")
    print(f"   → {len(warehouse)} warehouse locations")
    print(f"   → {len(suppliers)} suppliers")

if __name__ == "__main__":
    run_pipeline()