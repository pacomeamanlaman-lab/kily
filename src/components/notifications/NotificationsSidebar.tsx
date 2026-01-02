"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, UserPlus, Check, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "system";
  user?: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Amina Koné",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    },
    message: "a aimé votre publication",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    read: false,
    link: "/feed",
  },
  {
    id: "2",
    type: "comment",
    user: {
      name: "Kofi Mensah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    message: "a commenté votre vidéo",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    read: false,
    link: "/feed",
  },
  {
    id: "3",
    type: "follow",
    user: {
      name: "Sarah Mensah",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
    message: "a commencé à vous suivre",
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    read: false,
    link: "/profile/3",
  },
  {
    id: "4",
    type: "like",
    user: {
      name: "Ibrahim Diop",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    },
    message: "a aimé votre commentaire",
    timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    read: true,
    link: "/feed",
  },
  {
    id: "5",
    type: "system",
    message: "Votre profil a été vérifié !",
    timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    read: true,
    link: "/profile",
  },
];

export default function NotificationsSidebar({ isOpen, onClose }: NotificationsSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset notifications when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setNotifications(mockNotifications);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // Navigate to link if available
    if (notification.link) {
      router.push(notification.link);
      onClose();
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "system":
        return <Sparkles className="w-5 h-5 text-violet-500" />;
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay - mobile only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-4 top-16 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-400">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full flex items-start gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer text-left ${
                        !notification.read ? "bg-violet-500/5" : ""
                      }`}
                    >
                      {/* Avatar or Icon */}
                      {notification.user ? (
                        <img
                          src={notification.user.avatar}
                          alt={notification.user.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {notification.user && (
                            <span className="font-semibold">{notification.user.name} </span>
                          )}
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-violet-500 rounded-full" />
                          )}
                        </div>
                      </div>

                      {/* Action Icon */}
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="p-3 border-t border-white/10">
                <button
                  onClick={handleMarkAllAsRead}
                  className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  Tout marquer comme lu
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
