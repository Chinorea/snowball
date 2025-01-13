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
  pointsEarned: number;
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
        <div className="mission-logs-list">
          {missionLogs.map((log) => (
            <div key={log.id} className="mission-log-card">
              <h3>{log.title}</h3>
              <p>{log.details}</p>
              <p>
                <strong>Completion Date:</strong> {log.completionDate}
              </p>
              <p>
                <strong>Points Earned:</strong> {log.pointsEarned}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No mission logs found.</p>
      )}
    </div>
  );
};
