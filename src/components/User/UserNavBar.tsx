"use client";

import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { getCurrentUserEmail } from "./userInfo";

export const UserNavbar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // const [showNotifications, setShowNotifications] = useState(false);
  // const [notifications, setNotifications] = useState<number>(0);

  const navigation = [
    { label: "Product", href: "/Product" },
    { label: "Voucher", href: "/Voucher" },
    { label: "Request Product", href: "/ReqProductUser" },
    { label: "Mission", href: "/Mission" },
  ];

  const currentUserEmail = getCurrentUserEmail();

  // Fetch preorders and stock to check notifications
  // const fetchNotifications = async () => {
  //   if (!currentUserEmail) return;
  
  //   try {
  //     // Fetch preorders for the current user
  //     const preorderCollectionRef = collection(
  //       db,
  //       "users",
  //       currentUserEmail,
  //       "Preorders"
  //     );
  //     const preorderSnapshot = await getDocs(preorderCollectionRef);
  
  //     // Fetch all products
  //     const productCollectionRef = collection(db, "Products");
  //     const productSnapshot = await getDocs(productCollectionRef);
  
  //     // Map stock data
  //     const productStock = productSnapshot.docs.reduce((map, doc) => {
  //       const data = doc.data();
  //       map[doc.id] = data.Stock;
  //       return map;
  //     }, {} as Record<string, number>);
  
  //     let count = 0; // Notification count
  //     const fulfilledPreorders: string[] = []; // Track fulfilled preorders
  
  //     preorderSnapshot.forEach((doc) => {
  //       const preorder = doc.data();
  //       const productId = preorder.productId; // Ensure preorders have productId
  //       const preorderQuantity = preorder.quantity || 0;
  
  //       const stockAvailable = productStock[productId] || 0;
  
  //       if (stockAvailable >= preorderQuantity) {
  //         count++;
  //         fulfilledPreorders.push(doc.id); // Track fulfilled preorder IDs
  //       }
  //     });
  
  //     // Update notifications count
  //     setNotifications(count);
  
  //     // Remove fulfilled preorders from Firestore
  //     for (const preorderId of fulfilledPreorders) {
  //       const preorderDocRef = doc(
  //         db,
  //         "users",
  //         currentUserEmail,
  //         "Preorders",
  //         preorderId
  //       );
  //       await deleteDoc(preorderDocRef);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching notifications:", error);
  //   }
  // };
  
  

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  const handleConfirmLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="w-full ">
      <nav
        className="container relative flex items-center justify-between mx-auto lg:flex-row lg:justify-between xl:px-1 rounded-lg shadow-lg"
        style={{ padding: "8px 16px", height: "150px" }}
      >
        {/* Logo */}
        <Link href="/Product">
          <span className="flex items-center space-x-2 text-2xl font-medium text-indigo-500 dark:text-gray-100">
            <Image
              src="/img/FullMWHLogo.png"
              width={250}
              height={150}
              alt="Logo"
              className="w-auto h-auto"
            />
          </span>
        </Link>

        {/* Centered Navigation Links */}
        <ul className="flex items-center justify-center gap-6 flex-grow">
          {navigation.map((menu, index) => (
            <li key={index}>
              <Link
                href={menu.href}
                className="text-gray-800 dark:text-gray-200 hover:text-indigo-500 hover:bg-indigo-100 px-4 py-2 rounded-md"
              >
                {menu.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right-Aligned Buttons */}
        <div className="flex items-center gap-4">
          {/* Notification Button */}
          {/* <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center w-12 h-12 text-white bg-blue-600 rounded-full hover:bg-blue-700"
            >
              🔔
              {notifications > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {notifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-50 w-64 p-4 mt-2 bg-white border rounded shadow-lg">
                {notifications > 0 ? (
                  <p className="text-sm text-gray-700">
                    {notifications} preorders can be fulfilled. Check inventory!
                  </p>
                ) : (
                  <p className="text-sm text-gray-700">
                    No new notifications.
                  </p>
                )}
                
              </div>
            )}
          </div> */}

          {/* Cart Button */}
          <Link
            href="/Cart"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center h-12"
          >
            Cart
          </Link>

          {/* Log Out Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center h-12"
            style={{ marginTop: "20px" }}
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-md shadow-lg">
            <h2 className="text-lg font-bold text-gray-800">Confirm Logout</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to log out?
            </p>
            <div className="flex items-center justify-end mt-4 space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
