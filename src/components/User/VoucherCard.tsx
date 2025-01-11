"use client";

import React, { useState, useEffect } from "react";
import { doc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { QRCodeSVG } from "qrcode.react";
import "./style.css";

export const VoucherCard = () => {
  const [vouchers, setVouchers] = useState<any[]>([]); // State to store vouchers
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState<string | null>(null); // State to track error
  const [activePopup, setActivePopup] = useState<string | null>(null); // State to track active popup
  const [showQR, setShowQR] = useState<boolean>(false); // State to track QR code visibility

  // Function to format expiry date
  const formatExpiryDate = (expiryDate: any) => {
    if (expiryDate && expiryDate.toDate) {
      return expiryDate.toDate().toLocaleDateString(); // Format the Firebase timestamp to a readable date
    }
    return expiryDate;
  };

  // Fetch vouchers from Firestore
  const fetchVouchers = async () => {
    try {
      // Reference to the user's document and Vouchers subcollection
      const userDocRef = doc(db, "users", "tester@gmail.com"); //TODO: bring actual Email
      const vouchersCollectionRef = collection(userDocRef, "Vouchers");

      // Fetch all documents in the Vouchers subcollection
      const vouchersSnapshot = await getDocs(vouchersCollectionRef);
      const fetchedVouchers = vouchersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id, // Firestore document ID
          VoucherID: data.VoucherID || "No ID", // Extract VoucherID
          Description: data.Description || "No description", // Extract Description
          ExpiryDate: formatExpiryDate(data.ExpiryDate) || "No expiry date", // Format and Extract ExpiryDate
        };
      });

      setVouchers(fetchedVouchers); // Store vouchers in state
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setError("There was an error fetching the vouchers. Please try again later.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Toggle popup for a specific voucher
  const togglePopup = (voucherId: string) => {
    setShowQR(false); // Reset QR code visibility
    setActivePopup(activePopup === voucherId ? null : voucherId); // Toggle popup visibility
  };

  const confirmVoucher = () => {
    setShowQR(true); // Show QR code when confirmed
  };

  useEffect(() => {
    fetchVouchers();
  }, []); // Run once on component mount

  // If loading, show a loading spinner or message
  if (loading) {
    return <div>Loading vouchers...</div>;
  }

  // If error occurred, show an error message
  if (error) {
    return <div>{error}</div>;
  }

  // Render voucher cards
  return (
    <div>
      <h1>Vouchers</h1>
      <div className="voucher-container">
        {vouchers.length > 0 ? (
          vouchers.map((voucher) => (
            <div className="voucher-card" key={voucher.id}>
              <div className="voucher-content">
                <h3>Voucher ID: {voucher.VoucherID}</h3>
                <p>Description: {voucher.Description}</p>
                <p>Expiry Date: {voucher.ExpiryDate}</p>
              </div>

              {/* Blue button inside each card */}
              <button className="popup-button" onClick={() => togglePopup(voucher.id)}>
                Show Details
              </button>

              {/* Popup Screen for specific voucher */}
              {activePopup === voucher.id && (
                <div className="popup-overlay">
                  <div className="popup-content">
                    {!showQR ? (
                      <>
                        <h2>Voucher Details</h2>
                        <p>
                          <strong>Voucher ID:</strong> {voucher.VoucherID}
                        </p>
                        <p>
                          <strong>Description:</strong> {voucher.Description}
                        </p>
                        <p>
                          <strong>Expiry Date:</strong> {voucher.ExpiryDate}
                        </p>
                        <div className="popup-buttons">
                          <button onClick={() => togglePopup(voucher.id)}>Close</button>
                          <button onClick={confirmVoucher}>Confirm</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2>Voucher QR Code</h2>
                        {/* Display QR Code containing VoucherID */}
                        <QRCodeSVG value={voucher.VoucherID} size={200} />
                        <p>Scan this QR code to use the voucher.</p>
                        <button onClick={() => togglePopup(voucher.id)}>Close</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No vouchers available.</p>
        )}
      </div>
    </div>
  );
};
