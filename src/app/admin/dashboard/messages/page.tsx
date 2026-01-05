"use client";

import { useState, useEffect } from "react";
import { MessageSquare, TrendingUp, Users, Clock, Eye, Flag } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StatsCardsCarousel from "@/components/admin/StatsCardsCarousel";

interface Conversation {
  id: string;
  participants: {
    user1: { name: string; avatar: string };
    user2: { name: string; avatar: string };
  };
  messagesCount: number;
  lastMessage: string;
  lastMessageAt: string;
  reported: boolean;
}

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [messagesData, setMessagesData] = useState<Array<{ name: string; messages: number }>>([]);
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; count: number }>>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { getAllConversations, getMessagesData, getMessagesHourlyData } = await import("@/lib/supabase/admin.service");
        
        const [conversationsData, messagesStats, hourlyStats] = await Promise.all([
          getAllConversations(),
          getMessagesData(),
          getMessagesHourlyData(),
        ]);

        // Transformer les conversations
        const transformedConversations: Conversation[] = conversationsData.map(conv => ({
          id: conv.id,
          participants: {
            user1: {
              name: conv.participant_1 
                ? `${conv.participant_1.first_name} ${conv.participant_1.last_name}`
                : "Utilisateur",
              avatar: conv.participant_1?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
            },
            user2: {
              name: conv.participant_2
                ? `${conv.participant_2.first_name} ${conv.participant_2.last_name}`
                : "Utilisateur",
              avatar: conv.participant_2?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
            },
          },
          messagesCount: 0, // TODO: Compter les messages par conversation
          lastMessage: conv.last_message || "",
          lastMessageAt: conv.last_message_at,
          reported: false, // TODO: Vérifier si la conversation est signalée
        }));

        setConversations(transformedConversations);
        setMessagesData(messagesStats);
        setHourlyData(hourlyStats);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  const totalMessages = messagesData.reduce((sum, day) => sum + day.messages, 0);
  const activeConversations = conversations.length;
  const reportedConversations = conversations.filter(c => c.reported).length;

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Monitoring Messages</h1>
        <p className="text-sm sm:text-base text-gray-400">Surveillez l'activité des messages sur la plateforme</p>
      </div>

      {/* Stats Cards */}
      <StatsCardsCarousel
        cards={[
          {
            id: "messages",
            icon: MessageSquare,
            gradient: "from-violet-600/20 to-violet-800/10",
            border: "border-violet-500/30",
            bgIcon: "bg-violet-500/20",
            textIcon: "text-violet-400",
            label: "Messages (7j)",
            value: totalMessages.toString(),
          },
          {
            id: "conversations",
            icon: Users,
            gradient: "from-blue-600/20 to-blue-800/10",
            border: "border-blue-500/30",
            bgIcon: "bg-blue-500/20",
            textIcon: "text-blue-400",
            label: "Conversations actives",
            value: activeConversations.toString(),
          },
          {
            id: "growth",
            icon: TrendingUp,
            gradient: "from-green-600/20 to-green-800/10",
            border: "border-green-500/30",
            bgIcon: "bg-green-500/20",
            textIcon: "text-green-400",
            label: "Croissance",
            value: "+18%",
            change: "+18%",
            changeColor: "text-green-400",
          },
          {
            id: "reported",
            icon: Flag,
            gradient: "from-red-600/20 to-red-800/10",
            border: "border-red-500/30",
            bgIcon: "bg-red-500/20",
            textIcon: "text-red-400",
            label: "Conversations signalées",
            value: reportedConversations.toString(),
          },
        ]}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Messages per Day */}
        <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Messages par Jour (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={messagesData.length > 0 ? messagesData : []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line type="monotone" dataKey="messages" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Messages by Hour */}
        <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Activité par Heure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Conversations Récentes</h3>
        <div className="space-y-4">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all ${
                  conversation.reported ? "border-2 border-red-500/50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  {/* Participants */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img
                        src={conversation.participants.user1.avatar}
                        alt={conversation.participants.user1.name}
                        className="w-10 h-10 rounded-full border-2 border-black object-cover"
                      />
                      <img
                        src={conversation.participants.user2.avatar}
                        alt={conversation.participants.user2.name}
                        className="w-10 h-10 rounded-full border-2 border-black object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {conversation.participants.user1.name} ↔ {conversation.participants.user2.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {conversation.messagesCount} messages
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    {conversation.reported && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        <Flag className="w-3 h-3 inline mr-1" />
                        Signalé
                      </span>
                    )}
                    <button className="p-2 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer" title="Voir conversation">
                      <Eye className="w-4 h-4 text-violet-400" />
                    </button>
                  </div>
                </div>

                {/* Last Message */}
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-sm text-gray-300 mb-1">{conversation.lastMessage}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(conversation.lastMessageAt).toLocaleString("fr-FR")}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Aucune conversation disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
