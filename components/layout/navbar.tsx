"use client";

import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const Navbar = () => {
  return (
    <div className="flex items-center p-4 border-b bg-gray-900 text-white">
      <div className="flex-1">
        <h2 className="text-lg font-semibold">Welcome, Admin</h2>
      </div>
      <div className="flex items-center gap-x-3">
        <Button variant="ghost" size="icon" className="hover:bg-white/10">
          <Bell className="h-5 w-5 text-zinc-400" />
        </Button>
        {/* Settings – simple link to the upcoming settings page */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="hover:bg-white/10"
        >
          <Link href="/settings">
            <Settings className="h-5 w-5 text-zinc-400" />
          </Link>
        </Button>

        {/* User menu – popover with quick actions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10"
            >
              <User className="h-5 w-5 text-zinc-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 bg-gray-800 border-none">
            <div className="flex flex-col text-sm">
              <Link
                href="/profile"
                className="px-3 py-2 hover:bg-white/10 rounded-md"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="px-3 py-2 hover:bg-white/10 rounded-md"
              >
                Settings
              </Link>
              {/* Placeholder for future sign-out logic */}
              <button
                className="text-left px-3 py-2 hover:bg-white/10 rounded-md"
                onClick={() => {
                  // TODO: integrate real sign-out logic
                  console.log("Sign out clicked")
                }}
              >
                Sign out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Navbar;
