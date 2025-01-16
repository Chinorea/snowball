"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css"; // Add styles as needed

export const InventorySummaryReport = () => {
  const [inventory, setInventory] = useState<
    { name: string; pointsRequired: number; stock: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const productsRef = collection(db, "Products");
        const snapshot = await getDocs(productsRef);

        const products = snapshot.docs.map((doc) => ({
          name: doc.id, // Document ID as the product name
          pointsRequired: doc.data().PointsRequired || 0,
          stock: doc.data().Stock || 0,
        }));

        setInventory(products);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load the inventory summary report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) {
    return <div>Loading Inventory Summary Report...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="inventory-summary-container">
      <h1>Inventory Summary Report</h1>
      {inventory.length > 0 ? (
        <table className="inventory-summary-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Stock Quantity</th>
              <th>Points Required</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.stock}</td>
                <td>{item.pointsRequired}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No inventory data available.</p>
      )}
    </div>
  );
};

