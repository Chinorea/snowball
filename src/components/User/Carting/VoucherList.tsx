"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getCurrentUserEmail } from "../userInfo";

export const VoucherList = ({
  setSelectedVoucher,
}: {
  setSelectedVoucher: (voucher: any) => void;
}) => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVouchers = async () => {
    try {
      const CurrentUserEmail = getCurrentUserEmail();
      const userDocRef = doc(db, "users", CurrentUserEmail);
      const vouchersCollectionRef = collection(userDocRef, "Vouchers");
      const vouchersSnapshot = await getDocs(vouchersCollectionRef);

      const fetchedVouchers = vouchersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          VoucherID: data.VoucherID,
          Description: data.Description,
          ExpiryDate: data.ExpiryDate,
          PointORpercent: data.PointORpercent,
          voucherType: data.voucherType,
          timestamp: serverTimestamp(),
        };
      });

      setVouchers(fetchedVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setError("Unable to fetch vouchers. Please try again later.");
    } finally {
      setLoading(false);
    }
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
      <select
        onChange={(e) => {
          const selectedVoucher = vouchers.find(
            (voucher) => voucher.VoucherID === e.target.value
          );
          setSelectedVoucher(selectedVoucher);
        }}
        defaultValue=""
      >
        <option value="" disabled>
          Select a Voucher
        </option>
        {vouchers.map((voucher) => (
          <option key={voucher.id} value={voucher.VoucherID}>
            {voucher.VoucherID} - {voucher.Description}
          </option>
        ))}
      </select>
    </div>
  );
};
