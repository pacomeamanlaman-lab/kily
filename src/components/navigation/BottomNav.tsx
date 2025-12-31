"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, MessageCircle, User, Plus } from "lucide-react";
import { useState } from "react";

interface BottomNavProps {
  onPublishClick?: () => void;
}

export default function BottomNav({ onPublishClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadMessages] = useState(3); // Mock unread messages count

  const leftTabs = [
    { id: "home", label: "Accueil", icon: Home, path: "/feed" },
    { id: "discover", label: "Découvrir", icon: Compass, path: "/discover" },
  ];

  const rightTabs = [
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages", badge: unreadMessages },
    { id: "profile", label: "Profil", icon: User, path: "/profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/feed") {
      return pathname === "/feed" || pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-between px-2 py-2 relative">
        {/* Left tabs */}
        <div className="flex items-center flex-1 justify-around">
          {leftTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                  active ? "text-violet-400" : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center publish button */}
        <button
          onClick={onPublishClick}
          className="absolute left-1/2 -translate-x-1/2 -top-4 bg-gradient-to-br from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/50 transition-all hover:scale-110 active:scale-95"
        >
          <Plus className="w-7 h-7 text-white stroke-[3]" />
        </button>

        {/* Right tabs */}
        <div className="flex items-center flex-1 justify-around">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative ${
                  active ? "text-violet-400" : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
