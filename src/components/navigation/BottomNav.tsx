"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, MessageCircle, User, Plus, Search } from "lucide-react";
import { useState } from "react";
import { isLoggedIn } from "@/lib/auth";

interface BottomNavProps {
  onPublishClick?: () => void;
  showPublishButton?: boolean;
}

export default function BottomNav({ onPublishClick, showPublishButton = false }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadMessages] = useState(3); // Mock unread messages count

  // Determine profile path based on login status
  const profilePath = isLoggedIn() ? "/profile" : "/login";

  // Tabs pour les pages normales (sans le bouton +)
  const normalTabs = [
    { id: "home", label: "Accueil", icon: Home, path: "/feed" },
    { id: "discover", label: "Découvrir", icon: Compass, path: "/discover" },
    { id: "search", label: "Recherche", icon: Search, path: "/search" },
    { id: "profile", label: "Profil", icon: User, path: profilePath },
  ];

  // Tabs pour le feed (avec le bouton +) - seulement si showPublishButton est true ET onPublishClick existe
  const feedTabs = [
    { id: "home", label: "Accueil", icon: Home, path: "/feed" },
    { id: "discover", label: "Découvrir", icon: Compass, path: "/discover" },
    { id: "publish", label: "Publier", icon: Plus, path: "", onClick: onPublishClick!, isPublish: true },
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages", badge: unreadMessages },
    { id: "profile", label: "Profil", icon: User, path: profilePath },
  ];

  // Utiliser feedTabs uniquement si showPublishButton est true ET onPublishClick existe, sinon normalTabs
  const tabs = (showPublishButton && onPublishClick) ? feedTabs : normalTabs;

  const isActive = (path: string) => {
    if (path === "/feed") {
      return pathname === "/feed" || pathname === "/";
    }
    if (path === "") {
      return false; // Le bouton publish n'est jamais actif
    }
    if (path === "/login" || path === "/profile") {
      return pathname === "/login" || pathname === "/register" || pathname === "/profile";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          const badge = 'badge' in tab ? (tab.badge as number | undefined) : undefined;
          const isPublish = 'isPublish' in tab && tab.isPublish;
          const handleClick = 'onClick' in tab && tab.onClick 
            ? (tab.onClick as () => void)
            : () => router.push(tab.path);

          return (
            <button
              key={tab.id}
              onClick={handleClick}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative ${
                isPublish
                  ? "text-violet-400"
                  : active
                  ? "text-violet-400"
                  : "text-gray-400"
              }`}
            >
              <div className={`relative ${isPublish ? "bg-gradient-to-br from-violet-500 to-violet-700 w-10 h-10 rounded-full flex items-center justify-center" : ""}`}>
                <Icon className={`${isPublish ? "w-5 h-5 text-white" : "w-5 h-5"}`} />
                {badge && badge > 0 && !isPublish && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
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
