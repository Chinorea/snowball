"use client";

import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import "./style.css";

interface Voucher {
  VoucherID: string;
  Description: string;
  ExpiryDate: string;
  Requirement: string;
  RequirementTag: string;
}

export const VoucherCreationPage = () => {
  const [newVoucher, setNewVoucher] = useState<Voucher>({
    VoucherID: "",
    Description: "",
    ExpiryDate: "",
    Requirement: "",
    RequirementTag: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateVoucher = async () => {
    if (
      !newVoucher.VoucherID.trim() ||
      !newVoucher.Description.trim() ||
      !newVoucher.ExpiryDate.trim() ||
      !newVoucher.Requirement.trim() ||
      !newVoucher.RequirementTag.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const vouchersCollectionRef = collection(
        db,
        "vouchers" // Replace with the correct Firestore collection path
      );

      await addDoc(vouchersCollectionRef, {
        VoucherID: newVoucher.VoucherID,
        Description: newVoucher.Description,
        ExpiryDate: newVoucher.ExpiryDate,
        Requirement: newVoucher.Requirement,
        RequirementTag: newVoucher.RequirementTag,
      });

      setSuccessMessage("Voucher created successfully!");
      setNewVoucher({
        VoucherID: "",
        Description: "",
        ExpiryDate: "",
        Requirement: "",
        RequirementTag: "",
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
        <label>Voucher ID:</label>
        <input
          type="text"
          value={newVoucher.VoucherID}
          onChange={(e) =>
            setNewVoucher({ ...newVoucher, VoucherID: e.target.value })
          }
          placeholder="Enter a unique Voucher ID"
        />
      </div>

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
        <label>Requirement:</label>
        <input
          type="text"
          value={newVoucher.Requirement}
          onChange={(e) =>
            setNewVoucher({ ...newVoucher, Requirement: e.target.value })
          }
          placeholder="Enter any requirements (e.g., points, milestones)"
        />
      </div>

      <div className="form-group">
        <label>Requirement Tag:</label>
        <input
          type="text"
          value={newVoucher.RequirementTag}
          onChange={(e) =>
            setNewVoucher({ ...newVoucher, RequirementTag: e.target.value })
          }
          placeholder="Enter a requirement tag (e.g., 'gold', 'silver')"
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
