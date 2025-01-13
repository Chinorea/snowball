"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getCurrentUserEmail } from "../../userInfo";
import "./style.css";

interface MissionLog {
  id: string;
  title: string;
  details: string;
  completionDate: string;
  expiryDate: string;
  typeOfReward: string;
  pointsEarned?: number | null;
  voucherEarned?: {
    Description: string;
    ExpiryDate: string;
    VoucherID: string;
    pointsOrPercent: number;
    voucherType: string;
  } | null;
}

export const MissionLogsPage = () => {
  const [missionLogs, setMissionLogs] = useState<MissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = getCurrentUserEmail();

  useEffect(() => {
    const fetchMissionLogs = async () => {
      try {
        const logsCollectionRef = collection(db, "users", userId, "missionlogs");
        const logsSnapshot = await getDocs(logsCollectionRef);

        const fetchedLogs = logsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MissionLog[];

        setMissionLogs(fetchedLogs);
      } catch (error) {
        console.error("Error fetching mission logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissionLogs();
  }, [userId]);

  if (loading) {
    return <div>Loading mission logs...</div>;
  }

  return (
    <div className="mission-logs-container">
      <h1>Mission Logs</h1>
      {missionLogs.length > 0 ? (
        <ul className="mission-logs-list">
          {missionLogs.map((log) => (
            <li key={log.id} className="mission-log-item">
              <h3>{log.title}</h3>
              <p>{log.details}</p>
              <p>
                <strong>Completion Date:</strong> {log.completionDate}
              </p>
              <p>
                <strong>Expiry Date:</strong> {log.expiryDate}
              </p>
              {log.typeOfReward === "points" ? (
                <p>
                  <strong>Points Earned:</strong> {log.pointsEarned || 0}
                </p>
              ) : (
                log.voucherEarned && (
                  <div className="voucher-details">
                    <p>
                      <strong>Voucher Description:</strong> {log.voucherEarned.Description}
                    </p>
                    <p>
                      <strong>Voucher Expiry Date:</strong> {log.voucherEarned.ExpiryDate}
                    </p>
                    <p>
                      <strong>Voucher Type:</strong> {log.voucherEarned.voucherType}
                    </p>
                    <p>
                      <strong>Points or Percent:</strong> {log.voucherEarned.pointsOrPercent}
                    </p>
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No mission logs found.</p>
      )}
    </div>
  );
};
