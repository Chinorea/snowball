"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Ensure your Firebase configuration is set up
import "./style.css"; // Include the CSS file

interface Product {
  id: string;
  name: string;
  stock: number;
  pointsRequired: number;
}

export const ProductCardPage = () => {
  const [products, setProducts] = useState<Product[]>([]); // State to store products
  const [searchTerm, setSearchTerm] = useState(""); // State to track the search input
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for errors

  // Fetch products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productCollectionRef = collection(db, "Products"); // Reference to Product collection
      const productSnapshot = await getDocs(productCollectionRef);

      // Map through the documents and structure the product data
      const fetchedProducts = productSnapshot.docs.map((doc) => {
        const productName = doc.id;
        const data = doc.data();
        return {
          id: doc.id, // Firestore document ID
          name: productName || "Unnamed Product", // Product name
          stock: data.Stock || 0, // Stock field
          pointsRequired: data.PointsRequired || 0, // Points required to redeem
        };
      });

      setProducts(fetchedProducts); // Set the fetched products in state
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch products on component mount
  }, []);

  // Handle the redeem button click
  const handleRedeem = async (product: Product) => {
    if (product.stock > 0) {
      try {
        const productRef = doc(db, "Products", product.id); // Reference to the product document
        const updatedStock = product.stock - 1;

        // Update the stock in Firestore
        await updateDoc(productRef, { Stock: updatedStock });

        // Update the stock in the UI
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === product.id ? { ...p, stock: updatedStock } : p
          )
        );

        alert(`Redeemed: ${product.name}`);
      } catch (err) {
        console.error("Error redeeming product:", err);
        alert("Failed to redeem product. Please try again.");
      }
    } else {
      alert(`Sorry, ${product.name} is out of stock.`);
    }
  };

  // Filter products based on the search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading products...</div>; // Show loading message
  }

  if (error) {
    return <div>{error}</div>; // Show error message
  }

  return (
    <div>
      <h1>Product Redemption</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Cards */}
      <div className="product-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <h3>{product.name}</h3>
              <p>
                <strong>Stock Left:</strong> {product.stock}
              </p>
              <p>
                <strong>Points Required:</strong> {product.pointsRequired}
              </p>
              <button
                className="redeem-button"
                onClick={() => handleRedeem(product)}
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? "Redeem" : "Out of Stock"}
              </button>
            </div>
          ))
        ) : (
          <p>No products match your search.</p>
        )}
      </div>
    </div>
  );
};
