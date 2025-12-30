"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { mockTalents, skillCategories, cities } from "@/lib/mockData";
import { useRouter, useSearchParams } from "next/navigation";
import TalentCard from "@/components/talent/TalentCard";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Lire le paramètre category depuis l'URL
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setShowFilters(true);
    }
  }, [searchParams]);

  // Filtrage des talents
  const filteredTalents = useMemo(() => {
    return mockTalents.filter((talent) => {
      // Filtre par recherche
      const matchesSearch =
        searchQuery === "" ||
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.skills.some((skill) =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Filtre par catégorie
      const matchesCategory =
        !selectedCategory ||
        talent.skills.some((skill) => skill.category === selectedCategory);

      // Filtre par ville
      const matchesCity = !selectedCity || talent.location.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [searchQuery, selectedCategory, selectedCity]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedCity(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedCity;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 lg:px-8 pt-6 pb-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Retour à l&apos;accueil</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">
              Découvrir les <span className="text-violet-500">talents</span>
            </h1>
            <p className="text-gray-400">
              {filteredTalents.length} talent{filteredTalents.length > 1 ? "s" : ""} disponible
              {filteredTalents.length > 1 ? "s" : ""}
            </p>
          </motion.div>

          {/* Barre de recherche */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou compétence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            <Button
              variant={showFilters || hasActiveFilters ? "primary" : "secondary"}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full" />
              )}
            </Button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10"
            >
              {/* Catégories */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-300">Catégories</h3>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillCategories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "primary" : "secondary"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category.id ? null : category.id
                        )
                      }
                    >
                      {category.name} ({category.count})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Villes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-300">Localisation</h3>
                  {selectedCity && (
                    <button
                      onClick={() => setSelectedCity(null)}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {cities.slice(0, 8).map((city) => (
                    <Badge
                      key={city}
                      variant={selectedCity === city ? "primary" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                    >
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Bouton reset */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="w-4 h-4" />
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Filtres actifs */}
          {hasActiveFilters && !showFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Filtres actifs:</span>
              {selectedCategory && (
                <Badge variant="primary" className="cursor-pointer" onClick={() => setSelectedCategory(null)}>
                  {skillCategories.find((c) => c.id === selectedCategory)?.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {selectedCity && (
                <Badge variant="primary" className="cursor-pointer" onClick={() => setSelectedCity(null)}>
                  {selectedCity}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grille de talents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTalents.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredTalents.map((talent, index) => (
              <motion.div
                key={talent.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <TalentCard
                  talent={talent}
                  onClick={() => router.push(`/profile/${talent.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Aucun talent trouvé</h3>
            <p className="text-gray-400 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
