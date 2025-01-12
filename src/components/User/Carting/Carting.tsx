"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, writeBatch, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { VoucherList } from "./VoucherList";
import "./style.css";
import { getCurrentUserEmail } from "../userInfo";

export const Carting = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [startingPoints, setStartingPoints] = useState<number>(0);
  const [calculatedRemainingPoints, setCalculatedRemainingPoints] = useState<number | null>(null);
  const router = useRouter();
  const CurrentUserEmail = getCurrentUserEmail();

  // Function to fetch cart items and user points
  const fetchCartItemsAndPoints = async () => {
    try {
      const userDocRef = doc(db, "users", CurrentUserEmail);
      const cartCollectionRef = collection(userDocRef, "CartList");

      // Fetch cart items
      const cartSnapshot = await getDocs(cartCollectionRef);
      const items = cartSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          stock: data.stock,
          pointsRequired: data.pointsRequired,
          quantity: data.quantity || 1,
        };
      });

      setCartItems(items);

      // Fetch user points
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStartingPoints(parseInt(userData.points));
        calculateRemainingPoints(parseInt(userData.points), items); // Calculate remaining points
      }
    } catch (error) {
      console.error("Error fetching cart items or user points:", error);
    }
  };

  useEffect(() => {
    fetchCartItemsAndPoints();
  }, []);

  // Calculate remaining points before transaction
  const calculateRemainingPoints = (userPoints: number, items: any[]) => {
    const totalPointsRequired = items.reduce(
      (total, item) => total + item.pointsRequired * item.quantity,
      0
    );
    setCalculatedRemainingPoints(userPoints - totalPointsRequired);
  };

  // Handle quantity change
  const handleQuantityChange = async (id: string, newQuantity: number) => {
    try {
      // Update local state
      const updatedItems = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedItems);

      // Recalculate remaining points
      calculateRemainingPoints(startingPoints, updatedItems);

      // Update Firestore
      const userDocRef = doc(db, "users", CurrentUserEmail);
      const cartDocRef = doc(userDocRef, "CartList", id);
      await updateDoc(cartDocRef, { quantity: newQuantity });
    } catch (error) {
      console.error("Error updating quantity in Firestore:", error);
    }
  };

  // Remove item from the cart
  const handleRemoveItem = async (id: string) => {
    try {
      // Update local state
      const updatedItems = cartItems.filter((item) => item.id !== id);

      setCartItems(updatedItems);

      // Recalculate remaining points
      calculateRemainingPoints(startingPoints, updatedItems);

      // Remove from Firestore
      const userDocRef = doc(db, "users", CurrentUserEmail);
      const cartDocRef = doc(userDocRef, "CartList", id);
      await deleteDoc(cartDocRef);
    } catch (error) {
      console.error("Error removing item from Firestore:", error);
    }
  };

  // Handle the checkout process
  const handleCheckout = async () => {
    try {
      const batch = writeBatch(db);
      const userDocRef = doc(db, "users", CurrentUserEmail);

      // Fetch user data
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        alert("User not found.");
        return;
      }
      const userData = userDoc.data();
      let userPoints = parseInt(userData.points);

      let totalPointsSpent = 0;

      // Validate stock and calculate points spent
      for (const item of cartItems) {
        const productRef = doc(db, "Products", item.id);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          if (productData.Stock >= item.quantity) {
            const pointsSpentOnItem = item.pointsRequired * item.quantity;
            totalPointsSpent += pointsSpentOnItem;

            // Reduce stock for purchased items
            batch.update(productRef, {
              Stock: productData.Stock - item.quantity,
            });

            // Add transaction
            const transactionRef = collection(userDocRef, "transactions");
            await setDoc(doc(transactionRef), {
              productId: item.id,
              productName: item.name,
              pointsSpent: pointsSpentOnItem.toString(),
              timestamp: new Date().toISOString(),
              paymentMethod,
              voucher: selectedVoucher,
            });

            // Remove item from cart
            const cartDocRef = doc(userDocRef, "CartList", item.id);
            batch.delete(cartDocRef);
          } else {
            alert(`Not enough stock for ${item.name}`);
            return;
          }
        }
      }

      // Check if user has enough points
      if (userPoints < totalPointsSpent) {
        alert("Not enough points for this transaction.");
        return;
      }

      // Deduct points and update Firestore
      userPoints -= totalPointsSpent;
      batch.update(userDocRef, { points: userPoints.toString() });

      // Commit batch
      await batch.commit();

      alert("Transaction successful!");
      router.push("/Product");
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="cart-container">
      <h1 className="cart-header">Shopping Cart</h1>
      <div className="points-section">
        <h5>Points Summary</h5>
        <p>Starting Points: {startingPoints}</p>
      </div>
      <div className="cart-items">
        <h5>Your Cart Items</h5>
        {cartItems.map((item) => (
          <div className="cart-item" key={item.id}>
            <div className="cart-item-details">
              <h4>{item.name}</h4>
              <p>Stock: {item.stock}</p>
              <p>Points Required: {item.pointsRequired}</p>
            </div>
            <div className="quantity-selector">
              <input
                type="number"
                value={item.quantity}
                min="1"
                max={item.stock}
                onChange={(e) =>
                  handleQuantityChange(item.id, parseInt(e.target.value))
                }
              />
            </div>
            <button
              className="remove-item-btn"
              onClick={() => handleRemoveItem(item.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="voucher-section">
        <h5>Select Voucher</h5>
        <VoucherList setSelectedVoucher={setSelectedVoucher} />
      </div>

       <p>
          Remaining Points (Before Transaction):{" "}
          {calculatedRemainingPoints !== null
            ? calculatedRemainingPoints
            : "Calculating..."}
        </p>

        <div className="checkout-btn-container">
            <button
                className={`checkout-btn ${cartItems.length === 0 ? "disabled-btn" : ""}`}
                onClick={handleCheckout}
                disabled={cartItems.length === 0} // Disable button if cart is empty
            >
                Confirm Purchase
            </button>
            
        </div>

    </div>
  );
};