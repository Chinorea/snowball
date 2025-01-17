"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/firebase/firebaseConfig"; // Ensure your Firebase configuration is set up
import { useRouter } from "next/navigation";
import "./style.css"; // Include the CSS file
import { getCurrentUserEmail, getIsAdmin } from "@/components/User/userInfo";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  points: number;
  status: string;
  usertype: string;
}

export const UserManagementPage = () => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "",
    points: 0,
  });
  const [userType, setUserType] = useState("User");
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [loading, setLoading] = useState(true);
  const [reportPopupVisible, setReportPopupVisible] = useState(false); // Popup visibility state
  const router = useRouter();

  // Fetch users from Firestore
  const fetchUsers = async () => {
    if (getCurrentUserEmail() === "" || getIsAdmin() === false) {
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
      const defaultPassword = "newPassword";
      const customId = newUser.email; // Assuming email is unique
      const newUserRef = doc(userCollectionRef, customId);

      try {
        await createUserWithEmailAndPassword(auth, newUser.email, defaultPassword).then(
          (userCredential) => {
            const user = userCredential.user;
            const authUid = user.uid;
            setDoc(newUserRef, {
              username: newUser.username,
              email: newUser.email,
              phone: newUser.phone,
              points: newUser.points,
              status: "Active",
              usertype: usertype,
              uid: authUid,
            });
          }
        );
      } catch (err) {
        console.error(err);
        alert(err);
      }

      setNewUser({ username: "", email: "", phone: "", points: 0 });
      setUserType("User");
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

  const openReportPopup = () => {
    setReportPopupVisible(true);
  };

  const closeReportPopup = () => {
    setReportPopupVisible(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Suspend or Activate user
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const newStatus = currentStatus === "Active" ? "Suspended" : "Active";

      await updateDoc(userRef, { status: newStatus });
      fetchUsers();
      alert(`User ${newStatus.toLowerCase()} successfully.`);
    } catch (err) {
      alert("Failed to update user status. Please try again.");
    }
  }


  // Reset Password
  const resetPassword = async (userId: string) => {
    try {
      const newPassword = prompt("Enter the new password:");

      if (!newPassword || newPassword.trim() === "") {
        alert("Password reset canceled or invalid input provided.");
        return;
      }

      const updatedPassword = { password: newPassword };

      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const targetAuthUID = docSnap.data().uid;

        // Calls API to reset password of account.
        try {
          const response = await fetch('https://snowball-nu.vercel.app/api/updateUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: targetAuthUID,
              updateData: updatedPassword,
            }),
          });

          const result = await response.json();
          alert("Password reset successfully.");
        } catch (error) {
          alert("Error updating User.");
        }
      } else {
        alert("Error retrieving User Details.");
        return;
      }

    } catch (err) {
      alert("Failed to reset password. Please try again.");
    }
  };

  // Edit Points and Record Transaction
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
      const transactionRef = collection(db, "users", userId, "transactions");

      // Update user's points
      await updateDoc(userRef, { points: parsedPoints });

      // Record the transaction
      await addDoc(transactionRef, {
        pointsSpent: Math.abs(parsedPoints - currentPoints),
        timestamp: new Date(),
        userTransactionType: "Admin Update",
        userId: userId,
        pointFlow: parsedPoints - currentPoints > 0 ? "+" : "-"
      });

      fetchUsers();
      alert("Points updated and transaction recorded successfully.");
    } catch (err) {
      console.error("Error updating points:", err);
      alert("Failed to update points. Please try again.");
    }
  }


  return (
    <div>
      <div className="header">
        <h1>User Management</h1>
        <Link className="report-button" onClick={openReportPopup} href={""}>
          Generate Reports
        </Link>
      </div>

      {/* Popup for report selection */}
      {reportPopupVisible && (
        <div className="popup-container">
          <div className="popup">
            <h3>Select Report Type</h3>
            <Link
              className="popup-option-button"
              href={"/Dashboard/WeeklyReq"}>
              Weekly Requests Report
            </Link>
            <Link
              className="popup-option-button"
              href={"/Dashboard/InventorySummary"}            >
              Inventory Summary Report
            </Link>
            <Link className="popup-cancel-button" onClick={closeReportPopup} href={""}>
              Cancel
            </Link>
          </div>
        </div>
      )}

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
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ul>
          {filteredUsers.map((user) => (
            <li key={user.id} className="user-card">
              <div className="user-info">
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone}
                </p>
                <p>
                  <strong>Points:</strong> {user.points}
                </p>
                <p>
                  <strong>Status:</strong> {user.status}
                </p>
                <p>
                  <strong>Usertype:</strong> {user.usertype}
                </p>
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
                <Link
                  className="view-transactions-button"
                  href={`/TransactionHistory/AdminView?userId=${user.id}`}
                  style={{ display: user.usertype === "User" ? "inline-block" : "none" }}
                >
                  View Transaction History
                </Link>
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
