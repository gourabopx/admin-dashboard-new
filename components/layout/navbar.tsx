"use client";

import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Button variant="ghost" size="icon" className="hover:bg-white/10">
          <Settings className="h-5 w-5 text-zinc-400" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-white/10">
          <User className="h-5 w-5 text-zinc-400" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
