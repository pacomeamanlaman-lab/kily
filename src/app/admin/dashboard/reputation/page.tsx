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
import BadgeModal from "@/components/admin/BadgeModal";

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
  email: string;
  rating: number;
  reviewsCount: number;
  category: string;
  badges: string[];
}

type BadgeCategory = "all" | "verification" | "performance" | "progression" | "quality" | "specialization";

export default function ReputationPage() {
  const [loading, setLoading] = useState(true);
  const [topTalents, setTopTalents] = useState<TopTalent[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<BadgeCategory>("all");

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { 
          getTopTalents, 
          getAllBadges,
          getAverageRating 
        } = await import("@/lib/supabase/admin.service");
        
        const [talentsData, badgesData, avgRating] = await Promise.all([
          getTopTalents(10),
          getAllBadges(),
          getAverageRating(),
        ]);

        // Transformer les talents
        const transformedTalents: TopTalent[] = talentsData.map(talent => ({
          id: talent.id,
          name: talent.name,
          avatar: talent.avatar,
          email: talent.email,
          rating: talent.rating,
          reviewsCount: talent.reviewsCount,
          category: talent.category,
          badges: talent.badges,
        }));

        // Transformer les badges
        const transformedBadges: Badge[] = badgesData.map(badge => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          usersCount: badge.usersCount,
          criteria: badge.criteria,
        }));

        setTopTalents(transformedTalents);
        setBadges(transformedBadges);
        setAverageRating(avgRating);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // En cas d'erreur, garder des valeurs par défaut
        setBadges([]);
        setTopTalents([]);
        setAverageRating(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const handleCreateBadge = () => {
    setEditingBadge(null);
    setShowBadgeModal(true);
  };

  const handleEditBadge = (badge: Badge) => {
    setEditingBadge(badge);
    setShowBadgeModal(true);
  };

  const handleSaveBadge = async (badgeData: { id?: string; name: string; description: string; icon: string; color: string; criteria: string }) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Vous devez être connecté');
      }

      const isEdit = !!badgeData.id;
      const url = isEdit ? '/api/admin/update-badge' : '/api/admin/create-badge';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit 
        ? { badgeId: badgeData.id, ...badgeData }
        : badgeData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Une erreur est survenue');
      }

      // Recharger les badges
      const { getAllBadges } = await import("@/lib/supabase/admin.service");
      const badgesData = await getAllBadges();
      const transformedBadges: Badge[] = badgesData.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        usersCount: badge.usersCount,
        criteria: badge.criteria,
      }));
      setBadges(transformedBadges);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ? Toutes les attributions seront également supprimées.')) {
      return;
    }

    setActionLoading(badgeId);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch('/api/admin/delete-badge', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ badgeId }),
      });

      const result = await response.json();

      if (result.success) {
        // Retirer le badge de la liste
        setBadges(prev => prev.filter(b => b.id !== badgeId));
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getBadgeById = (id: string) => badges.find(b => b.id === id);

  const totalBadgesAwarded = badges.reduce((sum, badge) => sum + badge.usersCount, 0);

  // Fonction pour déterminer la catégorie d'un badge
  const getBadgeCategory = (badge: Badge): BadgeCategory => {
    const name = badge.name.toLowerCase();
    
    // Vérification & Statut
    if (name.includes('vérifié') || name.includes('premium') || name.includes('compte')) {
      return 'verification';
    }
    
    // Performance
    if (name.includes('top talent') || name.includes('expert') || name.includes('professionnel') || name.includes('talent de l\'année')) {
      return 'performance';
    }
    
    // Progression
    if (name.includes('rising star') || name.includes('confirmé') || name.includes('actif') || name.includes('membre')) {
      return 'progression';
    }
    
    // Qualité
    if (name.includes('excellence') || name.includes('fiable') || name.includes('communication')) {
      return 'quality';
    }
    
    // Spécialisation
    if (name.includes('spécialiste') || name.includes('multidisciplinaire')) {
      return 'specialization';
    }
    
    // Par défaut
    return 'performance';
  };

  // Filtrer les badges selon la catégorie active
  const filteredBadges = activeCategory === 'all' 
    ? badges 
    : badges.filter(badge => getBadgeCategory(badge) === activeCategory);

  const displayTopTalents = topTalents;

  // Définir les tabs
  const badgeTabs: Array<{ id: BadgeCategory; label: string; count: number }> = [
    { id: 'all', label: 'Tous', count: badges.length },
    { id: 'verification', label: 'Vérification & Statut', count: badges.filter(b => getBadgeCategory(b) === 'verification').length },
    { id: 'performance', label: 'Performance', count: badges.filter(b => getBadgeCategory(b) === 'performance').length },
    { id: 'progression', label: 'Progression', count: badges.filter(b => getBadgeCategory(b) === 'progression').length },
    { id: 'quality', label: 'Qualité', count: badges.filter(b => getBadgeCategory(b) === 'quality').length },
    { id: 'specialization', label: 'Spécialisation', count: badges.filter(b => getBadgeCategory(b) === 'specialization').length },
  ];

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
        <button 
          onClick={handleCreateBadge}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl text-white font-medium transition-all cursor-pointer"
        >
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
            value: averageRating > 0 ? averageRating.toFixed(1) : "0.0",
          },
          {
            id: "growth",
            icon: TrendingUp,
            gradient: "from-pink-600/20 to-pink-800/10",
            border: "border-pink-500/30",
            bgIcon: "bg-pink-500/20",
            textIcon: "text-pink-400",
            label: "Croissance avis",
            value: "+0%",
            change: "+0%",
            changeColor: "text-pink-400",
          },
        ]}
      />

      {/* Badges Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Badges Disponibles</h2>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 horizontal-scrollbar">
          {badgeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeCategory === tab.id
                    ? 'bg-white/20'
                    : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.length > 0 ? (
            filteredBadges.map((badge) => {
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
                    <button 
                      onClick={() => handleEditBadge(badge)}
                      className="p-2 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer" 
                      title="Éditer"
                    >
                      <Edit className="w-4 h-4 text-violet-400" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBadge(badge.id)}
                      disabled={actionLoading === badge.id}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50" 
                      title="Supprimer"
                    >
                      {actionLoading === badge.id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-400" />
                      )}
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
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun badge dans cette catégorie</p>
              <p className="text-gray-500 text-sm mt-2">Créez un nouveau badge pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Talents */}
      <div>
        <h2 className="text-xl font-bold mb-4">Top Talents par Note</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto horizontal-scrollbar">
            <table className="w-full min-w-[900px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Classement</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Talent</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
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
                    <span className="font-semibold text-white">{talent.name}</span>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-white text-sm">{talent.email}</td>

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

      {/* Badge Modal */}
      <BadgeModal
        isOpen={showBadgeModal}
        onClose={() => {
          setShowBadgeModal(false);
          setEditingBadge(null);
        }}
        onSave={handleSaveBadge}
        badge={editingBadge}
        mode={editingBadge ? "edit" : "create"}
      />
    </div>
  );
}
