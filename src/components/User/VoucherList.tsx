import React, { useState, useEffect } from "react";
import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export const VoucherList = ({ setSelectedVoucher }: { setSelectedVoucher: (voucherId: string) => void }) => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVouchers = async () => {
    try {
      const userDocRef = doc(db, "users", "tester@gmail.com");
      const vouchersCollectionRef = collection(userDocRef, "Vouchers");
      const vouchersSnapshot = await getDocs(vouchersCollectionRef);
      const fetchedVouchers = vouchersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          VoucherID: data.VoucherID || "No ID",
          Description: data.Description || "No description",
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
      <select onChange={(e) => setSelectedVoucher(e.target.value)} defaultValue="">
        <option value="" disabled>Select a Voucher</option>
        {vouchers.map((voucher) => (
          <option key={voucher.id} value={voucher.VoucherID}>
            {voucher.VoucherID} - {voucher.Description}
          </option>
        ))}
      </select>
    </div>
  );
};
