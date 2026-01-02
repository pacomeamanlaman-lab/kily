"use client";

import { useState } from "react";
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
  // Mock data for charts
  const messagesData = [
    { name: "Lun", messages: 245 },
    { name: "Mar", messages: 312 },
    { name: "Mer", messages: 278 },
    { name: "Jeu", messages: 356 },
    { name: "Ven", messages: 423 },
    { name: "Sam", messages: 389 },
    { name: "Dim", messages: 298 },
  ];

  const hourlyData = [
    { hour: "00h", count: 12 },
    { hour: "04h", count: 8 },
    { hour: "08h", count: 45 },
    { hour: "12h", count: 78 },
    { hour: "16h", count: 92 },
    { hour: "20h", count: 65 },
  ];

  // Mock conversations
  const mockConversations: Conversation[] = [
    {
      id: "1",
      participants: {
        user1: {
          name: "Amina Koné",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        user2: {
          name: "Sarah Dubois",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
        }
      },
      messagesCount: 45,
      lastMessage: "Merci pour votre intérêt, je suis disponible cette semaine",
      lastMessageAt: "2024-06-25T14:30:00",
      reported: false
    },
    {
      id: "2",
      participants: {
        user1: {
          name: "Kofi Mensah",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
        },
        user2: {
          name: "Ibrahim Diallo",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"
        }
      },
      messagesCount: 23,
      lastMessage: "Super projet ! On peut en discuter plus en détail ?",
      lastMessageAt: "2024-06-25T12:15:00",
      reported: false
    },
    {
      id: "3",
      participants: {
        user1: {
          name: "Fatou Sow",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
        },
        user2: {
          name: "User Suspect",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
        }
      },
      messagesCount: 8,
      lastMessage: "Message suspect contenant des liens...",
      lastMessageAt: "2024-06-24T09:45:00",
      reported: true
    }
  ];

  const totalMessages = messagesData.reduce((sum, day) => sum + day.messages, 0);
  const activeConversations = mockConversations.length;
  const reportedConversations = mockConversations.filter(c => c.reported).length;

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
            <LineChart data={messagesData}>
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
          {mockConversations.map((conversation) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
