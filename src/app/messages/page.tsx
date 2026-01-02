"use client";

import { MessageCircle, Search, Send, ArrowLeft } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loadConversations } from "@/lib/messages";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getCurrentUser } from "@/lib/users";

function MessagesPageContent() {
  const router = useRouter();
  const scrollDirection = useScrollDirection({ threshold: 10 });
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || null;
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);

  // Load conversations from localStorage
  useEffect(() => {
    if (!currentUserId) return;
    const loadedConversations = loadConversations(currentUserId);
    // Transform to match UI format
    const formattedConversations = loadedConversations.map(conv => {
      const otherUserId = conv.participants.find(id => id !== currentUserId) || "";
      // Mock user data - in real app, you'd fetch from users database
      const userData = {
        id: otherUserId,
        name: otherUserId === "1" ? "Amina Koné" :
              otherUserId === "2" ? "Kofi Mensah" :
              otherUserId === "3" ? "Sarah Mensah" : "Utilisateur",
        avatar: otherUserId === "1" ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" :
                otherUserId === "2" ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" :
                otherUserId === "3" ? "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400" :
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
        online: false,
      };

      return {
        id: conv.id,
        participant: userData,
        lastMessage: {
          content: conv.lastMessage,
          timestamp: conv.lastMessageAt,
          unread: conv.unreadBy === currentUserId && conv.unreadCount > 0,
          isOwn: false,
        },
      };
    });
    setConversations(formattedConversations);
  }, []);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter((conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, conversations]);

  const handleConversationClick = (conversationId: string, participantId: string) => {
    // Marquer comme lu (on mark in conversation page directly)
    // Naviguer vers la conversation
    router.push(`/messages/${participantId}`);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div
        className={`sticky top-0 z-40 bg-black border-b border-white/10 transition-transform duration-300 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredConversations.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-500/10 rounded-full mb-6">
              <MessageCircle className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Aucune conversation trouvée</h2>
            <p className="text-white/60 max-w-md mx-auto mb-8">
              {searchQuery ? "Essayez un autre nom" : "Découvrez des talents et commencez à échanger !"}
            </p>
            {!searchQuery && (
              <a
                href="/discover"
                className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <Send className="w-5 h-5" />
                Découvrir des talents
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleConversationClick(conversation.id, conversation.participant.id)}
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all group"
              >
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={conversation.participant.avatar}
                    alt={conversation.participant.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {conversation.participant.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                      {conversation.participant.name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      conversation.lastMessage.unread
                        ? "text-white font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {conversation.lastMessage.isOwn && "Vous : "}
                    {conversation.lastMessage.content}
                  </p>
                </div>

                {/* Unread Indicator */}
                {conversation.lastMessage.unread && (
                  <div className="w-3 h-3 bg-violet-500 rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesPageContent />
    </ProtectedRoute>
  );
}
