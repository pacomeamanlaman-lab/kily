"use client";

import { useState } from "react";
import {
  Users,
  FileText,
  Video,
  Image as ImageIcon,
  TrendingUp,
  MessageSquare,
  Heart,
  Eye,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminDashboardPage() {
  // Mock data for charts
  const userGrowthData = [
    { name: "Jan", users: 120 },
    { name: "Fev", users: 180 },
    { name: "Mar", users: 250 },
    { name: "Avr", users: 340 },
    { name: "Mai", users: 480 },
    { name: "Jun", users: 620 },
    { name: "Jul", users: 890 },
  ];

  const contentData = [
    { name: "Lun", posts: 45, videos: 12, stories: 78 },
    { name: "Mar", posts: 52, videos: 18, stories: 65 },
    { name: "Mer", posts: 38, videos: 15, stories: 82 },
    { name: "Jeu", posts: 61, videos: 22, stories: 71 },
    { name: "Ven", posts: 55, videos: 19, stories: 88 },
    { name: "Sam", posts: 70, videos: 28, stories: 95 },
    { name: "Dim", posts: 48, videos: 16, stories: 73 },
  ];

  const userTypeData = [
    { name: "Talents", value: 620, color: "#8b5cf6" },
    { name: "Recruteurs", value: 180, color: "#ec4899" },
    { name: "Voisins", value: 90, color: "#f59e0b" },
  ];

  const cityData = [
    { name: "Abidjan", users: 245 },
    { name: "Lagos", users: 198 },
    { name: "Accra", users: 152 },
    { name: "Dakar", users: 134 },
    { name: "Nairobi", users: 98 },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Super Admin</h1>
        <p className="text-gray-400">Vue d'ensemble de la plateforme Kily</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-violet-600/20 to-violet-800/10 border border-violet-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Utilisateurs</h3>
          <p className="text-3xl font-bold">890</p>
        </div>

        {/* Total Posts */}
        <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/10 border border-pink-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-pink-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+8%</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Posts Publiés</h3>
          <p className="text-3xl font-bold">1,234</p>
        </div>

        {/* Total Videos */}
        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/10 border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+15%</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Vidéos Publiées</h3>
          <p className="text-3xl font-bold">567</p>
        </div>

        {/* Total Engagement */}
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/10 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+22%</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Engagement</h3>
          <p className="text-3xl font-bold">45.2K</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Croissance Utilisateurs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Content Published Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Contenu Publié (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="posts" fill="#ec4899" />
              <Bar dataKey="videos" fill="#f59e0b" />
              <Bar dataKey="stories" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Type Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Répartition Types d'Utilisateurs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cities Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Top 5 Villes Actives</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="users" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
