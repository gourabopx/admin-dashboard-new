"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Ticket,
  ShoppingCart,
  Package,
  PlusCircle,
  FolderTree,
  FolderGit2,
  BarChart3,
  Image,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  Gift,
  Star,
} from "lucide-react";

const routes = [
  {
    label: "Admin Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
    color: "text-violet-500",
  },
  {
    label: "Coupon Management",
    icon: Ticket,
    href: "/coupons",
    color: "text-pink-500",
  },
  {
    label: "All Orders",
    icon: ShoppingCart,
    href: "/orders",
    color: "text-orange-500",
  },
  {
    label: "All Products",
    icon: Package,
    href: "/products",
    color: "text-green-500",
  },
  {
    label: "Create Product",
    icon: PlusCircle,
    href: "/products/new",
    color: "text-emerald-500",
  },
  {
    label: "Categories",
    icon: FolderTree,
    href: "/categories",
    color: "text-blue-500",
  },
  {
    label: "Sub-Categories",
    icon: FolderGit2,
    href: "/subcategories",
    color: "text-indigo-500",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-rose-500",
  },
  {
    label: "Website Banners",
    icon: Image,
    href: "/website-banners",
    color: "text-purple-500",
  },
  {
    label: "App Banners",
    icon: Smartphone,
    href: "/app-banners",
    color: "text-teal-500",
  },
  {
    label: "Topbar Management",
    icon: LayoutTemplate,
    href: "/topbar",
    color: "text-yellow-500",
  },
  {
    label: "Home Screen Offers",
    icon: Gift,
    href: "/offers",
    color: "text-red-500",
  },
  {
    label: "Review Management",
    icon: Star,
    href: "/reviews",
    color: "text-amber-500",
  },
];

interface SidebarProps {
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapse }: SidebarProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse(newCollapsed);
  };

  return (
    <div
      className={cn(
        "relative space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[270px]"
      )}
    >
      <div className="px-3 py-2 flex-1">
        <div className="flex items-center justify-between mb-14 pl-3">
          {!isCollapsed && <h1 className="text-2xl font-bold">Admin Panel</h1>}
          <button
            onClick={toggleCollapse}
            className={cn(
              "p-2 rounded-lg hover:bg-white/10 absolute",
              isCollapsed ? "right-2" : "right-3"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-6 w-6" />
            ) : (
              <ChevronLeft className="h-6 w-6" />
            )}
          </button>
        </div>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    route.color,
                    isCollapsed ? "mr-0" : "mr-3"
                  )}
                />
                {!isCollapsed && (
                  <span className="transition-all duration-300">
                    {route.label}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
