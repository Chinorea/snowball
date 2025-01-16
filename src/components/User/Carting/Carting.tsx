"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  writeBatch,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { VoucherList } from "./VoucherList";
import "./style.css";
import { getCurrentUserEmail } from "../userInfo";

export const Carting = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [startingPoints, setStartingPoints] = useState<number>(0);
  const [calculatedRemainingPoints, setCalculatedRemainingPoints] = useState<number | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

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
        calculateSubtotalAndRemainingPoints(parseInt(userData.points), items);
      }
    } catch (error) {
      console.error("Error fetching cart items or user points:", error);
    }
  };

  useEffect(() => {
    fetchCartItemsAndPoints();
  }, []);

  useEffect(() => {
    calculateSubtotalAndRemainingPoints(startingPoints, cartItems);
  }, [selectedVoucher, cartItems]);

  const calculateSubtotalAndRemainingPoints = (
    userPoints: number,
    items: any[]
  ) => {
    const totalPointsRequired = items.reduce(
      (total, item) => total + item.pointsRequired * item.quantity,
      0
    );

    let discountValue = 0;
    if (selectedVoucher) {
      if (selectedVoucher.voucherType === "pointDeduction") {
        discountValue = selectedVoucher.PointORpercent;
      } else if (selectedVoucher.voucherType === "percentDeduction") {
        discountValue =
          (totalPointsRequired * selectedVoucher.PointORpercent) / 100;
      }
    }

    setSubtotal(totalPointsRequired);
    setDiscount(discountValue);
    const total = totalPointsRequired - discountValue >= 0 ? totalPointsRequired - discountValue : 0;
    setTotal(total);
    setCalculatedRemainingPoints(userPoints - total);
  };

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    try {
      const updatedItems = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedItems);
      calculateSubtotalAndRemainingPoints(startingPoints, updatedItems);

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
      calculateSubtotalAndRemainingPoints(startingPoints, updatedItems);

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

      if (userPoints < total) {
        alert("Not enough points for this transaction.");
        return;
      }

      for (const item of cartItems) {
        const productRef = doc(db, "Products", item.id);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          if (productData.Stock >= item.quantity) {
            batch.update(productRef, {
              Stock: productData.Stock - item.quantity,
            });

            const transactionRef = collection(userDocRef, "transactions");
            await setDoc(doc(transactionRef), {
              productId: item.id,
              productName: item.name,
              pointsSpent: item.pointsRequired * item.quantity,
              timestamp: new Date().toISOString(),
              voucherUsed: selectedVoucher ? selectedVoucher.VoucherID : null,
              userTransactionType: "Purchase",
              pointFlow: "-"
            });
          } else {
            alert(`Not enough stock for ${item.name}`);
            return;
          }
        }
      }

      if (selectedVoucher) {
        const usedVoucherRef = collection(userDocRef, "usedVouchers");
        const voucherDocRef = doc(userDocRef, "Vouchers", selectedVoucher.id);

        await setDoc(doc(usedVoucherRef), selectedVoucher);
        await deleteDoc(voucherDocRef);
      }

      // Remove all items in the cart
      const cartCollectionRef = collection(userDocRef, "CartList");
      const cartSnapshot = await getDocs(cartCollectionRef);
      cartSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      userPoints -= total;
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
                    handleQuantityChange(item.id, Math.max(1, item.quantity - 1))
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input type="text" value={item.quantity} className="quantity-input" readOnly />
                <button
                  className="quantity-btn"
                  onClick={() =>
                    handleQuantityChange(item.id, Math.min(item.stock, item.quantity + 1))
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
      <div className="summary-section">
        <p>Subtotal: {subtotal} Points</p>
        <p>Discount: -{discount} Points</p>
        <p>Total Cost: {total} Points</p>
        <h1></h1>
        <p>
          Remaining Points (After Discount):{" "}
          {calculatedRemainingPoints !== null
            ? calculatedRemainingPoints
            : "Calculating..."}
        </p>
      </div>
      <div className="checkout-btn-container">
        <button
          className={`checkout-btn ${cartItems.length === 0 ? "disabled-btn" : ""}`}
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
        >
          Confirm Purchase
        </button>
      </div>
    </div>
  );
};
