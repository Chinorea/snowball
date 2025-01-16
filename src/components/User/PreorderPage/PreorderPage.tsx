"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getCurrentUserEmail } from "../userInfo";
import "./style.css";
import { useRouter, useSearchParams } from "next/navigation";

interface PreorderItem {
  id: string;
  productName: string;
  quantity: number;
  totalPoints: number;
  status: string; // New field for status
}

export const PreorderPage = () => {
  const [preorders, setPreorders] = useState<PreorderItem[]>([]);
  const [productDetails, setProductDetails] = useState({
    productName: "",
    pointsPerUnit: 0,
    totalPoints: 0,
    quantity: 1,
  });
  const [userPoints, setUserPoints] = useState<number>(0);
  const [remainingPoints, setRemainingPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserEmail = getCurrentUserEmail();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
      if (searchParams != null ) {
        const productName = searchParams.get("productName");
        const pointsPerUnit = Number(searchParams.get("pointsRequired"));
    
        if (productName && pointsPerUnit) {
          setProductDetails({
            productName,
            pointsPerUnit,
            totalPoints: 0,
            quantity: 0,
          });
      }
    }

    fetchPreorders();
    fetchUserPoints();
  }, []);

  const fetchPreorders = async () => {
    setLoading(true);
    try {
      if (!currentUserEmail) {
        router.push("/"); // Redirect to home if user is not logged in
        return;
      }

      const preordersRef = collection(db, "users", currentUserEmail, "Preorders");
      const preordersSnapshot = await getDocs(preordersRef);

      const fetchedPreorders = preordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        productName: doc.data().productName,
        quantity: doc.data().quantity,
        totalPoints: doc.data().totalPoints,
        status: doc.data().status || "Pending", // Default to rejected if status is missing
      }));

      setPreorders(fetchedPreorders);
    } catch (err) {
      console.error("Error fetching preorders:", err);
      setError("Failed to fetch preorders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    if (!currentUserEmail) return;

    try {
      const userDocRef = doc(db, "users", currentUserEmail);
      const userDoc = await getDoc(userDocRef); 

      if (userDoc.exists()) {
        const points = userDoc.data().points || 0;
        setUserPoints(points);
        setRemainingPoints(points-productDetails.totalPoints); // Initially set remaining points to current points
      }
    } catch (err) {
      console.error("Error fetching user points:", err);
      setError("Failed to fetch user points. Please try again later.");
    }
  };

  const handleAddPreorder = async () => {
    if (!currentUserEmail) {
      alert("User not logged in.");
      return;
    }
  
    if (!productDetails.productName.trim()) {
      alert("Product name is not set.");
      return;
    }
  
    if (productDetails.quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
  
    try {
      const userDocRef = doc(db, "users", currentUserEmail);
  
      if (userPoints < productDetails.totalPoints) {
        alert("You do not have enough points to place this preorder.");
        return;
      }
  
      // Add preorder to the Preorders collection
      const preordersRef = collection(db, "users", currentUserEmail, "Preorders");
      await addDoc(preordersRef, {
        productName: productDetails.productName,
        quantity: productDetails.quantity,
        totalPoints: productDetails.totalPoints,
        status: "Pending",
      });
  
      // Update user points
      const newRemainingPoints = userPoints - productDetails.totalPoints;
      await updateDoc(userDocRef, {
        points: newRemainingPoints,
      });
  
      // Add transaction to the Transactions collection
      const transactionsRef = collection(db, "users", currentUserEmail, "transactions");
      await addDoc(transactionsRef, {
        productId: "N/A", // Replace with product ID if available
        productName: productDetails.productName,
        pointsSpent: productDetails.totalPoints,
        userTransactionType: "Preorder",
        voucherUsed: "N/A", // Replace with voucher if applicable
        timestamp: new Date(),
        pointFlow: "-"
      });
  
      setUserPoints(newRemainingPoints);
      setRemainingPoints(newRemainingPoints);
      alert("Pre-order added successfully!");
      fetchPreorders();
      router.push("/Product");
    } catch (err) {
      console.error("Error adding pre-order:", err);
      alert("Failed to add pre-order. Please try again.");
    }
  };
  
  const handleQuantityChange = (quantity: number) => {
    if (quantity < 0) return;
    const totalPoints = quantity * productDetails.pointsPerUnit;
    setProductDetails((prev) => ({
      ...prev,
      quantity,
      totalPoints,
    }));
    if (remainingPoints !== null) {
      setRemainingPoints(userPoints - totalPoints);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="preorder-container">
      <h1 className="preorder-header">Pre-orders</h1>

      {/* Add New Pre-order */}
      <div className="add-preorder">
        <div className="points-summary">
          <h2>Points Summary</h2>
          <p>
            <strong>Starting Points:</strong> {userPoints}
          </p>
        </div>

        <h2>Add a New Pre-order</h2>
        <div className="product-details">
          <p>
            <strong>Product:</strong> {productDetails.productName}
          </p>
          <p>
            <strong>Points Per Unit:</strong> {productDetails.pointsPerUnit}
          </p>
        </div>
        <div >
          <input
            type="number"
            placeholder="Quantity"
            value={productDetails.quantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value))}
            className="input-field"
            min="0"
          />
        </div>
        <div className="points-summary">
          <p>
            <strong>Total Points:</strong> {productDetails.totalPoints}
          </p>
          <p>
            <strong>Remaining Points:</strong>{" "}
            {remainingPoints !== null ? remainingPoints : "Calculating..."}
          </p>
        </div>
        <button onClick={handleAddPreorder} className="add-preorder-button">
          Add Pre-order
        </button>
      </div>

      {/* Display Existing Pre-orders */}
      <div className="preorder-list">
        <h2>Existing Pre-orders</h2>
        {preorders.length > 0 ? (
          <table className="preorder-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Total Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {preorders.map((preorder) => (
                <tr key={preorder.id}>
                  <td>{preorder.productName}</td>
                  <td>{preorder.quantity}</td>
                  <td>{preorder.totalPoints}</td>
                  <td>{preorder.status}</td> 
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No pre-orders found.</p>
        )}
      </div>
    </div>
  );
};