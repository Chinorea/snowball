import Link from "next/link";
import Image from "next/image";

export const AdminNavbar = () => {
  const navigation = [
    { label: "User Management", href: "/Dashboard" },
    {
      label: "Request",
      dropdown: [
        { label: "Pre-ordered Request", href: "/PreorderReq" },
        { label: "Product Request", href: "/ProductReq" },
      ],
    },
    {
      label: "Mission",
      dropdown: [
        { label: "Mission Tracking", href: "/VoucherApproval" },
        { label: "Voucher Creation", href: "/Voucher/CreateVoucher" },
      ],
    },
    { label: "Inventory", href: "/InventoryTab" },
  ];

  return (
    <div className="w-full">
      <nav className="container relative flex flex-wrap items-center justify-between p-8 mx-auto lg:justify-between xl:px-1">
        {/* Logo */}
        <Link href="/Dashboard">
          <div className="flex items-center space-x-2 text-2xl font-medium text-indigo-500 dark:text-gray-100">
            <Image
              src="/img/FullMWHLogo.png"
              width={300}
              height={200}
              alt="Logo"
              className="w-auto h-auto"
            />
          </div>
        </Link>

        {/* Log Out Button */}
        <div className="gap-3 nav__item mr-2 lg:flex ml-auto lg:ml-0 lg:order-2">
          <Link
            href="/"
            className="px-6 py-2 text-white bg-indigo-600 rounded-md md:ml-5"
          >
            Log Out
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex">
          <ul className="flex space-x-4">
            {navigation.map((item, index) => (
              <li key={index} className="relative group">
                {item.dropdown ? (
                  <>
                    {/* Parent Menu Item */}
                    <button className="bg-transparent border-none block px-4 py-2 text-gray-800 hover:bg-indigo-100 hover:text-indigo-500 dark:text-gray-200 dark:hover:bg-gray-700">
                      {item.label}
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute hidden bg-white border border-gray-200 rounded shadow-md group-hover:block dark:bg-gray-800">
                      {item.dropdown.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className="block px-4 py-2 text-gray-800 hover:bg-indigo-100 hover:text-indigo-500 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="relative px-4 py-2 text-[16px] font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-500 mt-1 hover:bg-indigo-100 top-3"


                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

       
      </nav>
    </div>
  );
};
