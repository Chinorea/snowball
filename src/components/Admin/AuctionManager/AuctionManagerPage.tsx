"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css";

interface AuctionItem {
  id: string;
  title: string;
  details: string;
  currentBid: number;
  currentBidder: string;
  auctionFinishDate: string;
  completedBid: boolean;
}

export const AuctionManagerPage = () => {
  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([]);
  const [newAuctionItem, setNewAuctionItem] = useState<Omit<AuctionItem, "id" | "currentBidder" | "completedBid">>({
    title: "",
    details: "",
    auctionFinishDate: "",
    currentBid: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateAuctionModal, setShowCreateAuctionModal] = useState(false);

  useEffect(() => {
    fetchAuctionItems();
  }, []);

  const fetchAuctionItems = async () => {
    try {
      const auctionCollectionRef = collection(db, "auction");
      const auctionSnapshot = await getDocs(auctionCollectionRef);
      const fetchedItems = auctionSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuctionItem[];
      setAuctionItems(fetchedItems);
    } catch (err) {
      console.error("Error fetching auction items:", err);
      setError("Failed to fetch auction items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const closeBid = async (item: AuctionItem) => {
    const auctionItemRef = doc(db, "auction", item.id);
    try {
      const itemSnapshot = await getDoc(auctionItemRef);
      const timestamp =  new Date().toISOString().split('T')[0];
      if (!itemSnapshot.exists()) {
        throw new Error("Auction item does not exist.");
      }

      await updateDoc(auctionItemRef, {
        completedBid: true,
        auctionFinishDate: timestamp
      });

      const auctionWinner = itemSnapshot.data().currentBidder;

      createCompletedBid(item, auctionWinner, timestamp);
      alert("Auction closed successfully!");
      fetchAuctionItems();
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid. Please try again.");
    }
  };


  const createCompletedBid = async (item: AuctionItem, user: string, timestamp: string) => {
    const userDocRef = doc(db, "users", user);
    const auctionRef = collection(userDocRef, "auctions");
    await setDoc(doc(auctionRef, item.id), {
      title: item.title,
      details: item.details,
      auctionFinishDate: timestamp,
      currentBid: item.currentBid,
      completedBid: true,
    })
  }

  const handleCreateAuction = async () => {
    if (!newAuctionItem.title.trim() || !newAuctionItem.details.trim() || !newAuctionItem.auctionFinishDate.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const auctionCollectionRef = collection(db, "auction");
      await addDoc(auctionCollectionRef, {
        title: newAuctionItem.title,
        details: newAuctionItem.details,
        auctionFinishDate: newAuctionItem.auctionFinishDate,
        currentBid: newAuctionItem.currentBid,
        currentBidder: "",
        completedBid: false,
      });

      alert("Auction created successfully!");
      setNewAuctionItem({
        title: "",
        details: "",
        auctionFinishDate: "",
        currentBid: 0,
      });
      setShowCreateAuctionModal(false);
      fetchAuctionItems();
    } catch (err) {
      console.error("Error creating auction:", err);
      alert("Failed to create auction. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="auction-house-container">
      <div className="header-with-button">
        <h1>Auction House</h1>
        <button onClick={() => setShowCreateAuctionModal(true)}>Add New Auction</button>
      </div>

      <div className="active-auctions-section">
        <h2>Active Auctions</h2>
        <table className="missions-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Details</th>
              <th>Current Bid</th>
              <th>Current Bidder</th>
              <th>Auction Finish Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {auctionItems
              .filter((item) => !item.completedBid)
              .map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.details}</td>
                  <td>{item.currentBid}</td>
                  <td>{item.currentBidder || "No bids yet"}</td>
                  <td>{item.auctionFinishDate}</td>
                  <td>
                    <button
                      className="bid-button"
                      onClick={() => closeBid(item)}
                    >
                      Close Bid
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="completed-auctions-section">
        <h2>Completed Auctions</h2>
        <table className="missions-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Details</th>
              <th>Winning Bid</th>
              <th>Winner</th>
              <th>Auction Finish Date</th>
            </tr>
          </thead>
          <tbody>
            {auctionItems
              .filter((item) => item.completedBid)
              .map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.details}</td>
                  <td>{item.currentBid}</td>
                  <td>{item.currentBidder || "No winner"}</td>
                  <td>{item.auctionFinishDate.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showCreateAuctionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Auction</h2>
            <div>
              <label>Title:</label>
              <input
                type="text"
                value={newAuctionItem.title}
                onChange={(e) => setNewAuctionItem({ ...newAuctionItem, title: e.target.value })}
              />
            </div>
            <div>
              <label>Details:</label>
              <textarea
                value={newAuctionItem.details}
                onChange={(e) => setNewAuctionItem({ ...newAuctionItem, details: e.target.value })}
              />
            </div>
            <div>
              <label>Minimum Starting Bid:</label>
              <input
                type="number"
                value={newAuctionItem.currentBid}
                onChange={(e) => setNewAuctionItem({ ...newAuctionItem, currentBid: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label>Auction Finish Date:</label>
              <input
                type="date"
                value={newAuctionItem.auctionFinishDate}
                onChange={(e) =>
                  setNewAuctionItem({ ...newAuctionItem, auctionFinishDate: e.target.value })
                }
              />
            </div>
            <button onClick={handleCreateAuction}>Create Auction</button>
            <button onClick={() => setShowCreateAuctionModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};
