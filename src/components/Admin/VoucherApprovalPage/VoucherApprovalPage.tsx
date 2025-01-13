"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css";

interface Voucher {
  VoucherID: string;
  Description: string;
  ExpiryDate: string;
}

interface Mission {
  id: string;
  title: string;
  details: string;
  completionDate: string;
  expiryDate: string;
  pointsWorth?: number;
  voucher?: Voucher | null;
  userId?: string;
  username?: string;
  status?: string;
}

export const VoucherApprovalPage = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<Mission[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions();
    fetchUserMissions();
    fetchVouchers();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMissions = async () => {
    try {
      const usersCollectionRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);

      const fetchedUserMissions: Mission[] = [];
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const username = userData.username || "Unknown User";

        const enrolledMissionsRef = collection(db, "users", userId, "enrolledMissions");
        const enrolledSnapshot = await getDocs(enrolledMissionsRef);

        enrolledSnapshot.forEach((enrolledDoc) => {
          fetchedUserMissions.push({
            id: enrolledDoc.id,
            userId,
            username,
            ...enrolledDoc.data(),
          } as Mission);
        });
      }

      setUserMissions(fetchedUserMissions);
    } catch (err) {
      console.error("Error fetching user missions:", err);
      setError("Failed to fetch user missions. Please try again later.");
    }
  };

  const fetchVouchers = async () => {
    try {
      const vouchersCollectionRef = collection(db, "vouchers");
      const vouchersSnapshot = await getDocs(vouchersCollectionRef);
      const fetchedVouchers = vouchersSnapshot.docs.map((doc) => ({
        VoucherID: doc.id,
        ...doc.data(),
      })) as Voucher[];
      setVouchers(fetchedVouchers);
    } catch (err) {
      console.error("Error fetching vouchers:", err);
    }
  };

  const approveUserMission = async (userId: string, mission: Mission) => {
    try {
      // Reward the user
      if (mission.pointsWorth) {
        // Update the user's points
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { points: increment(mission.pointsWorth) });
      } else if (mission) {
        // Add the voucher to the user's Vouchers collection
        const userVouchersRef = collection(db, "users", userId, "Vouchers");
        await addDoc(userVouchersRef, {
          Description: mission.title,
          ExpiryDate: mission.expiryDate,
          VoucherID: mission.id
        });
      }


      // Add the mission to the user's mission logs
      const missionLogsRef = collection(db, "users", userId, "missionlogs");
      await addDoc(missionLogsRef, {
        title: mission.title,
        details: mission.details,
        completionDate: mission.completionDate,
        expiryDate: mission.expiryDate,
        pointsEarned: mission.pointsWorth || null,
        voucherEarned: mission.voucher || null,
        approvedAt: new Date().toISOString(),
      });

      // Remove the mission from the enrolledMissions
      const enrolledMissionRef = doc(db, "users", userId, "enrolledMissions", mission.id);
      await deleteDoc(enrolledMissionRef);

      alert("Mission approved and rewards granted!");
      fetchUserMissions();
    } catch (err) {
      console.error("Error approving mission:", err);
      alert("Failed to approve mission. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mission-management-container">
      <div className="header-with-button">
        <h1>Voucher Approval - Mission Management</h1>
      </div>

      <div className="user-missions-section">
        <h2>User-Enrolled Missions</h2>
        <table className="missions-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Title</th>
              <th>Details</th>
              <th>Reward</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userMissions.map((mission) => (
              <tr key={mission.id}>
                <td>{mission.username}</td>
                <td>{mission.title}</td>
                <td>{mission.details}</td>
                <td>
                  {mission.pointsWorth
                    ? `${mission.pointsWorth} Points`
                    : mission.voucher?.Description || "N/A"}
                </td>
                <td>
                  <button
                    onClick={() => approveUserMission(mission.userId!, mission)}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="existing-missions-section">
        <h2>Existing Missions</h2>
        <table className="missions-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Details</th>
              <th>Completion Date</th>
              <th>Expiry Date</th>
              <th>Reward</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => (
              <tr key={mission.id}>
                <td>{mission.title}</td>
                <td>{mission.details}</td>
                <td>{mission.completionDate}</td>
                <td>{mission.expiryDate}</td>
                <td>
                  {mission.pointsWorth
                    ? `${mission.pointsWorth} Points`
                    : mission.voucher?.Description || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
