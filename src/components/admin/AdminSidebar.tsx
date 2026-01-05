"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  Tag,
  MapPin,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Sparkles,
  X
} from "lucide-react";
import { useEffect, useRef } from "react";
import { logout } from "@/lib/supabase/auth.service";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    {
      id: "overview",
      label: "Vue d'ensemble",
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
      id: "content",
      label: "Contenu",
      icon: FileText,
      path: "/admin/dashboard/content",
    },
    {
      id: "moderation",
      label: "Modération",
      icon: Shield,
      path: "/admin/dashboard/moderation",
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
      id: "reputation",
      label: "Réputation",
      icon: Star,
      path: "/admin/dashboard/reputation",
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
      path: "/admin/dashboard/settings",
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    if (onClose) onClose();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (onClose) onClose();
  };

  // Close on click outside (mobile only)
  useEffect(() => {
    if (!onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
          onClose();
        }
      }
    };

    if (isOpen) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        document.addEventListener("mousedown", handleClickOutside);
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (!onClose) return;

    const checkMobile = () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
      if (isOpen && isMobile) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    checkMobile();

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const sidebarContent = (
    <aside
      ref={sidebarRef}
      className="w-64 bg-gradient-to-b from-gray-900 to-black border-r border-white/10 flex flex-col h-full"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Kily Admin</h1>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
        {/* Close button - mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive
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
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );

  // Desktop: always visible sidebar (no onClose means desktop mode)
  if (!onClose) {
    return (
      <div className="hidden lg:block">
        {sidebarContent}
      </div>
    );
  }

  // Mobile: drawer with animation
  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
