"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { clearCurrentUserEmail, setIsUser } from "./userInfo";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { getCurrentUserEmail } from "./userInfo";
import "./style.css";

export const UserNavbar = () => {
  const router = useRouter();
  const navigation = [
    { label: "Product", href: "/Product" },
    { label: "Voucher", href: "/Voucher" },
    { label: "Request Product", href: "/ReqProductUser" },
    { label: "Mission", href: "/Mission" },
    { label: "Auction House", href: "/AuctionHouse" },
  ];

  const currentUserEmail = getCurrentUserEmail();

  const handleLogout = () => {
    clearCurrentUserEmail();
    setIsUser();
    window.location.href = "/";
  };

  return (
    <div className="w-full">
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
          {/* Cart Button */}
          <Link
            href="/Cart"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center h-12"
          >
            Cart
          </Link>

          {/* User Bubble */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300">
              <Image
                src="/img/user-avatar.png"
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/Settings"
                    className={`${
                      active ? "bg-gray-100" : ""
                    } block px-4 py-2 text-sm text-gray-700 focus:outline-none`}
                  >
                    Settings
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    onClick={handleLogout}
                    href="/"
                    className={`${
                      active ? "bg-gray-100" : ""
                    } block w-full text-left px-4 py-2 text-sm text-gray-700 focus:outline-none`}
                  >
                    Log Out
                  </Link>
                )}
              </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </nav>
    </div>
  );
};
