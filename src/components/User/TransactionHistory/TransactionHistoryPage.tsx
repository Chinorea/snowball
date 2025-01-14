"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import "./style.css";
import { getCurrentUserEmail, getIsAdmin } from "../userInfo";

interface Transaction {
  id: string;
  productId: string;
  productName: string;
  pointsSpent: number;
  timestamp: Date;
}

export const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Track if component is mounted
  const router = useRouter();

  const fetchTransactions = async () => {
    const currentUserEmail = getCurrentUserEmail();
    const isAdmin = getIsAdmin();
    if(isAdmin == true || currentUserEmail == ""){
      router.push("/");
    }
    setLoading(true);
    try {
      const transactionsRef = collection(db, "users", currentUserEmail, "transactions");
      const transactionSnapshot = await getDocs(transactionsRef);

      const fetchedTransactions = transactionSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            productId: data.productId || "Unknown Product ID",
            productName: data.productName || "Unknown Product",
            pointsSpent: data.pointsSpent || 0,
            timestamp: data.timestamp instanceof Timestamp
              ? data.timestamp.toDate()
              : data.timestamp
              ? new Date(data.timestamp)
              : new Date(), // Handle missing or invalid timestamp
          };
        })
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by timestamp (descending)

      console.log("Fetched transactions:", fetchedTransactions); // Debug log
      setTransactions(fetchedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true); // Set to true once component is mounted
    fetchTransactions();
  }, []);

  if (!isMounted) {
    return null; // Avoid rendering while the component is mounting
  }

  if (loading) {
    return <div>Loading transaction history...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="transaction-history-container">
      <div className="header-container">
      <h1>Transaction History</h1>
      <div className="go-back-container">
        <button className="go-back-button" onClick={() => router.push("/Product")}>Go Back</button>
      </div>
      </div>
  
      {transactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Points Spent</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.productName}</td>
                <td>{transaction.pointsSpent}</td>
                <td>{transaction.timestamp.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );  
};
