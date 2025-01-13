"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
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
  const [calculatedRemainingPoints, setCalculatedRemainingPoints] =
    useState<number | null>(null);

  const router = useRouter();
  const CurrentUserEmail = getCurrentUserEmail();

  const fetchCartItemsAndPoints = async () => {
    try {
      const userDocRef = doc(db, "users", CurrentUserEmail);
      const cartCollectionRef = collection(userDocRef, "CartList");

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

      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStartingPoints(parseInt(userData.points));
        calculateRemainingPoints(parseInt(userData.points), items);
      }
    } catch (error) {
      console.error("Error fetching cart items or user points:", error);
    }
  };

  useEffect(() => {
    fetchCartItemsAndPoints();
  }, []);

  const calculateRemainingPoints = (userPoints: number, items: any[]) => {
    const totalPointsRequired = items.reduce(
      (total, item) => total + item.pointsRequired * item.quantity,
      0
    );
    setCalculatedRemainingPoints(userPoints - totalPointsRequired);
  };

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    try {
      const updatedItems = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedItems);

      calculateRemainingPoints(startingPoints, updatedItems);

      const userDocRef = doc(db, "users", CurrentUserEmail);
      const cartDocRef = doc(userDocRef, "CartList", id);
      await updateDoc(cartDocRef, { quantity: newQuantity });
    } catch (error) {
      console.error("Error updating quantity in Firestore:", error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const updatedItems = cartItems.filter((item) => item.id !== id);

      setCartItems(updatedItems);

      calculateRemainingPoints(startingPoints, updatedItems);

      const userDocRef = doc(db, "users", CurrentUserEmail);
      const cartDocRef = doc(userDocRef, "CartList", id);
      await deleteDoc(cartDocRef);
    } catch (error) {
      console.error("Error removing item from Firestore:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      const batch = writeBatch(db);
      const userDocRef = doc(db, "users", CurrentUserEmail);

      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        alert("User not found.");
        return;
      }
      const userData = userDoc.data();
      let userPoints = parseInt(userData.points);

      let totalPointsSpent = 0;

      for (const item of cartItems) {
        const productRef = doc(db, "Products", item.id);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          if (productData.Stock >= item.quantity) {
            const pointsSpentOnItem = item.pointsRequired * item.quantity;
            totalPointsSpent += pointsSpentOnItem;

            batch.update(productRef, {
              Stock: productData.Stock - item.quantity,
            });

            const transactionRef = collection(userDocRef, "transactions");
            await setDoc(doc(transactionRef), {
              productId: item.id,
              productName: item.name,
              pointsSpent: pointsSpentOnItem.toString(),
              timestamp: new Date().toISOString(),
              paymentMethod,
              voucher: selectedVoucher,
            });

            const cartDocRef = doc(userDocRef, "CartList", item.id);
            batch.delete(cartDocRef);
          } else {
            alert(`Not enough stock for ${item.name}`);
            return;
          }
        }
      }

      if (userPoints < totalPointsSpent) {
        alert("Not enough points for this transaction.");
        return;
      }

      userPoints -= totalPointsSpent;
      batch.update(userDocRef, { points: userPoints.toString() });

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
        <div className="cart-item-header">
          <div className="itemheader1">Item</div>
          <div className="itemheader2">Stock</div>
          <div className="itemheader3">Points Required</div>
          <div className="itemheader4">Quantity</div>
          <div className="itemheader5">Remove</div>
        </div>
        {cartItems.map((item) => (
          <div className="cart-item" key={item.id}>
            <div className="cart-item-details">
              <h4>{item.name}</h4>
              <p>{item.stock}</p>
              <p>{item.pointsRequired}</p>
              <div className="quantity-container">
                <button
                  className="quantity-btn"
                  onClick={() =>
                    handleQuantityChange(
                      item.id,
                      Math.max(1, item.quantity - 1)
                    )
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  max={item.stock}
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value))
                  }
                  className="quantity-input"
                />
                <button
                  className="quantity-btn"
                  onClick={() =>
                    handleQuantityChange(
                      item.id,
                      Math.min(item.stock, item.quantity + 1)
                    )
                  }
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>
                <button
                className="remove-item-btn"
                onClick={() => handleRemoveItem(item.id)}
              >
                ×
              </button>
              </div>
            </div>
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
          className={`checkout-btn ${
            cartItems.length === 0 ? "disabled-btn" : ""
          }`}
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
        >
          Confirm Purchase
        </button>
      </div>
    </div>
  );
};
