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
  voucherUsed: string;
  userTransactionType: string;
  pointsSpent: number;
  pointFlow: string; 
  timestamp: Date;
}

export const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const fetchTransactions = async () => {
    const currentUserEmail = getCurrentUserEmail();
    const isAdmin = getIsAdmin();
    if (isAdmin == true || currentUserEmail == "") {
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
            productName: data.productName || "",
            voucherUsed: data.voucherUsed || "Unknown Voucher",
            userTransactionType: data.userTransactionType || "Unknown Type",
            pointsSpent: data.pointsSpent || 0,
            pointFlow: data.pointFlow || "+", // Default to "+" if missing
            timestamp: data.timestamp instanceof Timestamp
              ? data.timestamp.toDate()
              : data.timestamp
              ? new Date(data.timestamp)
              : new Date(),
          };
        })
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by timestamp (descending)

      console.log("Fetched transactions:", fetchedTransactions);
      setTransactions(fetchedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchTransactions();
  }, []);

  if (!isMounted) {
    return null;
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
          <button className="go-back-button" onClick={() => router.push("/Product")}>
            Go Back
          </button>
        </div>
      </div>
  
      {transactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Transaction Type</th>
              <th>Product</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.timestamp.toLocaleString()}</td>
                <td>{transaction.userTransactionType}</td>
                <td>{transaction.productName}</td>
                <td
                  style={{
                    color: transaction.pointFlow === "+" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {transaction.pointFlow}
                  {transaction.pointsSpent}
                </td>
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
