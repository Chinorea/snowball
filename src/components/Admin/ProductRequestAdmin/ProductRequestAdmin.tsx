"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig"; // Adjust the path to your Firebase config
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import "./style.css"; // Import the CSS file

export const ProductRequestApproval = () => {
  // State to hold requested products
  const [requestedProducts, setRequestedProducts] = useState<
    { id: string; Name: string; Amount: number; Status: string }[]
  >([]);

  // Fetch all requested products from Firestore
  const fetchRequestedProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Requested Product"));
      const products = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id, // Firestore document ID
          Name: data.Name || "Unknown", // Default to "Unknown" if Name is missing
          Amount: data.Amount || 0, // Default to 0 if Amount is missing
          Status: data.Status || "Pending", // Default to "Pending" if Status is missing
        };
      });
      setRequestedProducts(products);
    } catch (error) {
      console.error("Error fetching requested products:", error);
    }
  };

  // Approve a product request
  const handleApprove = async (id: string) => {
    try {
      const productRef = doc(db, "Requested Product", id);
      await updateDoc(productRef, { Status: "Approved" });
      fetchRequestedProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error approving product request:", error);
    }
  };

  // Reject a product request
  const handleReject = async (id: string) => {
    try {
      const productRef = doc(db, "Requested Product", id);
      await updateDoc(productRef, { Status: "Rejected" });
      fetchRequestedProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error rejecting product request:", error);
    }
  };

  // Remove a product request
  const handleRemove = async (id: string) => {
    try {
      const productRef = doc(db, "Requested Product", id);
      await deleteDoc(productRef); // Permanently remove from Firestore
      fetchRequestedProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error removing product request:", error);
    }
  };

  // Load requested products on component mount
  useEffect(() => {
    fetchRequestedProducts();
  }, []);

  return (
    <div className="request-approval-container">
      <h1 className="title">Product Request Approval</h1>
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requestedProducts.length > 0 ? (
            requestedProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.Name}</td>
                <td>{product.Amount}</td>
                <td>{product.Status}</td>
                <td>
                  {product.Status === "Pending" ? (
                    <>
                      <button
                        onClick={() => handleApprove(product.id)}
                        className="approve-button"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(product.id)}
                        className="reject-button"
                      >
                        Reject
                      </button>
                    </>
                  ) : product.Status === "Rejected" ? (
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  ) : (
                    <span className="status-text">{product.Status}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="empty-message">
                No product requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
