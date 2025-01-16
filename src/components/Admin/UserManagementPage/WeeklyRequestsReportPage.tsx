"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css"; // Ensure the styles are applied

export const WeeklyRequestsReportPage = () => {
  const [weeklyRequests, setWeeklyRequests] = useState<
    { id: string; name: string; amount: number; timestamp: Date }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeeklyRequests = async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Calculate the date one week ago

      try {
        const requestedProductRef = collection(db, "Requested Product");
        const weeklyQuery = query(
          requestedProductRef,
          where("timestamp", ">=", Timestamp.fromDate(oneWeekAgo))
        );

        const snapshot = await getDocs(weeklyQuery);

        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().Name, // Name of the product
          amount: doc.data().Amount, // Amount requested
          timestamp: doc.data().timestamp.toDate(), // Convert Firestore Timestamp to JavaScript Date
        }));

        setWeeklyRequests(requests);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching weekly requests:", err);
        setError("Failed to load the weekly requests report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyRequests();
  }, []);

  if (loading) {
    return <div>Loading Weekly Requests Report...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="weekly-requests-container">
      <h1>Weekly Requests Report</h1>
      {weeklyRequests.length > 0 ? (
        <table className="weekly-requests-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Amount</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {weeklyRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.name}</td>
                <td>{request.amount}</td>
                <td>{new Date(request.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No requests found in the past week.</p>
      )}
    </div>
  );
};

export default WeeklyRequestsReportPage;
