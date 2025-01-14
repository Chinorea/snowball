"use client";

import React, { useState, useEffect } from "react";
import { doc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { QRCodeSVG } from "qrcode.react";
import "./style.css";
import { getCurrentUserEmail, getIsAdmin } from "../userInfo";
import { useRouter } from "next/navigation";

export const VoucherCard = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<boolean>(false);
  const router = useRouter();

  const formatExpiryDate = (expiryDate: any) => {
    if (expiryDate && expiryDate.toDate) {
      return expiryDate.toDate().toLocaleDateString();
    }
    return expiryDate;
  };

  const fetchVouchers = async () => {
    try {
      const isAdmin = getIsAdmin();
      const currentUserEmail = getCurrentUserEmail();
      if (currentUserEmail == "" || isAdmin == false) {
        router.push("");
      }
      const userDocRef = doc(db, "users", currentUserEmail);
      const vouchersCollectionRef = collection(userDocRef, "Vouchers");
      const vouchersSnapshot = await getDocs(vouchersCollectionRef);
      const fetchedVouchers = vouchersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          VoucherID: data.VoucherID || "No ID",
          Description: data.Description || "No description",
          ExpiryDate: formatExpiryDate(data.ExpiryDate) || "No expiry date",
        };
      });

      setVouchers(fetchedVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setError("There was an error fetching the vouchers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const togglePopup = (voucherId: string) => {
    setShowQR(false);
    setActivePopup(activePopup === voucherId ? null : voucherId);
  };

  const confirmVoucher = () => {
    setShowQR(true);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  if (loading) {
    return <div>Loading vouchers...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="header">
        <button
          className="navigate-logs-button"
          onClick={() => router.push("/Voucher/Voucherlogs")}
        >
          View Used Vouchers
        </button>
      </div>
      <div className="voucher-container">
        {vouchers.length > 0 ? (
          vouchers.map((voucher) => (
            <div className="voucher-card" key={voucher.id}>
              <div className="voucher-content">
                <h3>Voucher ID: {voucher.VoucherID}</h3>
                <p>Description: {voucher.Description}</p>
                <p>Expiry Date: {voucher.ExpiryDate}</p>
              </div>
              <button className="popup-button" onClick={() => togglePopup(voucher.id)}>
                Show Details
              </button>
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
                        <div className="qr-code-container">
                          <QRCodeSVG value={voucher.VoucherID} size={200} />
                          <p>Scan this QR code to use the voucher.</p>
                          <button onClick={() => togglePopup(voucher.id)}>Close</button>
                        </div>
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
