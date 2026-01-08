"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, TrendingUp, Users, Building2 } from "lucide-react";
import StatsCardsCarousel from "@/components/admin/StatsCardsCarousel";
import { abidjanCommunes } from "@/lib/locationData";

interface City {
  id: string;
  name: string;
  country: string;
  flag: string;
  usersCount: number;
  talentsCount: number;
  postsCount: number;
  growth: number; // percentage
}

interface Commune {
  name: string;
  usersCount: number;
  talentsCount: number;
  postsCount: number;
}

export default function CitiesPage() {
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [abidjanCommunesData, setAbidjanCommunesData] = useState<Commune[]>([]);

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { getCitiesStats } = await import("@/lib/supabase/admin.service");
        const { getAllUsers } = await import("@/lib/supabase/users.service");
        const { loadPosts } = await import("@/lib/supabase/posts.service");
        
        const [citiesData, allUsers, allPosts] = await Promise.all([
          getCitiesStats(),
          getAllUsers(),
          loadPosts(10000),
        ]);

        // Transformer les données
        const transformedCities: City[] = citiesData.map((city, index) => ({
          id: (index + 1).toString(),
          name: city.name,
          country: city.country,
          flag: city.flag,
          usersCount: city.usersCount,
          talentsCount: city.talentsCount,
          postsCount: city.postsCount,
          growth: city.growth,
        }));

        setCities(transformedCities);

        // Pour les communes d'Abidjan, récupérer depuis les utilisateurs
        // Filtrer les utilisateurs d'Abidjan et grouper par commune
        const abidjanUsers = allUsers?.filter(u => 
          u.city && (u.city.toLowerCase().includes('abidjan') || u.city.toLowerCase() === 'abidjan')
        ) || [];
        
        const communeStats: Record<string, { usersCount: number; talentsCount: number; postsCount: number }> = {};
        
        abidjanUsers.forEach(user => {
          const commune = user.commune || 'Non spécifié';
          if (!communeStats[commune]) {
            communeStats[commune] = { usersCount: 0, talentsCount: 0, postsCount: 0 };
          }
          communeStats[commune].usersCount++;
          if (user.user_type === 'talent') {
            communeStats[commune].talentsCount++;
          }
        });

        // Compter les posts par commune
        if (allPosts && allUsers) {
          const userMap = new Map(allUsers.map(u => [u.id, u]));
          allPosts.forEach(post => {
            const user = userMap.get(post.author_id);
            if (user?.commune && communeStats[user.commune]) {
              communeStats[user.commune].postsCount++;
            }
          });
        }

        const communesArray = Object.entries(communeStats)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.usersCount - a.usersCount);

        setAbidjanCommunesData(communesArray);
      } catch (error) {
        console.error('Erreur lors du chargement des villes:', error);
        // En cas d'erreur, garder un tableau vide
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const sortedCities = [...cities].sort((a, b) => b.usersCount - a.usersCount);
  const abidjanCity = cities.find(c => c.name === "Abidjan");
  const sortedCommunes = [...abidjanCommunesData].sort((a, b) => b.usersCount - a.usersCount);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestion des Villes</h1>
          <p className="text-gray-400">Gérez les villes actives sur la plateforme</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl text-white font-medium transition-all cursor-pointer">
          <Plus className="w-5 h-5" />
          Nouvelle Ville
        </button>
      </div>

      {/* Stats */}
      <StatsCardsCarousel
        cards={[
          {
            id: "total",
            icon: MapPin,
            gradient: "from-blue-600/20 to-blue-800/10",
            border: "border-blue-500/30",
            bgIcon: "bg-blue-500/20",
            textIcon: "text-blue-400",
            label: "Total Villes",
            value: cities.length.toString(),
          },
          {
            id: "users",
            icon: Users,
            gradient: "from-violet-600/20 to-violet-800/10",
            border: "border-violet-500/30",
            bgIcon: "bg-violet-500/20",
            textIcon: "text-violet-400",
            label: "Total Utilisateurs",
            value: cities.reduce((sum, city) => sum + city.usersCount, 0).toString(),
          },
          {
            id: "active",
            icon: Building2,
            gradient: "from-orange-600/20 to-orange-800/10",
            border: "border-orange-500/30",
            bgIcon: "bg-orange-500/20",
            textIcon: "text-orange-400",
            label: sortedCities[0]?.name || "Ville la Plus Active",
            value: sortedCities[0]?.usersCount.toString() || "0",
          },
          {
            id: "growth",
            icon: TrendingUp,
            gradient: "from-green-600/20 to-green-800/10",
            border: "border-green-500/30",
            bgIcon: "bg-green-500/20",
            textIcon: "text-green-400",
            label: "Croissance Moyenne",
            value: `+${Math.round(cities.reduce((sum, city) => sum + city.growth, 0) / cities.length)}%`,
            change: `+${Math.round(cities.reduce((sum, city) => sum + city.growth, 0) / cities.length)}%`,
            changeColor: "text-green-400",
          },
        ]}
      />

      {/* Cities Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
        <div className="overflow-x-auto horizontal-scrollbar">
          <table className="w-full min-w-[800px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Classement</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ville</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Pays</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Utilisateurs</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Talents</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Posts</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Croissance</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedCities.map((city, index) => (
              <tr key={city.id} className="hover:bg-white/5 transition-colors">
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

                {/* City */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{city.name}</p>
                    </div>
                  </div>
                </td>

                {/* Country */}
                <td className="px-6 py-4 text-white">{city.country}</td>

                {/* Users Count */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[100px]">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${(city.usersCount / 500) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-white font-semibold">{city.usersCount}</span>
                  </div>
                </td>

                {/* Talents Count */}
                <td className="px-6 py-4 text-white">{city.talentsCount}</td>

                {/* Posts Count */}
                <td className="px-6 py-4 text-white">{city.postsCount}</td>

                {/* Growth */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">+{city.growth}%</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer" title="Éditer">
                      <Edit className="w-4 h-4 text-violet-400" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Supprimer">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Communes d'Abidjan Section */}
      {abidjanCity && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Communes d'Abidjan</h2>
                <p className="text-sm text-gray-400">
                  Répartition des utilisateurs par commune ({abidjanCommunesData.length} communes actives)
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto horizontal-scrollbar">
            <table className="w-full min-w-[700px]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Classement</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Commune</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Utilisateurs</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Talents</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Posts</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">% d'Abidjan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sortedCommunes.map((commune, index) => {
                  const percentage = abidjanCity ? ((commune.usersCount / abidjanCity.usersCount) * 100).toFixed(1) : "0";
                  return (
                    <tr key={commune.name} className="hover:bg-white/5 transition-colors">
                      {/* Rank */}
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? "bg-violet-500/20 text-violet-400" :
                          index === 1 ? "bg-violet-400/20 text-violet-300" :
                          index === 2 ? "bg-violet-300/20 text-violet-200" :
                          "bg-white/5 text-gray-400"
                        }`}>
                          {index + 1}
                        </div>
                      </td>

                      {/* Commune */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{commune.name}</p>
                      </td>

                      {/* Users Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px]">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500 rounded-full"
                                style={{ width: `${(commune.usersCount / (abidjanCity?.usersCount || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-white font-semibold">{commune.usersCount}</span>
                        </div>
                      </td>

                      {/* Talents Count */}
                      <td className="px-6 py-4 text-white">{commune.talentsCount}</td>

                      {/* Posts Count */}
                      <td className="px-6 py-4 text-white">{commune.postsCount}</td>

                      {/* Percentage */}
                      <td className="px-6 py-4">
                        <span className="text-violet-400 font-semibold">{percentage}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
