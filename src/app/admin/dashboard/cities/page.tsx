"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, MapPin, TrendingUp } from "lucide-react";

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

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([
    { id: "1", name: "Abidjan", country: "Côte d'Ivoire", flag: "🇨🇮", usersCount: 456, talentsCount: 245, postsCount: 678, growth: 12 },
    { id: "2", name: "Lagos", country: "Nigeria", flag: "🇳🇬", usersCount: 389, talentsCount: 198, postsCount: 534, growth: 18 },
    { id: "3", name: "Accra", country: "Ghana", flag: "🇬🇭", usersCount: 298, talentsCount: 152, postsCount: 423, growth: 8 },
    { id: "4", name: "Dakar", country: "Sénégal", flag: "🇸🇳", usersCount: 267, talentsCount: 134, postsCount: 389, growth: 15 },
    { id: "5", name: "Nairobi", country: "Kenya", flag: "🇰🇪", usersCount: 234, talentsCount: 123, postsCount: 345, growth: 22 },
    { id: "6", name: "Douala", country: "Cameroun", flag: "🇨🇲", usersCount: 189, talentsCount: 98, postsCount: 267, growth: 10 },
    { id: "7", name: "Kinshasa", country: "RD Congo", flag: "🇨🇩", usersCount: 176, talentsCount: 87, postsCount: 234, growth: 14 },
    { id: "8", name: "Casablanca", country: "Maroc", flag: "🇲🇦", usersCount: 156, talentsCount: 76, postsCount: 198, growth: 9 },
  ]);

  const sortedCities = [...cities].sort((a, b) => b.usersCount - a.usersCount);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Villes</p>
          <p className="text-3xl font-bold text-white">{cities.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Utilisateurs</p>
          <p className="text-3xl font-bold text-white">
            {cities.reduce((sum, city) => sum + city.usersCount, 0)}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Ville la Plus Active</p>
          <p className="text-xl font-bold text-white">{sortedCities[0]?.name}</p>
          <p className="text-sm text-gray-400">{sortedCities[0]?.usersCount} utilisateurs</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Croissance Moyenne</p>
          <p className="text-3xl font-bold text-green-400">
            +{Math.round(cities.reduce((sum, city) => sum + city.growth, 0) / cities.length)}%
          </p>
        </div>
      </div>

      {/* Cities Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
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
                      <p className="text-xs text-gray-400">{city.flag}</p>
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
  );
}
