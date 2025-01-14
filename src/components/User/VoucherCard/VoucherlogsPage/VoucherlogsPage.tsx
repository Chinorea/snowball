"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getCurrentUserEmail } from "../../userInfo";
import "./style.css";

export const VoucherLogsPage = () => {
  const [usedVouchers, setUsedVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format Firestore Timestamps
  const formatFirestoreTimestamp = (timestamp: any) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return "Invalid date";
  };

  const fetchUsedVouchers = async () => {
    try {
      const currentUserEmail = getCurrentUserEmail();
      if (!currentUserEmail) {
        throw new Error("User email not found.");
      }

      const usedVouchersCollectionRef = collection(
        db,
        "users",
        currentUserEmail,
        "usedVouchers"
      );

      const vouchersSnapshot = await getDocs(usedVouchersCollectionRef);
      const fetchedVouchers = vouchersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          VoucherID: data.VoucherID || "No ID",
          Description: data.Description || "No description",
          ExpiryDate: data.ExpiryDate || "No expiry date",
          PointsOrPercent: data.PointORpercent || 0,
          VoucherType: data.voucherType || "Unknown",
          TimestampUsed: formatFirestoreTimestamp(data.timestamp), // Format timestamp
        };
      });

      setUsedVouchers(fetchedVouchers);
    } catch (error) {
      console.error("Error fetching used vouchers:", error);
      setError("There was an error fetching the used vouchers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsedVouchers();
  }, []);

  if (loading) {
    return <div>Loading used vouchers...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="voucher-logs-container">
      {usedVouchers.length > 0 ? (
        <table className="voucher-logs-table">
          <thead>
            <tr>
              <th>Voucher ID</th>
              <th>Description</th>
              <th>Expiry Date</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Timestamp Used</th>
            </tr>
          </thead>
          <tbody>
            {usedVouchers.map((voucher) => (
              <tr key={voucher.id}>
                <td>{voucher.VoucherID}</td>
                <td>{voucher.Description}</td>
                <td>{voucher.ExpiryDate}</td>
                <td>{voucher.VoucherType}</td>
                <td>
                  {voucher.VoucherType === "percentDeduction"
                    ? `${voucher.PointsOrPercent}%`
                    : `${voucher.PointsOrPercent} Points`}
                </td>
                <td>{voucher.TimestampUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No used vouchers found.</p>
      )}
    </div>
  );
};
