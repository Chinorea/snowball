"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { get } from "http";
import { getCurrentUserEmail } from "../userInfo";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";

export const SettingsPage = () => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("First Name");
  const [lastName, setLastName] = useState("Last Name");
  const [email, setEmail] = useState(getCurrentUserEmail());
  const [phoneNumber, setPhoneNumber] = useState("+123456789");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
  };

  const handleSaveChanges = () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is currently signed in.");
      return;
    }
    if(confirmPassword == newPassword && newPassword.length >= 6 ){
        updatePassword(user, newPassword).then(() => {
            console.log("Password updated successfully.");
        })
    }

    const userRef = doc(db, "users", email);
    updateDoc(userRef, {
        firstName: firstName,
        lastName: lastName,
        phone: phoneNumber,
        })
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });

    alert("Changes saved successfully!");
  };

  const getUserDetail = () => {
    // Logic to fetch user details from the database
    const userRef = doc(db, "users", email);
    getDoc(userRef).then((doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setEmail(userData.email);
        setPhoneNumber(userData.phone);
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
      }
    });
  };

  useEffect(() => {
    getUserDetail();
  }, []);

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <p className="text-sm text-gray-600 mb-6">
        Manage your account information and settings.
      </p>

      {/* Profile Picture Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Profile Picture</h2>
        <div className="flex items-center gap-4 mt-2">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full border"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          <div>
            <label
              htmlFor="profile-picture-upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
            >
              Upload New Picture
            </label>
            <input
              id="profile-picture-upload"
              type="file"
              className="hidden"
              onChange={handleProfilePictureUpload}
            />
            {profilePicture && (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md ml-2 hover:bg-red-700"
                onClick={handleRemoveProfilePicture}
              >
                Remove Picture
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Email Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">User Email</h2>
        <input
          type="email"
          value={email}
          readOnly
          className="border rounded-md px-4 py-2 w-full mt-2 bg-gray-100 focus:outline-none cursor-not-allowed"
        />
      </div>

      {/* Full Name Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Full Name</h2>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring focus:ring-indigo-200"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* Phone Number Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Phone Number</h2>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
          className="border rounded-md px-4 py-2 w-full mt-2 focus:outline-none focus:ring focus:ring-indigo-200"
        />
      </div>

      {/* Password Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Password</h2>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring focus:ring-indigo-200"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>
      </div>

      <button
        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        onClick={handleSaveChanges}
      >
        Save Changes
      </button>
    </div>
  );
};

export default SettingsPage;