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
import { useRouter } from "next/navigation"; 
import "./style.css"; // Include the CSS file
import { getCurrentUserEmail, getIsAdmin } from "../User/userInfo";

interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  status: string;
  usertype: string; // Add usertype field
}

export const UserManagementPage = () => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    points: 0,
  });
  const [userType, setUserType] = useState("user"); // Default to "user"
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch users from Firestore
  const fetchUsers = async () => {
    //Check for user type
    if(getCurrentUserEmail() == "" || getIsAdmin() == false){
      router.push("/");
    }
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
      const newUserRef = doc(userCollectionRef); 

      await setDoc(newUserRef, {
        username: newUser.username,
        email: newUser.email,
        points: newUser.points,
        status: "Active",
        usertype: usertype,
      });

      setNewUser({ username: "", email: "", points: 0 });
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
    if (newUser.username && newUser.email && newUser.points) {
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

  // Reset user password
  const resetPassword = async (userId: string) => {
    try {
      const newPassword = "temporaryPassword";
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, { password: newPassword });

      alert("Password reset successfully.");
    } catch (err) {
      console.error("Error resetting password:", err);
      alert("Failed to reset password. Please try again.");
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
                <button className="reset-password-button" onClick={() => resetPassword(user.id)}>
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
