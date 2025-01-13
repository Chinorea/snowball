"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css";

interface Voucher {
  VoucherID: string;
  Description: string;
  ExpiryDate: string;
  pointsOrPercent: number | 0;
  voucherType:string;
}

interface Reward {
  type: String;
  voucher: Voucher | null;
  amount: number;
}

interface Mission {
  id: string;
  title: string;
  details: string;
  completionDate: string;
  expiryDate: string;
  pointsWorth?: number;
  reward?: Reward;
  voucher?: Voucher | null;
  userId?: string;
  username?: string;
}

export const VoucherApprovalPage = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<Mission[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [newMission, setNewMission] = useState<Mission>({
    id: "",
    title: "",
    details: "",
    completionDate: "",
    expiryDate: "",
    
  });
  const [rewardType, setRewardType] = useState<"points" | "voucher">("points");
  const [showCreateMissionModal, setShowCreateMissionModal] = useState(false);
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

  const handleCreateMission = async () => {
    if (
      !newMission.title.trim() ||
      !newMission.details.trim() ||
      !newMission.completionDate.trim() ||
      !newMission.expiryDate.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const missionsCollectionRef = collection(db, "missions");
      await addDoc(missionsCollectionRef, {
        title: newMission.title,
        details: newMission.details,
        completionDate: newMission.completionDate,
        expiryDate: newMission.expiryDate,
        pointsWorth: rewardType === "points" ? newMission.pointsWorth : null,
        voucher: rewardType === "voucher" ? newMission.voucher : null,
      });

      alert("Mission created successfully!");
      setNewMission({
        id: "",
        title: "",
        details: "",
        completionDate: "",
        expiryDate: "",
      });
      setShowCreateMissionModal(false);
      fetchMissions();
    } catch (err) {
      console.error("Error creating mission:", err);
      alert("Failed to create mission. Please try again.");
    }
  };

  const handleRemoveMission = async (missionId: string) => {
    try {
      const missionRef = doc(db, "missions", missionId);
      await deleteDoc(missionRef);
      alert("Mission removed successfully!");
      fetchMissions();
    } catch (err) {
      console.error("Error removing mission:", err);
      alert("Failed to remove mission. Please try again.");
    }
  };

  const approveUserMission = async (userId: string, mission: Mission) => {
    try {
      // console.log(mission)
      // Reward the user
      if (mission.reward?.type == "points") {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { points: increment(mission.reward.amount) });
      } else if (mission.reward?.voucher) {
        const userVouchersRef = collection(db, "users", userId, "Vouchers");
        await addDoc(userVouchersRef, {
          VoucherID: mission.reward?.voucher?.VoucherID,
          Description: mission.reward?.voucher?.Description,
          ExpiryDate: mission.reward?.voucher?.ExpiryDate,
          PointORpercent: mission.reward?.voucher?.pointsOrPercent,
          voucherType: mission.reward?.voucher?.voucherType
        });
      }

      const missionLogsRef = collection(db, "users", userId, "missionlogs");
      await addDoc(missionLogsRef, {
        title: mission.title,
        details: mission.details,
        completionDate: mission.completionDate,
        expiryDate: mission.expiryDate,
        typeOfReward: mission.reward?.type,
        pointsEarned: mission.reward?.amount || null,
        voucherEarned: mission.reward?.voucher || null,
        approvedAt: new Date().toISOString(),
        userId,
        username: mission.username,
      });


      // Remove the mission from enrolled missions
      const enrolledMissionRef = doc(db, "users", userId, "enrolledMissions", mission.id);
      await deleteDoc(enrolledMissionRef);

      alert(`Mission approved and rewards granted to ${mission.username || "Unknown User"}!`);
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
        <button onClick={() => setShowCreateMissionModal(true)}>Add New Mission</button>
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
                <td>{mission.username || "Unknown User"}</td>
                <td>{mission.title}</td>
                <td>{mission.details}</td>
                <td>
                  {mission.reward?.type == "points"
                    ? `${mission.reward.amount} Points`
                    : mission.reward?.voucher?.Description || "N/A"}
                </td>
                <td>
                  <button onClick={() => approveUserMission(mission.userId!, mission)}>
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
              <th>Actions</th>
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
                <td>
                  <button onClick={() => handleRemoveMission(mission.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateMissionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Mission</h2>
            <div>
              <label>Title:</label>
              <input
                type="text"
                value={newMission.title}
                onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
              />
            </div>
            <div>
              <label>Details:</label>
              <textarea
                value={newMission.details}
                onChange={(e) => setNewMission({ ...newMission, details: e.target.value })}
              />
            </div>
            <div>
              <label>Completion Date:</label>
              <input
                type="date"
                value={newMission.completionDate}
                onChange={(e) =>
                  setNewMission({ ...newMission, completionDate: e.target.value })
                }
              />
            </div>
            <div>
              <label>Expiry Date:</label>
              <input
                type="date"
                value={newMission.expiryDate}
                onChange={(e) =>
                  setNewMission({ ...newMission, expiryDate: e.target.value })
                }
              />
            </div>
            <div>
              <label>Reward Type:</label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as "points" | "voucher")}
              >
                <option value="points">Points</option>
                <option value="voucher">Voucher</option>
              </select>
            </div>
            {rewardType === "points" && (
              <div>
                <label>Points Worth:</label>
                <input
                  type="number"
                  value={newMission.pointsWorth || ""}
                  onChange={(e) =>
                    setNewMission({ ...newMission, pointsWorth: Number(e.target.value) })
                  }
                />
              </div>
            )}
            {rewardType === "voucher" && (
              <div>
                <label>Select Voucher:</label>
                <select
                  value={newMission.voucher?.VoucherID || ""}
                  onChange={(e) =>
                    setNewMission({
                      ...newMission,
                      voucher: vouchers.find((v) => v.VoucherID === e.target.value) || null,
                    })
                  }
                >
                  <option value="">Select a Voucher</option>
                  {vouchers.map((voucher) => (
                    <option key={voucher.VoucherID} value={voucher.VoucherID}>
                      {voucher.Description}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={handleCreateMission}>Create Mission</button>
            <button onClick={() => setShowCreateMissionModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
