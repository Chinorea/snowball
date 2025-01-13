// "use client";  // Mark as Client Component

import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation"; // Correct import for pathname in Next.js 13
import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PopupWidget } from "@/components/PopupWidget";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body >
        {/* <ThemeProvider attribute="class" defaultTheme="dark" > */}
          {/* Dynamic background based on the route */}
          {/* <div className={isHomePage ? "bg-indigo-200 dark:bg-purple-800 min-h-screen w-full" : "bg-white min-h-screen w-full"}> */}
            {/* <Navbar /> */}
            <div>{children}</div>
            {/* <Footer /> */}
            {/* <PopupWidget /> */}
          {/* </div> */}
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
