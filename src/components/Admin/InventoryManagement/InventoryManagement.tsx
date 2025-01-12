"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import "./style.css";

export const InventoryManagement = () => {
  const [products, setProducts] = useState<
    { id: string; Name: string; PointsRequired: number; Stock: number }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState({
    Name: "",
    PointsRequired: "",
    Stock: "",
  });
  const [editProduct, setEditProduct] = useState<any>(null); // For editing modal

  // Fetch all products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Products"));
      const fetchedProducts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          Name: doc.id, // Product name is the document ID
          PointsRequired: parseInt(data.PointsRequired) || 0,
          Stock: parseInt(data.Stock) || 0,
        };
      });
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Add new product to Firestore
  const handleAddProduct = async () => {
    if (!newProduct.Name || !newProduct.PointsRequired || !newProduct.Stock) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const productRef = doc(db, "Products", newProduct.Name); // Use the product name as the document ID
      await setDoc(productRef, {
        PointsRequired: newProduct.PointsRequired,
        Stock: newProduct.Stock,
      });
      fetchProducts(); // Refresh the product list
      setNewProduct({ Name: "", PointsRequired: "", Stock: "" }); // Reset form
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Update product points required and stock
  const handleSaveChanges = async () => {
    if (!editProduct) return;

    try {
      const productRef = doc(db, "Products", editProduct.id);
      await updateDoc(productRef, {
        PointsRequired: editProduct.PointsRequired,
        Stock: editProduct.Stock,
      });
      setEditProduct(null); // Close the modal
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id: string) => {
    try {
      const productRef = doc(db, "Products", id);
      await deleteDoc(productRef);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-container">
      <h1 className="title">Inventory Management</h1>

      {/* Add Product Form */}
      <div className="add-product-form">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.Name}
          onChange={(e) =>
            setNewProduct((prev) => ({ ...prev, Name: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Points Required"
          value={newProduct.PointsRequired}
          onChange={(e) =>
            setNewProduct((prev) => ({
              ...prev,
              PointsRequired: e.target.value,
            }))
          }
        />
        <input
          type="number"
          placeholder="Stock"
          value={newProduct.Stock}
          onChange={(e) =>
            setNewProduct((prev) => ({ ...prev, Stock: e.target.value }))
          }
        />
        <button onClick={handleAddProduct} className="add-button">
          Add Product
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search Product"
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Product Table */}
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Points Required</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.Name}</td>
                <td>{product.PointsRequired}</td>
                <td>{product.Stock}</td>
                <td>
                  <button
                    onClick={() => setEditProduct(product)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="empty-message">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Edit Product</h2>
            <label>
              Points Required:
              <input
                type="number"
                value={editProduct.PointsRequired}
                onChange={(e) =>
                  setEditProduct((prev: any) => ({
                    ...prev,
                    PointsRequired: parseInt(e.target.value),
                  }))
                }
              />
            </label>
            <label>
              Stock:
              <input
                type="number"
                value={editProduct.Stock}
                onChange={(e) =>
                  setEditProduct((prev: any) => ({
                    ...prev,
                    Stock: parseInt(e.target.value),
                  }))
                }
              />
            </label>
            <div className="modal-actions">
              <button onClick={handleSaveChanges} className="save-button">
                Save
              </button>
              <button
                onClick={() => setEditProduct(null)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
