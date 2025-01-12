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
  ];

  const handleConfirmLogout = () => {
    // Handle logout logic here
    window.location.href = "/";
  };

  return (
    <div className="w-full bg-light-blue">
      <nav className="container relative flex flex-wrap items-center justify-between p-4 mx-auto lg:justify-between xl:px-1 bg-light-blue rounded-lg shadow-lg">
        {/* Logo */}
        <Link href="/">
          <span className="flex items-center space-x-2 text-2xl font-medium text-indigo-500 dark:text-gray-100">
            <span>
              <Image
                src="/img/FullMWHLogo.png"
                width={250} // Adjusted width
                height={150} // Adjusted height
                alt="Logo"
                className="w-auto h-auto" // Ensures the logo does not overflow the container
              />
            </span>
          </span>
        </Link>

        {/* Cart and Log Out */}
        <div className="gap-3 nav__item mr-2 lg:flex ml-auto lg:ml-0 lg:order-2">
          <div className="hidden mr-3 lg:flex nav__item">
            {/* Cart Button */}
            <Link
              href="/Cart"
              className="px-6 py-2 text-white bg-green-600 rounded-md md:ml-5 hover:bg-green-700 flex items-center justify-center"
              style={{ height: "40px" }}
            >
              Cart
            </Link>

            {/* Log Out Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-6 py-2 text-white bg-indigo-600 rounded-md md:ml-5 hover:bg-indigo-700 flex items-center justify-center"
              style={{ height: "40px" }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Disclosure (Mobile Menu) */}
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                aria-label="Toggle Menu"
                className="px-2 py-1 text-gray-500 rounded-md lg:hidden hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 focus:outline-none dark:text-gray-300 dark:focus:bg-trueGray-700"
              >
                <svg
                  className="w-6 h-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {open && (
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                    />
                  )}
                  {!open && (
                    <path
                      fillRule="evenodd"
                      d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0-2H4a1 1 0 0 1 0-2z"
                    />
                  )}
                </svg>
              </Disclosure.Button>

              <Disclosure.Panel className="flex flex-wrap w-full my-5 lg:hidden">
                <>
                  {navigation.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="w-full px-4 py-2 -ml-4 text-gray-500 rounded-md dark:text-gray-300 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Cart (Mobile View) */}
                  <Link
                    href="/Cart"
                    className="w-full px-4 py-2 -ml-4 text-gray-500 rounded-md dark:text-gray-300 hover:text-green-600 focus:text-green-600 focus:bg-green-100 dark:focus:bg-gray-800 focus:outline-none"
                  >
                    Cart
                  </Link>

                  {/* Log Out (Mobile View) */}
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full px-4 py-2 text-left text-gray-500 rounded-md dark:text-gray-300 hover:text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-gray-800 focus:outline-none"
                  >
                    Log Out
                  </button>
                </>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Menu */}
        <div className="hidden text-center lg:flex lg:items-center">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
            {navigation.map((menu, index) => (
              <li className="mr-3 nav__item" key={index}>
                <Link
                  href={menu.href}
                  className="inline-block px-4 py-2 text-lg font-normal text-gray-800 no-underline rounded-md dark:text-gray-200 hover:text-indigo-500 hover:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-md shadow-lg">
            <h2 className="text-lg font-bold text-gray-800">
              Confirm Logout
            </h2>
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
