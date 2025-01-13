"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./style.css";

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState<
    { id: string; action: string; product: string; amount: number | null; timestamp: string }[]
  >([]);

  // Fetch all logs from Firestore
  const fetchLogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "InventoryAudit"));
      const fetchedLogs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          action: data.action || "Unknown",
          product: data.product || "Unknown",
          amount: data.amount || null,
          timestamp: data.timestamp || "Unknown",
        };
      });

      // Sort logs by timestamp in descending order
      const sortedLogs = fetchedLogs.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setLogs(sortedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  // Load logs on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="audit-logs-container">
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
                <td>{log.amount !== null ? log.amount : "-"}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
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
