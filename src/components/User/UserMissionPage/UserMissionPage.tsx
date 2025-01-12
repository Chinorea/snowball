"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css";
import { getCurrentUserEmail } from "../userInfo";

interface Mission {
  id: string;
  title: string;
  details: string;
  completionDate: string;
  expiryDate: string;
  pointsWorth: number;
  status?: string; // Status field (optional for enrolled missions)
}

export const UserMissionPage = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [enrolledMissions, setEnrolledMissions] = useState<Mission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userId = getCurrentUserEmail(); // Replace with actual user ID logic

  useEffect(() => {
    fetchMissions();
    fetchEnrolledMissions();
  }, []);

  // Fetch available missions from Firestore
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

  // Fetch enrolled missions for the user from Firestore
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

  // Enroll user into a mission with "pending" status
  const handleEnroll = async (mission: Mission) => {
    try {
      const enrolledCollectionRef = collection(db, "users", userId, "enrolledMissions");
      await addDoc(enrolledCollectionRef, {
        title: mission.title,
        details: mission.details,
        completionDate: mission.completionDate,
        expiryDate: mission.expiryDate,
        pointsWorth: mission.pointsWorth,
        status: "pending", // Add status field with default value "pending"
      });
  
      alert(`Enrolled in mission: ${mission.title}`);
      fetchEnrolledMissions(); // Refresh enrolled missions
    } catch (err) {
      console.error("Error enrolling in mission:", err);
      alert("Failed to enroll in mission. Please try again.");
    }
  };
  

  // Filter available missions to exclude already enrolled missions
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
      {/* Enrolled Missions Section */}
      <div className="enrolled-missions-section">
        <h2>Enrolled Missions</h2>
        {enrolledMissions.length > 0 ? (
          <div className="enrolled-missions-grid">
            {enrolledMissions.map((mission) => (
              <div key={mission.id} className="mission-card enrolled">
                <h3>{mission.title}</h3>
                <p>{mission.details}</p>
                <p>
                  <strong>Completion Date:</strong> {mission.completionDate}
                </p>
                <p>
                  <strong>Points Worth:</strong> {mission.pointsWorth}
                </p>
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

      {/* Available Missions Section */}
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
                <p>
                  <strong>Points Worth:</strong> {mission.pointsWorth}
                </p>
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
