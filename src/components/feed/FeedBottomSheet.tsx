"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Compass,
  MessageCircle,
  User,
  BookMarked,
  Users,
  X,
  Settings,
  LogOut,
  Code,
  Sparkles,
  Calendar,
  MapPin,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserFullName } from "@/lib/users";
import { logout } from "@/lib/auth";

interface FeedBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedBottomSheet({ isOpen, onClose }: FeedBottomSheetProps) {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const mainMenuItems = [
    { icon: Home, label: "Accueil", path: "/feed", color: "text-violet-400" },
    { icon: Compass, label: "Découvrir", path: "/discover", color: "text-blue-400" },
    { icon: MessageCircle, label: "Messages", path: "/messages", color: "text-green-400" },
    { icon: BookMarked, label: "Sauvegardés", path: "/recruiter/dashboard?tab=saved", color: "text-yellow-400" },
    { icon: Users, label: "Communautés", path: "#", color: "text-pink-400" },
  ];

  const trendingSkills = [
    { icon: Code, label: "Développement Web", count: 234 },
    { icon: Sparkles, label: "Design Graphique", count: 189 },
    { icon: Calendar, label: "Organisation Événements", count: 156 },
  ];

  const activeCities = [
    { name: "Abidjan", flag: "🇨🇮", count: 456 },
    { name: "Lagos", flag: "🇳🇬", count: 389 },
    { name: "Accra", flag: "🇬🇭", count: 298 },
    { name: "Dakar", flag: "🇸🇳", count: 267 },
  ];

  const handleItemClick = (path: string) => {
    if (path !== "#") {
      router.push(path);
    }
    onClose();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-gradient-to-b from-gray-900 to-black border-t border-white/10 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-60px)] px-4 pb-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <button
                  onClick={() => {
                    router.push("/profile");
                    onClose();
                  }}
                  className="relative flex-shrink-0"
                >
                  {currentUser?.avatar ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-violet-500/50">
                      <img
                        src={currentUser.avatar}
                        alt={getUserFullName(currentUser) || "User"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center border-2 border-violet-500/50">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {currentUser ? getUserFullName(currentUser) : "Utilisateur"}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {currentUser?.email || ""}
                  </p>
                  <button
                    onClick={() => {
                      router.push("/profile");
                      onClose();
                    }}
                    className="text-xs text-violet-400 mt-1 hover:text-violet-300"
                  >
                    Voir le profil
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Main Navigation */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">
                  Navigation
                </h4>
                <div className="space-y-1">
                  {mainMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleItemClick(item.path)}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                      >
                        <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-white font-medium flex-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trending Skills */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">
                    Tendances
                  </h4>
                </div>
                <div className="space-y-2">
                  {trendingSkills.map((skill) => {
                    const Icon = skill.icon;
                    return (
                      <button
                        key={skill.label}
                        onClick={() => {
                          router.push(`/discover?skill=${skill.label.toLowerCase()}`);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{skill.label}</span>
                        </div>
                        <span className="text-xs text-gray-500">{skill.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Cities */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <MapPin className="w-4 h-4 text-violet-500" />
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">
                    Villes actives
                  </h4>
                </div>
                <div className="space-y-2">
                  {activeCities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        router.push(`/discover?city=${city.name.toLowerCase()}`);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{city.flag}</span>
                        <span className="text-sm text-gray-300">{city.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{city.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings & Logout */}
              <div className="pt-4 border-t border-white/10 space-y-1">
                <button
                  onClick={() => {
                    router.push("/settings");
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-white font-medium flex-1">Paramètres</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-red-400 font-medium flex-1">Déconnexion</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

