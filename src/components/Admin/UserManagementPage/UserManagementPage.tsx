"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Ensure your Firebase configuration is set up
import "./style.css"; // Include the CSS file

interface User {
  id: string;
  username: string;
  email: string;
  phone: string; // Add phone field
  points: number;
  status: string;
  usertype: string;
}

export const UserManagementPage = () => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "", // Initialize phone field
    points: 0,
  });
  const [userType, setUserType] = useState("user"); // Default to "user"
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userCollectionRef = collection(db, "users");
      const userSnapshot = await getDocs(userCollectionRef);

      const fetchedUsers = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add a new user
  const addUser = async (usertype: string) => {
    try {
      const userCollectionRef = collection(db, "users");
      const customId = newUser.email; // Assuming email is unique
      const newUserRef = doc(userCollectionRef, customId);

      await setDoc(newUserRef, {
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone, // Add phone field here
        points: newUser.points,
        status: "Active",
        usertype: usertype,
      });

      setNewUser({ username: "", email: "", phone: "", points: 0 }); // Reset phone field
      setUserType("user");
      fetchUsers();
      alert("User added successfully!");
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user. Please try again.");
    }
  };

  // Handle form submission for new user
  const handleAddUser = () => {
    if (newUser.username && newUser.email && newUser.phone && newUser.points) {
      addUser(userType);
    } else {
      alert("Please fill in all fields.");
    }
  };

  // Suspend or Activate user
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const newStatus = currentStatus === "Active" ? "Suspended" : "Active";

      await updateDoc(userRef, { status: newStatus });
      fetchUsers();
      alert(`User ${newStatus.toLowerCase()} successfully.`);
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status. Please try again.");
    }
  };

  // Reset Password
  const resetPassword = async (userId: string) => {
    try {
      const newPassword = prompt("Enter the new password:");

      if (!newPassword || newPassword.trim() === "") {
        alert("Password reset canceled or invalid input provided.");
        return;
      }

      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, { password: newPassword });

      alert("Password reset successfully.");
    } catch (err) {
      console.error("Error resetting password:", err);
      alert("Failed to reset password. Please try again.");
    }
  };

  // Edit Points
  const editUserPoints = async (userId: string, currentPoints: number) => {
    try {
      const newPoints = prompt(
        `Enter new points for the user (current points: ${currentPoints}):`
      );

      if (newPoints === null || newPoints.trim() === "") {
        alert("Points update canceled or invalid input provided.");
        return;
      }

      const parsedPoints = parseInt(newPoints.trim(), 10);

      if (isNaN(parsedPoints) || parsedPoints < 0) {
        alert("Please enter a valid positive number for points.");
        return;
      }

      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, { points: parsedPoints });

      fetchUsers();
      alert("Points updated successfully.");
    } catch (err) {
      console.error("Error updating points:", err);
      alert("Failed to update points. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Management</h1>

      <div className="user-form">
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) =>
            setNewUser({ ...newUser, username: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) =>
            setNewUser({ ...newUser, email: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={newUser.phone}
          onChange={(e) =>
            setNewUser({ ...newUser, phone: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Points"
          value={newUser.points}
          onChange={(e) =>
            setNewUser({ ...newUser, points: +e.target.value })
          }
        />
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={handleAddUser}>Add User</button>
      </div>

      <div className="user-list">
        <h2>Existing Users</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id} className="user-card">
              <div className="user-info">
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Points:</strong> {user.points}</p>
                <p><strong>Status:</strong> {user.status}</p>
                <p><strong>Usertype:</strong> {user.usertype}</p>
              </div>
              <div className="user-actions">
                <button
                  className={user.status === "Active" ? "suspend-button" : "activate-button"}
                  onClick={() => toggleUserStatus(user.id, user.status)}
                >
                  {user.status === "Active" ? "Suspend" : "Activate"}
                </button>
                <button
                  className="edit-points-button"
                  onClick={() => editUserPoints(user.id, user.points)}
                >
                  Edit Points
                </button>
                <button
                  className="reset-password-button"
                  onClick={() => resetPassword(user.id)}
                >
                  Reset Password
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
