"use client";

import { usePathname, useRouter } from "next/navigation";
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
  Sparkles
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push("/");
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-black border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Kily Admin</h1>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
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
                onClick={() => router.push(item.path)}
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
}
