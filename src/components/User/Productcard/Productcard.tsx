"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Ensure your Firebase configuration is set up
import { useRouter } from "next/navigation"; 
import "./style.css"; // Include the CSS file
import { getCurrentUserEmail } from "../userInfo";

interface Product {
  id: string;
  name: string;
  stock: number;
  pointsRequired: number;
}

interface User {
  id: string;
  points: number;
}

export const ProductCardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productCollectionRef = collection(db, "Products");
      const productSnapshot = await getDocs(productCollectionRef);

      const fetchedProducts = productSnapshot.docs.map((doc) => {
        const productName = doc.id;
        const data = doc.data();
        return {
          id: doc.id,
          name: productName || "Unnamed Product",
          stock: data.Stock || 0,
          pointsRequired: data.PointsRequired || 0,
        };
      });

      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user points from Firestore
  const fetchUser = async () => {
    const currentUserEmail = getCurrentUserEmail();
    try {
      if (!currentUserEmail) {
        router.push("/");
      }
      const userDocRef = doc(db, "users", currentUserEmail);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({ id: userDoc.id, points: userData.points || 0 });
      } else {
        console.error("User document does not exist");
        setError("User data not found.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUser();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      alert("User data is not loaded.");
      return;
    }

    try {
      const cartRef = collection(db, "users", user.id, "CartList");
      const cartDocRef = doc(cartRef, product.id);

      // Check if the product already exists in the cart
      const cartDoc = await getDoc(cartDocRef);

      if (cartDoc.exists()) {
        // If product exists, check quantity and stock
        const currentQuantity = cartDoc.data()?.quantity || 0;
        if (currentQuantity < product.stock) {
          const newQuantity = currentQuantity + 1;
          await updateDoc(cartDocRef, { quantity: newQuantity });
          alert(`${product.name} quantity updated in your cart.`);
        } else {
          alert(`Cannot add more than ${product.stock} of ${product.name} to your cart.`);
        }
      } else {
        // If the product does not exist in the cart, add it with quantity 1
        await setDoc(cartDocRef, {
          name: product.name,
          stock: product.stock,
          pointsRequired: product.pointsRequired,
          quantity: 1,
        });
        alert(`${product.name} has been added to your cart.`);
      }
    } catch (err) {
      console.error("Error adding product to cart:", err);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  const handlePreOrder = (product: Product) => {
    router.push("/Preorder");
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {user && (
        <div className="user-info">
          <p>
            <strong>Your Points:</strong> {user.points}
          </p>
          <div className="user-info-actions">
            <button onClick={() => router.push("/TransactionHistory")}>
              View Transaction History
            </button>
            <button onClick={() => router.push("/Preorderlist")}>
              View Pre-order
            </button>
          </div>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
              {product.stock > 0 ? (
                <button
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              ) : (
                <button
                  className="preorder-button"
                  onClick={() =>
                    router.push(
                      `/Preorder?productName=${product.name}&pointsRequired=${product.pointsRequired}`
                    )
                  }
                >
                  Pre-order
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No products match your search.</p>
        )}
      </div>
    </div>
  );
};
