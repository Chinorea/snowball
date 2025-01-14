"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, query, where, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getCurrentUserEmail, setCurrentUserEmail } from "../userInfo";
import "./style.css";
import { useRouter } from "next/navigation"; 

interface AuctionItem {
  id: string;
  title: string;
  details: string;
  currentBid: number;
  currentBidder: string;
  auctionFinishDate: string;
  completedBid: boolean;
}

export const AuctionHouse = () => {
  const [auctionListings, setAuctionListings] = useState<AuctionItem[]>([]);
  const [myBids, setMyBids] = useState<AuctionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const userId = getCurrentUserEmail();
  const router = useRouter();

  useEffect(() => {
    fetchUserPoints();
    fetchAuctionListings();
    fetchMyBids();
  }, []);

  const fetchUserPoints = async () => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        setUserPoints(userSnapshot.data().points);
      }
    } catch (err) {
      console.error("Error fetching user points:", err);
      setError("Failed to fetch user points. Please try again later.");
    }
  };

  const fetchAuctionListings = async () => {
    try {
      const auctionRef = collection(db, "auction");
      const q = query(auctionRef, where("completedBid", "==", false));
      const auctionSnapshot = await getDocs(q);
      const fetchedAuctionListings = auctionSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuctionItem[];

      setAuctionListings(fetchedAuctionListings);
    } catch (err) {
      console.error("Error fetching auction listings:", err);
      setError("Failed to fetch auction listings. Please try again later.");
    }
  };

const fetchMyBids = async () => {
  try {
    const auctionRef = collection(db, "auction");
    const q = query(auctionRef, where("currentBidder", "==", userId));
    const myBidsSnapshot = await getDocs(q);
    const fetchedMyBids = myBidsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuctionItem[];

    // Filter out completed bids
    setMyBids(fetchedMyBids.filter((item) => !item.completedBid));
  } catch (err) {
    console.error("Error fetching my bids:", err);
    setError("Failed to fetch your bids. Please try again later.");
  }
};

  const handlePointReturn = async (email: string, bid: number) => {
    const userRef = doc(db, "users", email);

    try {
      // Fetch current user data
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        throw new Error("User does not exist.");
      }
      const userData = userSnapshot.data();
      const currentPoints = userData.points;

      await updateDoc(userRef, {
        points: currentPoints + bid,
      });
    } catch (error) {
      console.error("Error updating prev bidder:", error);
      alert("Error Updating prev Bidder. Please try again.");
    }
  };

  const handleBid = async (item: AuctionItem) => {
    const email = getCurrentUserEmail();
    const userRef = doc(db, "users", email);
    const prevBidder = item.currentBidder;
    const prevBid = item.currentBid;

    try {
      // Fetch current user data
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        throw new Error("User does not exist.");
      }

      const userData = userSnapshot.data();
      const currentPoints = userData.points;

      // Prompt for new bid amount
      const newBidInput = prompt("Enter your Bid:");
      const newBid = newBidInput ? parseFloat(newBidInput) : NaN;
      if (isNaN(newBid) || newBid <= item.currentBid) {
        alert("Invalid bid. Your bid must be a number higher than the current bid.");
        return;
      }

      if (newBid > currentPoints) {
        alert("Insufficient points to place this bid.");
        return;
      }

      // Update auction item with new bid and bidder
      const auctionItemRef = doc(db, "auction", item.id);
      await updateDoc(auctionItemRef, {
        currentBid: newBid,
        currentBidder: email,
      });

      // Lock points from user
      await updateDoc(userRef, {
        points: currentPoints - newBid,
      });

      // Return Locked Points from previous user
      handlePointReturn(prevBidder, prevBid);

      alert("Your bid was placed successfully.");

      // Update page
      fetchAuctionListings();
      fetchMyBids();
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid. Please try again.");
    }
  };

  return (
    <div className="auction-house-container">
      {/* User Points Display */}
      <div className="user-points-section">
        <p>Your Points: {userPoints}</p>
        <div className="user-info-actions">
          <button onClick={() => router.push("/AuctionHouseHistory")}>
              View Completed Auction History
          </button>          
        </div>
      </div>

      {/* Segment 1: Items You Have Bidded On */}
      <div className="my-bids-section">
        <h2>Items You Have Bidded On</h2>
        {myBids.length > 0 ? (
          <div className="my-bids-grid">
            {myBids.map((item) => (
              <div key={item.id} className="auction-item-card">
                <h3>{item.title}</h3>
                <p>{item.details}</p>
                <p>
                  <strong>Current Bid:</strong> {item.currentBid}
                </p>
                <p>
                  <strong>Current Bidder:</strong> {item.currentBidder}
                </p>
                <p>
                  <strong>Status:</strong> {item.completedBid ? "Completed" : "Ongoing"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>You have not placed any bids yet.</p>
        )}
      </div>

      {/* Segment 2: Active Items Available for Bidding */}
      <div className="active-auctions-section">
        <h2>Auction House</h2>
        {auctionListings.length > 0 ? (
          <div className="active-auctions-grid">
            {auctionListings
            .slice(-15)
            .map((item) => (
              <div key={item.id} className="auction-item-card">
                <h3>{item.title}</h3>
                <p>{item.details}</p>
                <p>
                  <strong>Current Bid:</strong> {item.currentBid}
                </p>
                <p>
                  <strong>Current Bidder:</strong> {item.currentBidder || "None"}
                </p>
                <button className="bid-button" onClick={() => handleBid(item)}>
                  Place a Bid
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No active auction items available.</p>
        )}
      </div>
    </div>
  );
};

