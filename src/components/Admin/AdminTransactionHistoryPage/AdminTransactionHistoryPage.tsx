"use client";

import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./style.css";

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

export const AdminTransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const userId = searchParams?.get("userId");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) {
        setError("No user ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUsername(userDoc.data()?.username || "Unknown User");
        } else {
          setUsername("Unknown User");
          console.error("User not found");
        }

        const transactionsRef = collection(db, "users", userId, "transactions");
        const transactionSnapshot = await getDocs(transactionsRef);

        const fetchedTransactions = transactionSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            productId: data.productId || "Unknown Product ID",
            productName: data.productName || "",
            voucherUsed: data.voucherUsed || "Unknown Voucher",
            userTransactionType: data.userTransactionType || "Unknown Type",
            pointsSpent: data.pointsSpent || 0,
            pointFlow: data.pointFlow || "+",
            timestamp: data.timestamp instanceof Timestamp
              ? data.timestamp.toDate()
              : data.timestamp
              ? new Date(data.timestamp)
              : new Date(),
          };
        });

        setTransactions(fetchedTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to fetch transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  if (loading) {
    return <div>Loading transaction history...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="transaction-history-container">
      <div className="header-container">
        <h1>Transaction History for User: {username}</h1>
        <Link href="/Dashboard" className="go-back-link">
          Go Back to Dashboard
        </Link>
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
        <p>No transactions found for this user.</p>
      )}
    </div>
  );
};
