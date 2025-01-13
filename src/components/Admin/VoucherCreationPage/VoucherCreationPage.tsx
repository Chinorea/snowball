"use client";

import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css";

interface Voucher {
  VoucherID: string;
  Description: string;
  ExpiryDate: string;
  VoucherType: "pointDeduction" | "percentDeduction";
  Amount: number;
}

export const VoucherCreationPage = () => {
  const [newVoucher, setNewVoucher] = useState<Omit<Voucher, "VoucherID">>({
    Description: "",
    ExpiryDate: "",
    VoucherType: "pointDeduction",
    Amount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateRandomVoucherID = (): string => {
    return Math.random().toString(36).substr(2, 10).toUpperCase();
  };

  const handleCreateVoucher = async () => {
    if (
      !newVoucher.Description.trim() ||
      !newVoucher.ExpiryDate.trim() ||
      newVoucher.Amount <= 0
    ) {
      alert("Please fill in all required fields and ensure Amount is greater than 0.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const vouchersCollectionRef = collection(db, "vouchers");
      const randomVoucherID = generateRandomVoucherID();

      await addDoc(vouchersCollectionRef, {
        VoucherID: randomVoucherID,
        Description: newVoucher.Description,
        ExpiryDate: newVoucher.ExpiryDate,
        voucherType: newVoucher.VoucherType,
        pointsORpecent: newVoucher.Amount,
      });

      setSuccessMessage(`Voucher created successfully! ID: ${randomVoucherID}`);
      setNewVoucher({
        Description: "",
        ExpiryDate: "",
        VoucherType: "pointDeduction",
        Amount: 0,
      });
    } catch (error) {
      console.error("Error creating voucher:", error);
      setErrorMessage("Failed to create voucher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-voucher-container">
      <h1>Create a New Voucher</h1>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={newVoucher.Description}
          onChange={(e) =>
            setNewVoucher({ ...newVoucher, Description: e.target.value })
          }
          placeholder="Enter a brief description of the voucher"
        />
      </div>

      <div className="form-group">
        <label>Expiry Date:</label>
        <input
          type="date"
          value={newVoucher.ExpiryDate}
          onChange={(e) =>
            setNewVoucher({ ...newVoucher, ExpiryDate: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Voucher Type:</label>
        <select
          value={newVoucher.VoucherType}
          onChange={(e) =>
            setNewVoucher({
              ...newVoucher,
              VoucherType: e.target.value as
                | "pointDeduction"
                | "percentDeduction",
            })
          }
        >
          <option value="Points Deduction Voucher">Points Deduction Voucher</option>
          <option value="Percent Deduction Voucher">Percent Deduction Voucher</option>
        </select>
      </div>

      <div className="form-group">
        <label>Amount (in points or %):</label>
        <input
          type="number"
          value={newVoucher.Amount}
          onChange={(e) =>
            setNewVoucher({ ...newVoucher, Amount: Number(e.target.value) })
          }
          placeholder="Enter the amount (e.g., 5, 50)"
        />
      </div>

      <button
        onClick={handleCreateVoucher}
        className="create-voucher-button"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Voucher"}
      </button>
    </div>
  );
};
