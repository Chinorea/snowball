"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css";

interface Mission {
  id: string;
  title: string;
  details: string;
  completionDate: string;
  expiryDate: string;
  pointsWorth: number;
  userId?: string; // User ID if the mission is enrolled by a user
  username?: string; // Username of the user
  status?: string; // Status of the mission (e.g., "Pending", "Approved", "Rejected")
}

export const VoucherApprovalPage = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState({
    title: "",
    details: "",
    completionDate: "",
    expiryDate: "",
    pointsWorth: 0,
  });
  const [showCreateMissionModal, setShowCreateMissionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions();
    fetchUserMissions();
  }, []);

  // Fetch existing missions from Firestore
  const fetchMissions = async () => {
    setLoading(true);
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

  // Fetch user-enrolled missions from Firestore
  const fetchUserMissions = async () => {
    try {
        const usersCollectionRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollectionRef);

        const fetchedUserMissions: Mission[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data(); // Fetch user data, including username
            const username = userData.username || "Unknown User";

            const enrolledMissionsRef = collection(db, "users", userId, "enrolledMissions");
            const enrolledSnapshot = await getDocs(enrolledMissionsRef);

            enrolledSnapshot.forEach((enrolledDoc) => {
                fetchedUserMissions.push({
                    id: enrolledDoc.id, // Use the correct enrolled mission ID
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

    const updateUserMissionStatus = async (
        userId: string,
        enrolledMissionId: string, // Correctly named variable
        newStatus: string
      ) => {
        try {
          const missionDocRef = doc(db, "users", userId, "enrolledMissions", enrolledMissionId);
      
          if (newStatus === "Approved") {
            // Delete the document from Firestore if status is Approved
            await deleteDoc(missionDocRef);
            alert("Mission approved and removed from enrolled missions.");
          } else {
            // Update the status if not approved
            await updateDoc(missionDocRef, { status: newStatus });
            alert(`Mission status updated to ${newStatus}`);
          }
      
          fetchUserMissions(); // Refresh the list of user missions
        } catch (err) {
          console.error("Error updating mission status:", err);
          alert("Failed to update mission status. Please try again.");
        }
      };
      


  // Add a new mission to Firestore
  const handleCreateMission = async () => {
    if (!newMission.title.trim() || !newMission.details.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (newMission.pointsWorth <= 0) {
      alert("Points worth must be greater than zero.");
      return;
    }

    try {
      const missionsCollectionRef = collection(db, "missions");

      await addDoc(missionsCollectionRef, {
        title: newMission.title,
        details: newMission.details,
        completionDate: newMission.completionDate,
        expiryDate: newMission.expiryDate,
        pointsWorth: newMission.pointsWorth,
      });

      alert("Mission created successfully!");
      setNewMission({
        title: "",
        details: "",
        completionDate: "",
        expiryDate: "",
        pointsWorth: 0,
      });
      setShowCreateMissionModal(false); // Close the modal
      fetchMissions(); // Refresh missions list
    } catch (err) {
      console.error("Error creating mission:", err);
      alert("Failed to create mission. Please try again.");
    }
  };

  

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="mission-management-container">
      <div className="header-with-button">
        <h1 className="mission-management-header">
          Voucher Approval - Mission Management
        </h1>
        <button
          className="create-mission-button"
          onClick={() => setShowCreateMissionModal(true)}
        >
          Add New Mission
        </button>
      </div>

      {/* User Missions */}
      <div className="user-missions-section">
        <h2>User-Enrolled Missions</h2>
        {userMissions.length > 0 ? (
          <table className="missions-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Title</th>
                <th>Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {userMissions.map((mission) => (
                <tr key={mission.id}>
                    <td>{mission.username}</td>
                    <td>{mission.title}</td>
                    <td>{mission.details}</td>
                    <td>{mission.status || "Pending"}</td>
                    <td>
                        {mission.status !== "Approved" && (
                            <button
                                onClick={() =>
                                    updateUserMissionStatus(mission.userId!, mission.id, "Approved")
                                }
                                className="approve-button"
                            >
                                Approve
                            </button>
                        )}
                    </td>
                </tr>
            ))}

            </tbody>
          </table>
        ) : (
          <p>No user-enrolled missions found.</p>
        )}
      </div>

      {/* Existing Missions */}
      <div className="existing-missions-section">
        <h2>Existing Missions</h2>
        {missions.length > 0 ? (
          <table className="missions-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Details</th>
                <th>Completion Date</th>
                <th>Expiry Date</th>
                <th>Points Worth</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((mission) => (
                <tr key={mission.id}>
                  <td>{mission.title}</td>
                  <td>{mission.details}</td>
                  <td>{mission.completionDate}</td>
                  <td>{mission.expiryDate}</td>
                  <td>{mission.pointsWorth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-missions">No missions found.</p>
        )}
      </div>

      {/* Create Mission Modal */}
      {showCreateMissionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create a New Mission</h2>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={newMission.title}
                onChange={(e) =>
                  setNewMission({ ...newMission, title: e.target.value })
                }
                placeholder="Mission Title"
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Details:</label>
              <textarea
                value={newMission.details}
                onChange={(e) =>
                  setNewMission({ ...newMission, details: e.target.value })
                }
                placeholder="Mission Details"
                className="textarea-field"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Completion Date:</label>
              <input
                type="date"
                value={newMission.completionDate}
                onChange={(e) =>
                  setNewMission({ ...newMission, completionDate: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Expiry Date:</label>
              <input
                type="date"
                value={newMission.expiryDate}
                onChange={(e) =>
                  setNewMission({ ...newMission, expiryDate: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Points Worth:</label>
              <input
                type="number"
                value={newMission.pointsWorth}
                onChange={(e) =>
                  setNewMission({
                    ...newMission,
                    pointsWorth: Number(e.target.value),
                  })
                }
                placeholder="Points Worth"
                className="input-field"
                min="1"
              />
            </div>
            <div className="modal-buttons">
              <button
                onClick={handleCreateMission}
                className="modal-create-button"
              >
                Create Mission
              </button>
              <button
                onClick={() => setShowCreateMissionModal(false)}
                className="modal-cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
