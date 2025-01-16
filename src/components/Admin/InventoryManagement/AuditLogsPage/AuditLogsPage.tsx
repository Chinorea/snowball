"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/firebase/firebaseConfig"; // Ensure auth is imported
import { collection, getDocs, Timestamp, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./style.css";
import { FirebaseError } from "firebase/app";

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState<
    { id: string; action: string; product: string; amount: number | string; timestamp: Date | string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const logsQuery = query(collection(db, "InventoryAudit"), orderBy("timestamp", "desc"), limit(50));
      const querySnapshot = await getDocs(logsQuery);
  
      const fetchedLogs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          action: data.action || "No action specified",
          product: data.product || "Unnamed product",
          amount: typeof data.amount === "number" ? data.amount : "N/A",
          timestamp: data.timestamp instanceof Timestamp
            ? data.timestamp.toDate()
            : data.timestamp
            ? new Date(data.timestamp)
            : "Unknown", // Fallback for missing/invalid timestamps
        };
      });
  
      setLogs(fetchedLogs);
    } catch (error: unknown) {
      console.error("Error fetching logs:", error);
  
      if (error instanceof FirebaseError) {
        if (error.code === "permission-denied") {
          setError("You do not have permission to access these logs.");
        } else {
          setError("Failed to load logs. Please try again later.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchLogs();
      } else {
        console.warn("User is logged out");
        setError("You must be logged in to view audit logs.");
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading logs...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="audit-logs-container">
      <h1>Audit Logs</h1>
      <table className="audit-logs-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Action</th>
            <th>Amount</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log.id}>
                <td>{log.product}</td>
                <td>{log.action}</td>
                <td>{log.amount}</td>
                <td>{log.timestamp !== "Unknown" ? new Date(log.timestamp).toLocaleString() : "Unknown"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="empty-message">
                No logs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
