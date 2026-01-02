"use client";

import { Search, User, Menu } from "lucide-react";
import { useState } from "react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <header className="h-16 bg-black/95 backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-400" />
      </button>

      {/* Search Bar */}
      <div className={`flex-1 transition-all ${searchExpanded ? 'max-w-full' : 'max-w-xl'} hidden sm:block`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher utilisateurs, contenu..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Mobile Search Button */}
      <button
        onClick={() => setSearchExpanded(!searchExpanded)}
        className="sm:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Search className="w-6 h-6 text-gray-400" />
      </button>

      {/* Mobile Search Expanded */}
      {searchExpanded && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10 p-4 z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">admin@kily.com</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
