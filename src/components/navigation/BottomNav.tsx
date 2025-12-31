"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, MessageCircle, User } from "lucide-react";
import { useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadMessages] = useState(3); // Mock unread messages count

  const tabs = [
    { id: "home", label: "Accueil", icon: Home, path: "/feed" },
    { id: "discover", label: "Découvrir", icon: Compass, path: "/discover" },
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
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
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
    </nav>
  );
}
