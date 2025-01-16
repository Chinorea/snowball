"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { db } from "@/firebase/firebaseConfig"; // Ensure storage is imported
import { getCurrentUserEmail } from "../userInfo";
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
  imageUrl?: string; // Add imageUrl for storing image reference
}

export const AuctionHouse = () => {
  const [auctionListings, setAuctionListings] = useState<AuctionItem[]>([]);
  const [myBids, setMyBids] = useState<AuctionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const userId = getCurrentUserEmail();
  const router = useRouter();
  const storage = getStorage();

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

      const fetchedAuctionListings = await Promise.all(
        auctionSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const imageUrl = await fetchImage(data.title); // Fetch image URL
          return {
            id: doc.id,
            ...data,
            imageUrl,
          } as AuctionItem;
        })
      );

      // Filter out auctions where the current user is already the bidder
      const filteredAuctionListings = fetchedAuctionListings.filter(
        (item) => item.currentBidder !== userId
      );

      setAuctionListings(filteredAuctionListings);
    } catch (err) {
      console.error("Error fetching auction listings:", err);
      setError("Failed to fetch auction listings. Please try again later.");
    }
  };

  const fetchMyBids = async () => {
    try {
      const auctionRef = collection(db, "auction");
      const q = query(
        auctionRef,
        where("currentBidder", "==", userId),
        where("completedBid", "==", false) // Filter for only incomplete bids
      );
      const myBidsSnapshot = await getDocs(q);

      const fetchedMyBids = await Promise.all(
        myBidsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const imageUrl = await fetchImage(data.title); // Fetch image URL
          return {
            id: doc.id,
            ...data,
            imageUrl,
          } as AuctionItem;
        })
      );

      setMyBids(fetchedMyBids.filter((item) => !item.completedBid));
    } catch (err) {
      console.error("Error fetching my bids:", err);
      setError("Failed to fetch your bids. Please try again later.");
    }
  };

  const fetchImage = async (title: string): Promise<string | undefined> => {
    try {
      const storageRef = ref(storage, `auctionImages/${title}/image.jpg`); // Update path accordingly
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error(`Error fetching image for ${title}:`, err);
      return "/default-placeholder.png"; // Fallback placeholder image
    }
  };

  const handleBid = async (item: AuctionItem) => {
    const email = getCurrentUserEmail();
    const userRef = doc(db, "users", email);
    const prevBidder = item.currentBidder;
    const prevBid = item.currentBid;

    try {
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        throw new Error("User does not exist.");
      }

      const userData = userSnapshot.data();
      const currentPoints = userData.points;

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

      const auctionItemRef = doc(db, "auction", item.id);
      await updateDoc(auctionItemRef, {
        currentBid: newBid,
        currentBidder: email,
      });

      await updateDoc(userRef, {
        points: currentPoints - newBid,
      });

      if (prevBidder) {
        await handlePointReturn(prevBidder, prevBid);
      }

      alert("Your bid was placed successfully.");
      fetchAuctionListings();
      fetchMyBids();
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid. Please try again.");
    }
  };

  const handlePointReturn = async (email: string, bid: number) => {
    const userRef = doc(db, "users", email);

    try {
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
      console.error("Error returning points to previous bidder:", error);
    }
  };

  return (
    <div className="auction-house-container">
      <div className="user-points-section">
        <p>Your Points: {userPoints}</p>
        <div className="user-info-actions">
          <button onClick={() => router.push("/AuctionHouseHistory")}>
            View Completed Auction History
          </button>
        </div>
      </div>

      <div className="my-bids-section">
        <h2>Items You Have Bidded On</h2>
        {myBids.length > 0 ? (
          <div className="my-bids-grid">
            {myBids.map((item) => (
              <div key={item.id} className="auction-item-card">
                <img src={item.imageUrl || "/placeholder.png"} alt={item.title} className="auction-item-image" />
                <h3>{item.title}</h3>
                <p>{item.details}</p>
                <p><strong>Current Bid:</strong> {item.currentBid}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>You have not placed any bids yet.</p>
        )}
      </div>

      <div className="active-auctions-section">
        <h2>Auction House</h2>
        {auctionListings.length > 0 ? (
          <div className="active-auctions-grid">
            {auctionListings.map((item) => (
              <div key={item.id} className="auction-item-card">
                <img src={item.imageUrl || "/placeholder.png"} alt={item.title} className="auction-item-image" />
                <h3>{item.title}</h3>
                <p>{item.details}</p>
                <p><strong>Current Bid:</strong> {item.currentBid}</p>
                <button onClick={() => handleBid(item)}>Place a Bid</button>
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
