"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig"; // Adjust the path to your Firebase config
import { collection, getDocs, addDoc } from "firebase/firestore";
import "./style.css"; // Import the CSS file

export const UserRequestProduct = () => {
  const [productName, setProductName] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [requestedProducts, setRequestedProducts] = useState<
    { id: string; Name: string; Amount: number }[]
  >([]);

  // Fetch all requested products from Firestore
  const fetchRequestedProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Requested Product"));
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        Name: doc.data().Name,
        Amount: doc.data().Amount,
      }));
      setRequestedProducts(products);
    } catch (error) {
      console.error("Error fetching requested products:", error);
    }
  };

  // Add or update a requested product in Firestore
  const handleRequestProduct = async () => {
    if (!productName.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (productQuantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      await addDoc(collection(db, "Requested Product"), {
        Name: productName,
        Amount: productQuantity,
      });

      setProductName("");
      setProductQuantity(1);
      fetchRequestedProducts();
    } catch (error) {
      console.error("Error requesting product:", error);
    }
  };

  // Load requested products on component mount
  useEffect(() => {
    fetchRequestedProducts();
  }, []);

  return (
    <div className="request-product-container">
      <h1 className="title">Request a Product</h1>

      <div className="request-form">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="input"
          placeholder="Enter the product you want to request"
        />
        <input
          type="number"
          value={productQuantity}
          onChange={(e) => setProductQuantity(Number(e.target.value))}
          className="input quantity-input"
          min="1"
          placeholder="Quantity"
        />
        <button onClick={handleRequestProduct} className="button">
          Request
        </button>
      </div>

      <h2 className="subtitle">Already Requested Products</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {requestedProducts.length > 0 ? (
            requestedProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.Name}</td>
                <td>{product.Amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="empty-message">
                No products have been requested yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
