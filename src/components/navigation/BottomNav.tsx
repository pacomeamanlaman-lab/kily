"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, MessageCircle, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { id: "home", label: "Accueil", icon: Home, path: "/" },
    { id: "discover", label: "Découvrir", icon: Compass, path: "/discover" },
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages" },
    { id: "profile", label: "Profil", icon: User, path: "/profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
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
    </nav>
  );
}
