"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getCurrentUserEmail } from "../userInfo";
import "./style.css";
import { useRouter } from "next/navigation";

interface PreorderItem {
  id: string;
  productName: string;
  quantity: number;
  totalPoints: number;
  status: string; // Add status field
}

export const PreorderList = () => {
  const [preorders, setPreorders] = useState<PreorderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserEmail = getCurrentUserEmail();
  const router = useRouter();

  useEffect(() => {
    fetchPreorders();
  }, []);

  // Fetch preorders from Firestore under the current user's document
  const fetchPreorders = async () => {
    setLoading(true);
    try {
      if (!currentUserEmail) {
        router.push("/"); // Redirect to home if user is not logged in
        return;
      }

      const preordersRef = collection(db, "users", currentUserEmail, "Preorders");
      const preordersSnapshot = await getDocs(preordersRef);

      const fetchedPreorders = preordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        productName: doc.data().productName,
        quantity: doc.data().quantity,
        totalPoints: doc.data().totalPoints,
        status: doc.data().status || "Unknown", // Default to "Unknown" if status is missing
      }));

      setPreorders(fetchedPreorders);
    } catch (err) {
      console.error("Error fetching preorders:", err);
      setError("Failed to fetch preorders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="preorder-container">
      <h1 className="preorder-header">Pre-orders</h1>

      {/* Display Existing Pre-orders */}
      <div className="preorder-list">
        <h2>Existing Pre-orders</h2>
        {preorders.length > 0 ? (
          <table className="preorder-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Total Points</th>
                <th>Status</th> {/* Add status column */}
              </tr>
            </thead>
            <tbody>
              {preorders.map((preorder) => (
                <tr key={preorder.id}>
                  <td>{preorder.productName}</td>
                  <td>{preorder.quantity}</td>
                  <td>{preorder.totalPoints}</td>
                  <td>{preorder.status}</td> {/* Display status */}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No pre-orders found.</p>
        )}
      </div>
    </div>
  );
};
