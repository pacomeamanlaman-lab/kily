"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { getAdminStats, getUserGrowthData, getContentData, getUserTypeData, getTopCitiesData } from "@/lib/supabase/admin.service";

export default function AdminDashboardPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [loading, setLoading] = useState(true);
  const [statsCards, setStatsCards] = useState([
    {
      id: "users",
      icon: Users,
      iconColor: "violet",
      gradient: "from-violet-600/20 to-violet-800/10",
      border: "border-violet-500/30",
      bgIcon: "bg-violet-500/20",
      textIcon: "text-violet-400",
      label: "Total Utilisateurs",
      value: "0",
      change: "+0%",
      changeColor: "text-green-400"
    },
    {
      id: "posts",
      icon: FileText,
      iconColor: "pink",
      gradient: "from-pink-600/20 to-pink-800/10",
      border: "border-pink-500/30",
      bgIcon: "bg-pink-500/20",
      textIcon: "text-pink-400",
      label: "Posts Publiés",
      value: "0",
      change: "+0%",
      changeColor: "text-green-400"
    },
    {
      id: "videos",
      icon: Video,
      iconColor: "orange",
      gradient: "from-orange-600/20 to-orange-800/10",
      border: "border-orange-500/30",
      bgIcon: "bg-orange-500/20",
      textIcon: "text-orange-400",
      label: "Vidéos Publiées",
      value: "0",
      change: "+0%",
      changeColor: "text-green-400"
    },
    {
      id: "engagement",
      icon: Heart,
      iconColor: "green",
      gradient: "from-green-600/20 to-green-800/10",
      border: "border-green-500/30",
      bgIcon: "bg-green-500/20",
      textIcon: "text-green-400",
      label: "Total Engagement",
      value: "0",
      change: "+0%",
      changeColor: "text-green-400"
    }
  ]);
  const [userGrowthData, setUserGrowthData] = useState<Array<{ name: string; users: number }>>([]);
  const [contentData, setContentData] = useState<Array<{ name: string; posts: number; videos: number; stories: number }>>([]);
  const [userTypeData, setUserTypeData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [cityData, setCityData] = useState<Array<{ name: string; users: number }>>([]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swipe left - next card
      setCurrentCardIndex((prev) => (prev + 1) % 4);
    } else {
      // Swipe right - previous card
      setCurrentCardIndex((prev) => (prev - 1 + 4) % 4);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Début du chargement des données admin...');

        // Charger les statistiques principales avec timeout
        const statsPromise = getAdminStats();
        const statsTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: getAdminStats')), 10000)
        );
        
        const stats = await Promise.race([statsPromise, statsTimeout]) as Awaited<ReturnType<typeof getAdminStats>>;
        console.log('✅ Statistiques chargées:', stats);

        // Mettre à jour les cartes de statistiques
        setStatsCards([
          {
            id: "users",
            icon: Users,
            iconColor: "violet",
            gradient: "from-violet-600/20 to-violet-800/10",
            border: "border-violet-500/30",
            bgIcon: "bg-violet-500/20",
            textIcon: "text-violet-400",
            label: "Total Utilisateurs",
            value: stats.totalUsers.toLocaleString(),
            change: "+0%", // TODO: Calculer la variation
            changeColor: "text-green-400"
          },
          {
            id: "posts",
            icon: FileText,
            iconColor: "pink",
            gradient: "from-pink-600/20 to-pink-800/10",
            border: "border-pink-500/30",
            bgIcon: "bg-pink-500/20",
            textIcon: "text-pink-400",
            label: "Posts Publiés",
            value: stats.totalPosts.toLocaleString(),
            change: "+0%",
            changeColor: "text-green-400"
          },
          {
            id: "videos",
            icon: Video,
            iconColor: "orange",
            gradient: "from-orange-600/20 to-orange-800/10",
            border: "border-orange-500/30",
            bgIcon: "bg-orange-500/20",
            textIcon: "text-orange-400",
            label: "Vidéos Publiées",
            value: stats.totalVideos.toLocaleString(),
            change: "+0%",
            changeColor: "text-green-400"
          },
          {
            id: "engagement",
            icon: Heart,
            iconColor: "green",
            gradient: "from-green-600/20 to-green-800/10",
            border: "border-green-500/30",
            bgIcon: "bg-green-500/20",
            textIcon: "text-green-400",
            label: "Total Engagement",
            value: stats.totalEngagement >= 1000 
              ? `${(stats.totalEngagement / 1000).toFixed(1)}K`
              : stats.totalEngagement.toLocaleString(),
            change: "+0%",
            changeColor: "text-green-400"
          }
        ]);

        // Charger les données des graphiques avec gestion d'erreur individuelle
        console.log('🔄 Chargement des graphiques...');
        const [growthData, contentDataResult, userTypeResult, citiesResult] = await Promise.allSettled([
          getUserGrowthData(7),
          getContentData(),
          getUserTypeData(),
          getTopCitiesData(),
        ]).then(results => results.map((result, index) => {
          if (result.status === 'fulfilled') {
            console.log(`✅ Graphique ${index} chargé`);
            return result.value;
          } else {
            console.error(`❌ Erreur graphique ${index}:`, result.reason);
            // Retourner des données vides en cas d'erreur
            if (index === 0) return []; // growthData
            if (index === 1) return []; // contentData
            if (index === 2) return []; // userTypeData
            return []; // citiesResult
          }
        }));

        setUserGrowthData(growthData as Array<{ name: string; users: number }>);
        setContentData(contentDataResult as Array<{ name: string; posts: number; videos: number; stories: number }>);
        setUserTypeData(userTypeResult as Array<{ name: string; value: number; color: string }>);
        setCityData(citiesResult as Array<{ name: string; users: number }>);

        console.log('✅ Toutes les données chargées avec succès');
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données admin:', error);
        // Afficher quand même les données par défaut pour éviter un écran blanc
        console.log('⚠️ Utilisation des données par défaut');
      } finally {
        setLoading(false);
        console.log('🏁 Chargement terminé');
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard Super Admin</h1>
        <p className="text-sm sm:text-base text-gray-400">Vue d'ensemble de la plateforme Kily</p>
      </div>

      {/* Stats Cards - Desktop Grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl sm:rounded-2xl p-4 sm:p-6`}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgIcon} rounded-lg sm:rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.textIcon}`} />
                </div>
                <div className={`flex items-center gap-1 ${card.changeColor} text-xs sm:text-sm`}>
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{card.change}</span>
                </div>
              </div>
              <h3 className="text-gray-400 text-xs sm:text-sm mb-1">{card.label}</h3>
              <p className="text-2xl sm:text-3xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Stats Cards - Mobile Carousel */}
      <div className="sm:hidden mb-6 relative">
        <div
          className="overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
          >
            {statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="min-w-full px-2"
                >
                  <div className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${card.bgIcon} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${card.textIcon}`} />
                      </div>
                      <div className={`flex items-center gap-1 ${card.changeColor} text-sm`}>
                        <ArrowUp className="w-4 h-4" />
                        <span>{card.change}</span>
                      </div>
                    </div>
                    <h3 className="text-gray-400 text-sm mb-1">{card.label}</h3>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {statsCards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCardIndex(index)}
              className={`transition-all ${
                index === currentCardIndex
                  ? "w-8 h-2 bg-violet-500 rounded-full"
                  : "w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* User Growth Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Croissance Utilisateurs</h3>
          <ResponsiveContainer width="100%" height={250}>
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
        <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Contenu Publié (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={250}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User Type Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Répartition Types d'Utilisateurs</h3>
          <ResponsiveContainer width="100%" height={250}>
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
        <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Top 5 Villes Actives</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityData} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#9ca3af" 
                width={100}
                tick={{ fontSize: 12 }}
                interval={0}
              />
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
