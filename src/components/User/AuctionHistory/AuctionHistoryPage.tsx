"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getCurrentUserEmail } from "../userInfo";
import "./style.css";
import { useRouter } from "next/navigation";

interface AuctionHistoryItem {
  id: string;
  title: string;
  details: string;
  currentBid: number;
  auctionFinishDate: string;
}

export const AuctionHistoryPage = () => {
  const [auctionHistory, setAuctionHistory] = useState<AuctionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = getCurrentUserEmail();
  const router = useRouter();

  useEffect(() => {
    fetchAuctionHistory();
  }, []);

  const fetchAuctionHistory = async () => {
    try {
      const auctionRef = collection(db, "users", userId, "auctions");
      const auctionSnapshot = await getDocs(auctionRef);
      const fetchedAuctionHistory = auctionSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuctionHistoryItem[];

      setAuctionHistory(fetchedAuctionHistory);
    } catch (err) {
      console.error("Error fetching auction history:", err);
      setError("Failed to fetch auction history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading auction history...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="auction-history-container">
      <div className="header-container">
      <h1>Auction History</h1>
        <button className="go-back-button" onClick={() => router.push("/AuctionHouse")}>
          Go Back
        </button>
      </div>
  
      {auctionHistory.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Item Title</th>
              <th>Details</th>
              <th>Final Bid</th>
              <th>Auction Finish Date</th>
            </tr>
          </thead>
          <tbody>
            {auctionHistory.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.details}</td>
                <td>{item.currentBid}</td>
                <td>{new Date(item.auctionFinishDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No auction history found.</p>
      )}
    </div>
  );
};