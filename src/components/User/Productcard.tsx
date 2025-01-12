"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Ensure your Firebase configuration is set up
import { useRouter } from "next/navigation"; 
import "./style.css"; // Include the CSS file
import { getCurrentUserEmail } from "./userInfo";

interface Product {
  id: string;
  name: string;
  stock: number;
  pointsRequired: number;
}

interface User {
  id: string;
  points: number;
}

interface Transaction {
  id: string;
  productId: string;
  productName: string;
  pointsSpent: number;
  timestamp: string;
}

export const ProductCardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const router = useRouter();


  // Fetch products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productCollectionRef = collection(db, "Products");
      const productSnapshot = await getDocs(productCollectionRef);

      const fetchedProducts = productSnapshot.docs.map((doc) => {
        const productName = doc.id;
        const data = doc.data();
        return {
          id: doc.id,
          name: productName || "Unnamed Product",
          stock: data.Stock || 0,
          pointsRequired: data.PointsRequired || 0,
        };
      });

      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user points from Firestore
  const fetchUser = async () => {
    const currentUserEmail = getCurrentUserEmail();
    try {
      //const userDocRef = doc(db, "users", "testing@gmail.com");
      //alert(currentUserEmail);
      if(currentUserEmail == null){
        router.push("");
      }
      const userDocRef = doc(db, "users", currentUserEmail);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({ id: userDoc.id, points: userData.points || 0 });
      } else {
        console.error("User document does not exist");
        setError("User data not found.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data. Please try again later.");
    }
  };

  // Fetch transaction history for the user
  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const transactionsRef = collection(db, "users", user.id, "transactions");
      const transactionSnapshot = await getDocs(transactionsRef);

      const fetchedTransactions = transactionSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      setTransactions(fetchedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUser();
  }, []);

  const handleRedeem = async (product: Product) => {
    if (!user) {
      alert("User data is not loaded.");
      return;
    }

    if (product.pointsRequired > user.points) {
      alert("Not enough points to redeem this product.");
      return;
    }

    if (product.stock > 0) {
      try {
        const productRef = doc(db, "Products", product.id);
        const userRef = doc(db, "users", user.id);
        const transactionsRef = collection(userRef, "transactions");

        const updatedStock = product.stock - 1;
        const updatedPoints = user.points - product.pointsRequired;

        const batch = writeBatch(db);

        batch.update(productRef, { Stock: updatedStock });
        batch.update(userRef, { Points: updatedPoints });

        const transactionDoc = doc(transactionsRef);
        batch.set(transactionDoc, {
          productId: product.id,
          productName: product.name,
          pointsSpent: product.pointsRequired,
          timestamp: new Date().toISOString(),
        });

        await batch.commit();

        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === product.id ? { ...p, stock: updatedStock } : p
          )
        );

        setUser((prevUser) =>
          prevUser ? { ...prevUser, points: updatedPoints } : null
        );

        alert(`Redeemed: ${product.name}`);
      } catch (err) {
        console.error("Error redeeming product:", err);
        alert("Failed to redeem product. Please try again.");
      }
    } else {
      alert(`Sorry, ${product.name} is out of stock.`);
    }
  };

  const toggleTransactionHistory = async () => {
    if (!showTransactions) {
      await fetchTransactions();
    }
    setShowTransactions((prev) => !prev);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Product Redemption</h1>

      {user && (
        <div className="user-info">
          <p>
            <strong>Your Points:</strong> {user.points}
          </p>
          <div className="user-info-actions">
            <button onClick={() => router.push("/TransactionHistory")}>
              View Transaction History
            </button>
          </div>
    </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="product-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <h3>{product.name}</h3>
              <p>
                <strong>Stock Left:</strong> {product.stock}
              </p>
              <p>
                <strong>Points Required:</strong> {product.pointsRequired}
              </p>
              <button
                className="redeem-button"
                onClick={() => handleRedeem(product)}
                disabled={
                  product.stock <= 0 || product.pointsRequired > (user?.points || 0)
                }
              >
                {product.stock > 0 ? "Redeem" : "Out of Stock"}
              </button>
            </div>
          ))
        ) : (
          <p>No products match your search.</p>
        )}
      </div>
    </div>
  );
};