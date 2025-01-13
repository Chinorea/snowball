"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css";

interface PreorderItem {
  id: string;
  userId: string;
  productName: string;
  quantity: number;
  totalPoints: number;
  status: string;
}

export const PreorderReqPage = () => {
  const [preorders, setPreorders] = useState<PreorderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPreorders();
  }, []);

  // Fetch all preorders from Firestore for all users
  const fetchAllPreorders = async () => {
    setLoading(true);
    try {
      const usersCollectionRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);

      const allPreorders: PreorderItem[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const preordersRef = collection(db, "users", userId, "Preorders");
        const preordersSnapshot = await getDocs(preordersRef);

        preordersSnapshot.forEach((doc) => {
          const preorder = doc.data();
          allPreorders.push({
            id: doc.id,
            userId,
            productName: preorder.productName,
            quantity: preorder.quantity,
            totalPoints: preorder.totalPoints,
            status: preorder.status || "Pending",
          });
        });
      }

      setPreorders(allPreorders);
    } catch (err) {
      console.error("Error fetching preorders:", err);
      setError("Failed to fetch preorders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const updatePreorderStatus = async (
    userId: string,
    preorderId: string,
    newStatus: string
  ) => {
    try {
      const preorderDocRef = doc(
        db,
        "users",
        userId,
        "Preorders",
        preorderId
      );

      // Handle points return if status is "Rejected"
      if (newStatus === "Rejected") {
        const preorder = preorders.find(
          (item) => item.id === preorderId && item.userId === userId
        );

        if (preorder) {
          const userDocRef = doc(db, "users", userId);

          // Increment user points
          await updateDoc(userDocRef, {
            points: increment(preorder.totalPoints),
          });

          alert(
            `Preorder rejected and ${preorder.totalPoints} points returned to the user.`
          );
        }
      }

      // Update preorder status
      await updateDoc(preorderDocRef, { status: newStatus });

      alert(`Preorder status updated to ${newStatus}`);
      fetchAllPreorders();
    } catch (err) {
      console.error("Error updating preorder status:", err);
      alert("Failed to update preorder status. Please try again.");
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
      <h1 className="preorder-header">Manage User Pre-orders</h1>

      <div className="preorder-list">
        {preorders.length > 0 ? (
          <table className="preorder-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Total Points</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {preorders.map((preorder) => (
                <tr key={preorder.id}>
                  <td>{preorder.userId}</td>
                  <td>{preorder.productName}</td>
                  <td>{preorder.quantity}</td>
                  <td>{preorder.totalPoints}</td>
                  <td>{preorder.status}</td>
                  <td>
                    {preorder.status === "Pending" && (
                      <>
                        <button
                          className="action-button approve"
                          onClick={() =>
                            updatePreorderStatus(
                              preorder.userId,
                              preorder.id,
                              "Approved"
                            )
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="action-button reject"
                          onClick={() =>
                            updatePreorderStatus(
                              preorder.userId,
                              preorder.id,
                              "Rejected"
                            )
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {preorder.status === "Approved" && (
                      <button
                        className="action-button fulfill"
                        onClick={() =>
                          updatePreorderStatus(
                            preorder.userId,
                            preorder.id,
                            "Fulfilled"
                          )
                        }
                      >
                        Fulfill
                      </button>
                    )}
                  </td>
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
