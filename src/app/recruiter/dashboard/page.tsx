"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Eye,
  Star,
  MessageCircle,
  TrendingUp,
  Briefcase,
  Heart,
  Search,
} from "lucide-react";
import { useState } from "react";
import TalentCard from "@/components/talent/TalentCard";
import { mockTalents } from "@/lib/mockData";
import Button from "@/components/ui/Button";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "saved" | "contacted">("overview");

  // Mock data
  const stats = [
    { label: "Profils vus", value: "248", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Talents sauvegardés", value: "34", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Contacts envoyés", value: "12", icon: MessageCircle, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Recrutements", value: "3", icon: Briefcase, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const savedTalents = mockTalents.slice(0, 6);
  const recentSearches = ["Développeur Web", "Designer", "Cuisinière", "Électricien"];

  const tabs = [
    { value: "overview" as const, label: "Vue d'ensemble" },
    { value: "saved" as const, label: "Sauvegardés" },
    { value: "contacted" as const, label: "Contactés" },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Recruteur</h1>
              <p className="text-gray-400 mt-1">Gérez vos recrutements et talents</p>
            </div>
            <Button variant="primary" onClick={() => router.push("/discover")}>
              <Search className="w-4 h-4 mr-2" />
              Rechercher des talents
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-6 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Searches */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Recherches récentes</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => router.push(`/discover?q=${search}`)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => router.push("/discover")}
                className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-8 text-left hover:scale-105 transition-transform"
              >
                <Users className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Découvrir des talents</h3>
                <p className="text-violet-100">
                  Explorez notre base de talents vérifiés
                </p>
              </button>

              <button
                onClick={() => router.push("/messages")}
                className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-8 text-left hover:scale-105 transition-all"
              >
                <MessageCircle className="w-12 h-12 mb-4 text-violet-500" />
                <h3 className="text-2xl font-bold mb-2">Messages</h3>
                <p className="text-gray-400">
                  Gérez vos conversations avec les talents
                </p>
              </button>
            </div>

            {/* Top Talents */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Talents tendances cette semaine</h2>
                <button
                  onClick={() => setActiveTab("saved")}
                  className="text-violet-500 hover:text-violet-400 text-sm font-medium"
                >
                  Voir mes sauvegardés →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTalents.slice(0, 3).map((talent, index) => (
                  <motion.div
                    key={talent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TalentCard
                      talent={talent}
                      onClick={() => router.push(`/profile/${talent.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Talents sauvegardés</h2>
              <p className="text-gray-400">
                {savedTalents.length} talent{savedTalents.length > 1 ? "s" : ""} dans vos favoris
              </p>
            </div>

            {savedTalents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTalents.map((talent, index) => (
                  <motion.div
                    key={talent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TalentCard
                      talent={talent}
                      onClick={() => router.push(`/profile/${talent.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Aucun talent sauvegardé</h3>
                <p className="text-gray-400 mb-6">
                  Commencez à sauvegarder des talents qui vous intéressent
                </p>
                <Button variant="primary" onClick={() => router.push("/discover")}>
                  Découvrir des talents
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Contacted Tab */}
        {activeTab === "contacted" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Talents contactés</h2>
              <p className="text-gray-400">Historique de vos prises de contact</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
              {mockTalents.slice(0, 4).map((talent, index) => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => router.push(`/profile/${talent.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{talent.name}</h3>
                      <p className="text-sm text-gray-400">
                        {talent.skills[0]?.name} • {talent.location.city}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">{talent.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">
                          • Contacté il y a {Math.floor(Math.random() * 7) + 1}j
                        </span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Voir profil
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
