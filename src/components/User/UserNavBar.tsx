"use client";
import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { useState } from "react";

export const UserNavbar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigation = [
    { label: "Product", href: "/Product" },
    { label: "Voucher", href: "/Voucher" },
    { label: "Request Product", href: "/ReqProductUser"}
  ];

  const handleConfirmLogout = () => {
    // Handle logout logic here
    window.location.href = "/";
  };

  return (
    <div className="w-full bg-light-blue">
      <nav
        className="container relative flex items-center justify-between mx-auto lg:flex-row lg:justify-between xl:px-1 bg-light-blue rounded-lg shadow-lg"
        style={{ padding: "8px 16px", height: "150px" }} // Adjust padding and height here
      >
        {/* Logo */}
        <Link href="/">
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
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center h-12 "   style={{ marginTop: "20px" }} 
          >
            Log Out
          </button>
        </div>

        {/* Mobile Menu Button */}
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                aria-label="Toggle Menu"
                className="px-2 py-1 text-gray-500 rounded-md lg:hidden hover:text-indigo-500 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {open ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  )}
                </svg>
              </Disclosure.Button>

              {/* Mobile Menu Items */}
              <Disclosure.Panel className="lg:hidden">
                {/* Navigation Links */}
                {navigation.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-gray-500 hover:text-indigo-500 px-4 py-2 rounded-md"
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Cart Button */}
                <button>
                  <Link
                    href="/Cart"
                    className="w-full px-4 py-2 text-center text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Cart
                  </Link>
                </button>

                {/* Log Out Button */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full px-4 py-2 text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Log Out
                </button>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
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
