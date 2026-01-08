"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  MoreVertical,
  Tag,
  MapPin,
  MessageSquare,
  Star,
  Settings,
  X
} from "lucide-react";

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [pendingReports] = useState(5); // Mock pending reports count

  const mainTabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      id: "users",
      label: "Utilisateurs",
      icon: Users,
      path: "/admin/dashboard/users",
    },
    {
      id: "moderation",
      label: "Modération",
      icon: Shield,
      path: "/admin/dashboard/moderation",
      badge: pendingReports,
    },
    {
      id: "content",
      label: "Contenu",
      icon: FileText,
      path: "/admin/dashboard/content",
    },
  ];

  const moreMenuItems = [
    {
      id: "reputation",
      label: "Réputation",
      icon: Star,
      path: "/admin/dashboard/reputation",
    },
    {
      id: "categories",
      label: "Catégories",
      icon: Tag,
      path: "/admin/dashboard/categories",
    },
    {
      id: "cities",
      label: "Villes",
      icon: MapPin,
      path: "/admin/dashboard/cities",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      path: "/admin/dashboard/messages",
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
      path: "/admin/dashboard/settings",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    return pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setShowMoreMenu(false);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around px-1 py-2.5 max-w-full">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            const badge = tab.badge;

            return (
              <button
                key={tab.id}
                onClick={() => handleNavigation(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg transition-colors relative min-w-0 flex-1 ${
                  active ? "text-violet-400 bg-violet-500/10" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badge && badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-medium truncate w-full text-center leading-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg transition-colors relative min-w-0 flex-1 ${
              showMoreMenu ? "text-violet-400 bg-violet-500/10" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <div className="relative">
              <MoreVertical className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-medium leading-tight">Plus</span>
          </button>
        </div>
      </nav>

      {/* More Menu Drawer */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-[64px] left-0 right-0 z-[60] bg-gray-900 border-t border-white/10 rounded-t-2xl lg:hidden max-h-[60vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">Menu</h3>
                  <button
                    onClick={() => setShowMoreMenu(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {moreMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active
                            ? "bg-violet-600 text-white"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

