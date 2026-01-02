"use client";

import { useRouter } from "next/navigation";
import { Bell, Search, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface DesktopHeaderProps {
  unreadNotifications?: number;
}

export default function DesktopHeader({ unreadNotifications = 5 }: DesktopHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const scrollDirection = useScrollDirection({ threshold: 10 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header
      className={`hidden lg:block sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10 transition-transform duration-300 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <button
            onClick={() => router.push("/feed")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Kily</span>
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des talents, compétences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>

            {/* Avatar */}
            <button
              onClick={() => router.push("/profile")}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
