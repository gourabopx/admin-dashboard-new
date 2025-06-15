"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div
          className={cn(
            "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 transition-all duration-300",
            isSidebarCollapsed ? "md:w-[70px]" : "md:w-[270px]"
          )}
        >
          <Sidebar onCollapse={setIsSidebarCollapsed} />
        </div>
        <main
          className={cn(
            "md:pl-[270px] transition-all duration-300",
            isSidebarCollapsed && "md:pl-[70px]"
          )}
        >
          <Navbar />
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
