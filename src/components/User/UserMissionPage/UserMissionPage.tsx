"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation"; // For navigation
import "./style.css";
import { getCurrentUserEmail } from "../userInfo";

interface Voucher {
  VoucherID: string;
  Description: string;
  ExpiryDate: string;
  pointsORpecent: number | 0;
  voucherType:string;
}

interface Reward {
  type: "points" | "voucher";
  amount?: number; // For points
  voucher?: Voucher; // For vouchers
}

interface Mission {
  id: string;
  title: string;
  details: string;
  completionDate: string;
  expiryDate: string;
  pointsWorth?: number;
  voucher?: Voucher | null;
  reward?: Reward; // Add reward property
  status?: string; // Status field (optional for enrolled missions)
}

export const UserMissionPage = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [enrolledMissions, setEnrolledMissions] = useState<Mission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userId = getCurrentUserEmail();
  const router = useRouter();

  useEffect(() => {
    fetchMissions();
    fetchEnrolledMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const missionsCollectionRef = collection(db, "missions");
      const missionsSnapshot = await getDocs(missionsCollectionRef);

      const fetchedMissions = missionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Mission[];

      setMissions(fetchedMissions);
    } catch (err) {
      console.error("Error fetching missions:", err);
      setError("Failed to fetch missions. Please try again later.");
    }
  };

  const fetchEnrolledMissions = async () => {
    try {
      const enrolledCollectionRef = collection(db, "users", userId, "enrolledMissions");
      const enrolledSnapshot = await getDocs(enrolledCollectionRef);

      const fetchedEnrolled = enrolledSnapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as Mission[];

      setEnrolledMissions(fetchedEnrolled);
    } catch (err) {
      console.error("Error fetching enrolled missions:", err);
      setError("Failed to fetch enrolled missions. Please try again later.");
    }
  };

  const handleEnroll = async (mission: Mission) => {
    try {
      const enrolledCollectionRef = collection(db, "users", userId, "enrolledMissions");

      const reward = mission.pointsWorth
        ? { type: "points", amount: mission.pointsWorth }
        : {
            type: "voucher",
            voucher: {
              VoucherID: mission.voucher?.VoucherID,
              Description: mission.voucher?.Description,
              ExpiryDate: mission.voucher?.ExpiryDate,
              pointsOrPercent: mission.voucher?.pointsORpecent,
              voucherType: mission.voucher?.voucherType
            },
          };
        console.log(reward)

      await addDoc(enrolledCollectionRef, {
        title: mission.title,
        details: mission.details,
        completionDate: mission.completionDate,
        expiryDate: mission.expiryDate,
        reward,
        status: "pending",
      });

      alert(`Enrolled in mission: ${mission.title}`);
      fetchEnrolledMissions();
    } catch (err) {
      console.error("Error enrolling in mission:", err);
      alert("Failed to enroll in mission. Please try again.");
    }
  };

  const availableMissions = missions.filter(
    (mission) =>
      !enrolledMissions.some(
        (enrolled) =>
          enrolled.title === mission.title &&
          enrolled.completionDate === mission.completionDate &&
          enrolled.expiryDate === mission.expiryDate
      )
  );

  return (
    <div className="mission-page-container">
      <div className="enrolled-missions-section">
        <div className="enrolled-missions-header">
          <h2>Enrolled Missions</h2>
          <button
            className="mission-logs-button"
            onClick={() => router.push("/Mission/MissionLog")}
          >
            Mission Logs
          </button>
        </div>
        {enrolledMissions.length > 0 ? (
          <div className="enrolled-missions-grid">
            {enrolledMissions.map((mission, index) => (
              <div key={index} className="mission-card enrolled">
                <h3>{mission.title}</h3>
                <p>{mission.details}</p>
                <p>
                  <strong>Completion Date:</strong> {mission.completionDate}
                </p>
                {mission.reward?.type === "points" ? (
                  <p>
                    <strong>Points Worth:</strong> {mission.reward.amount}
                  </p>
                ) : (
                  <p>
                    <strong>Voucher:</strong> {mission.reward?.voucher?.Description}
                  </p>
                )}
                <p>
                  <strong>Status:</strong> {mission.status || "N/A"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No enrolled missions yet.</p>
        )}
      </div>

      <div className="available-missions-section">
        <h2>Available Missions</h2>
        {availableMissions.length > 0 ? (
          <div className="available-missions-grid">
            {availableMissions.map((mission) => (
              <div key={mission.id} className="mission-card available">
                <h3>{mission.title}</h3>
                <p>{mission.details}</p>
                <p>
                  <strong>Completion Date:</strong> {mission.completionDate}
                </p>
                {mission.pointsWorth ? (
                  <p>
                    <strong>Points Worth:</strong> {mission.pointsWorth}
                  </p>
                ) : (
                  <p>
                    <strong>Voucher:</strong> {mission.voucher?.Description}
                  </p>
                )}
                <button
                  onClick={() => handleEnroll(mission)}
                  className="enroll-button"
                >
                  Enroll
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No available missions.</p>
        )}
      </div>
    </div>
  );
};
