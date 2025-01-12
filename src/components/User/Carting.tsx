"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, getDoc, writeBatch, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Ensure Firebase is configured
import { useRouter } from "next/navigation";
import { VoucherList } from "./VoucherList";
import "./style.css"; // Include the CSS file

export const Carting = () => {
  const [cartItems, setCartItems] = useState<any[]>([]); // Cart items with quantity
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null); // Selected voucher ID
  const [paymentMethod, setPaymentMethod] = useState<string>(""); // Payment method selection
  const router = useRouter();

  // Function to fetch cart items from the user's cart in Firestore
  const fetchCartItems = async () => {
    try {
      const userDocRef = doc(db, "users", "tester@gmail.com");
      const cartCollectionRef = collection(userDocRef, "CartList");
      const cartSnapshot = await getDocs(cartCollectionRef);
      const items = cartSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          stock: data.stock,
          pointsRequired: data.pointsRequired,
          quantity: data.quantity || 1, // Default to 1 if not set
        };
      });
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Handle quantity change for a specific item
  const handleQuantityChange = async (id: string, newQuantity: number) => {
    try {
      // Update local state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      // Update Firestore with the new quantity
      const userDocRef = doc(db, "users", "tester@gmail.com");
      const cartDocRef = doc(userDocRef, "CartList", id);
      await updateDoc(cartDocRef, { quantity: newQuantity });
    } catch (error) {
      console.error("Error updating quantity in Firestore:", error);
    }
  };

  // Remove item from the cart
  const handleRemoveItem = async (id: string) => {
    try {
      // Remove item from local state
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

      // Remove item from Firestore
      const userDocRef = doc(db, "users", "tester@gmail.com");
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
      const userDocRef = doc(db, "users", "tester@gmail.com");

      // Check each item to confirm enough stock
      for (const item of cartItems) {
        const productRef = doc(db, "Products", item.id);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          if (productData.Stock >= item.quantity) {
            // Reduce stock for purchased items
            batch.update(productRef, {
              Stock: productData.Stock - item.quantity,
            });

            // Add transaction in the required format
            const transactionRef = collection(userDocRef, "transactions");
            await setDoc(doc(transactionRef), {
              productId: item.id,
              productName: item.name,
              pointsSpent: (item.pointsRequired * item.quantity).toString(),
              timestamp: new Date().toISOString(),
              paymentMethod,
              voucher: selectedVoucher,
            });

            // Delete the item from the cart
            const cartDocRef = doc(userDocRef, "CartList", item.id);
            batch.delete(cartDocRef);
          } else {
            alert(`Not enough stock for ${item.name}`);
            return;
          }
        }
      }

      // Commit the batch write (update stock, save transactions, and delete cart items)
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

      <div className="payment-method">
        <h5>Select Payment Method</h5>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="credit">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="points">Points</option>
        </select>
      </div>

      <div className="checkout-btn-container">
        <button className="checkout-btn" onClick={handleCheckout}>
          Confirm Purchase
        </button>
      </div>
    </div>
  );
};
