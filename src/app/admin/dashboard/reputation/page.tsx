"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Award,
  Shield,
  Crown,
  Zap,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import StatsCardsCarousel from "@/components/admin/StatsCardsCarousel";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  usersCount: number;
  criteria: string;
}

interface TopTalent {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  category: string;
  badges: string[];
}

export default function ReputationPage() {
  const [loading, setLoading] = useState(true);
  const [topTalents, setTopTalents] = useState<TopTalent[]>([]);

  // Charger les top talents depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { getTopTalents } = await import("@/lib/supabase/admin.service");
        const talentsData = await getTopTalents(10);

        // Transformer les données
        const transformedTalents: TopTalent[] = talentsData.map(talent => ({
          id: talent.id,
          name: talent.name,
          avatar: talent.avatar,
          rating: talent.rating,
          reviewsCount: talent.reviewsCount,
          category: talent.category,
          badges: talent.badges,
        }));

        setTopTalents(transformedTalents);
      } catch (error) {
        console.error('Erreur lors du chargement des top talents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Badges statiques (peuvent être gérés depuis la DB plus tard)
  const [badges] = useState<Badge[]>([
    {
      id: "1",
      name: "Talent Vérifié",
      description: "Identité vérifiée par l'équipe Kily",
      icon: "CheckCircle",
      color: "#10b981",
      usersCount: 245,
      criteria: "Vérification manuelle admin"
    },
    {
      id: "2",
      name: "Top Talent",
      description: "Dans le top 10% des talents les mieux notés",
      icon: "Crown",
      color: "#f59e0b",
      usersCount: 89,
      criteria: "Note moyenne ≥ 4.8/5"
    },
    {
      id: "3",
      name: "Expert",
      description: "Expertise reconnue dans son domaine",
      icon: "Award",
      color: "#8b5cf6",
      usersCount: 167,
      criteria: "50+ projets complétés"
    },
    {
      id: "4",
      name: "Professionnel",
      description: "Service professionnel et fiable",
      icon: "Shield",
      color: "#06b6d4",
      usersCount: 312,
      criteria: "Note moyenne ≥ 4.5/5 + 20+ avis"
    },
    {
      id: "5",
      name: "Rising Star",
      description: "Nouveau talent prometteur",
      icon: "Zap",
      color: "#ec4899",
      usersCount: 134,
      criteria: "Inscrit < 3 mois + note ≥ 4.5"
    },
    {
      id: "6",
      name: "Talent de l'Année",
      description: "Meilleur talent de l'année",
      icon: "Star",
      color: "#fbbf24",
      usersCount: 12,
      criteria: "Attribution manuelle"
    }
  ]);

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      CheckCircle,
      Crown,
      Award,
      Shield,
      Zap,
      Star
    };
    return icons[iconName] || Star;
  };

  const getBadgeById = (id: string) => badges.find(b => b.id === id);

  const totalBadgesAwarded = badges.reduce((sum, badge) => sum + badge.usersCount, 0);
  const averageRating = (topTalents.reduce((sum, talent) => sum + talent.rating, 0) / topTalents.length).toFixed(1);

  const displayTopTalents = topTalents;

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement de la réputation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Système de Réputation</h1>
          <p className="text-gray-400">Gérez les badges et récompenses</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl text-white font-medium transition-all cursor-pointer">
          <Plus className="w-5 h-5" />
          Nouveau Badge
        </button>
      </div>

      {/* Stats Cards */}
      <StatsCardsCarousel
        cards={[
          {
            id: "badges",
            icon: Award,
            gradient: "from-violet-600/20 to-violet-800/10",
            border: "border-violet-500/30",
            bgIcon: "bg-violet-500/20",
            textIcon: "text-violet-400",
            label: "Badges disponibles",
            value: badges.length.toString(),
          },
          {
            id: "awarded",
            icon: Crown,
            gradient: "from-yellow-600/20 to-yellow-800/10",
            border: "border-yellow-500/30",
            bgIcon: "bg-yellow-500/20",
            textIcon: "text-yellow-400",
            label: "Badges attribués",
            value: totalBadgesAwarded.toString(),
          },
          {
            id: "rating",
            icon: Star,
            gradient: "from-green-600/20 to-green-800/10",
            border: "border-green-500/30",
            bgIcon: "bg-green-500/20",
            textIcon: "text-green-400",
            label: "Note moyenne",
            value: averageRating.toString(),
          },
          {
            id: "growth",
            icon: TrendingUp,
            gradient: "from-pink-600/20 to-pink-800/10",
            border: "border-pink-500/30",
            bgIcon: "bg-pink-500/20",
            textIcon: "text-pink-400",
            label: "Croissance avis",
            value: "+23%",
            change: "+23%",
            changeColor: "text-pink-400",
          },
        ]}
      />

      {/* Badges Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Badges Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const IconComponent = getIconComponent(badge.icon);

            return (
              <div
                key={badge.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${badge.color}20` }}
                  >
                    <IconComponent className="w-7 h-7" style={{ color: badge.color }} />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer" title="Éditer">
                      <Edit className="w-4 h-4 text-violet-400" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Supprimer">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{badge.description}</p>

                {/* Criteria */}
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Critères d'attribution</p>
                  <p className="text-sm text-white">{badge.criteria}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Attribué à</span>
                  <span className="text-lg font-bold text-white">{badge.usersCount} talents</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Talents */}
      <div>
        <h2 className="text-xl font-bold mb-4">Top Talents par Note</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto horizontal-scrollbar">
            <table className="w-full min-w-[700px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Classement</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Talent</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Catégorie</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Note</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Avis</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {displayTopTalents.map((talent, index) => (
                <tr key={talent.id} className="hover:bg-white/5 transition-colors">
                  {/* Rank */}
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      index === 1 ? "bg-gray-400/20 text-gray-300" :
                      index === 2 ? "bg-orange-500/20 text-orange-400" :
                      "bg-white/5 text-gray-400"
                    }`}>
                      {index + 1}
                    </div>
                  </td>

                  {/* Talent */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={talent.avatar}
                        alt={talent.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-semibold text-white">{talent.name}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-white">{talent.category}</td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">{talent.rating}</span>
                    </div>
                  </td>

                  {/* Reviews Count */}
                  <td className="px-6 py-4 text-white">{talent.reviewsCount} avis</td>

                  {/* Badges */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {talent.badges.map((badgeId) => {
                        const badge = getBadgeById(badgeId);
                        if (!badge) return null;
                        const IconComponent = getIconComponent(badge.icon);

                        return (
                          <div
                            key={badgeId}
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                            style={{ backgroundColor: `${badge.color}20` }}
                            title={badge.name}
                          >
                            <IconComponent className="w-4 h-4" style={{ color: badge.color }} />
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
