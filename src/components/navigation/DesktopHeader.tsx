"use client";

import { useRouter } from "next/navigation";
import { Bell, Search, Sparkles, User as UserIcon, Settings, LogOut, ChevronDown, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import NotificationsSidebar from "@/components/notifications/NotificationsSidebar";
import { getUserFullName, getCurrentUser, type User } from "@/lib/supabase/users.service";
import { logout } from "@/lib/supabase/auth.service";
import { motion, AnimatePresence } from "framer-motion";

interface DesktopHeaderProps {
  unreadNotifications?: number;
  disableAutoHide?: boolean;
  showNotifications?: boolean; // Control visibility of notification bell
}

export default function DesktopHeader({ unreadNotifications = 5, disableAutoHide = false, showNotifications: showNotificationsIcon = true }: DesktopHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useScrollDirection({ threshold: 10 });

  // Load user on mount to avoid hydration mismatch
  useEffect(() => {
    const loadUser = async () => {
      setIsMounted(true);
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Update user when it changes
  useEffect(() => {
    if (!isMounted) return;
    const handleUserUpdate = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    window.addEventListener('userUpdated', handleUserUpdate);
    window.addEventListener('userLoggedIn', handleUserUpdate);
    window.addEventListener('userLoggedOut', handleUserUpdate);
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
      window.removeEventListener('userLoggedIn', handleUserUpdate);
      window.removeEventListener('userLoggedOut', handleUserUpdate);
    };
  }, [isMounted]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      setShowProfileMenu(false);
      await logout();
      // Forcer le rechargement pour s'assurer que la session est bien supprimée
      window.location.href = "/login";
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, forcer quand même la redirection
      window.location.href = "/login";
    }
  };

  return (
    <header
      className={`hidden lg:block sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10 transition-transform duration-300 ${
        !disableAutoHide && scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <button
            onClick={() => router.push(currentUser ? "/feed" : "/")}
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
            {/* Notifications - Only show on feed page */}
            {showNotificationsIcon && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all ${
                  showNotifications ? "bg-white/10 text-white" : ""
                }`}
              >
                <Bell className="w-6 h-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>
            )}

            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-white/5 rounded-xl px-2 py-1.5 transition-colors"
              >
                {isMounted && currentUser?.avatar ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-violet-500/50">
                    <img
                      src={currentUser.avatar}
                      alt={getUserFullName(currentUser) || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-black/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">
                        {currentUser ? getUserFullName(currentUser) : "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {currentUser?.email || ""}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/feed");
                        }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        <span className="text-sm">Accueil</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/profile");
                        }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span className="text-sm">Mon profil</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/settings");
                        }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Paramètres</span>
                      </button>
                      <div className="border-t border-white/10 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Déconnexion</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Sidebar - Only render if notifications icon is visible */}
      {showNotificationsIcon && (
        <NotificationsSidebar
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
}
