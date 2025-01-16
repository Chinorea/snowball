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
  const [userType, setUserType] = useState("user");
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
