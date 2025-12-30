"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { mockTalents } from "@/lib/mockData";
import TalentCard from "@/components/talent/TalentCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"talents" | "posts" | "all">("all");

  // Filtrage des résultats
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return mockTalents.filter((talent) => {
      const matchesName = talent.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = talent.skills.some((skill) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesLocation = talent.location.city
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesName || matchesSkill || matchesLocation;
    });
  }, [searchQuery]);

  const tabs = [
    { value: "all" as const, label: "Tout", count: searchResults.length },
    { value: "talents" as const, label: "Talents", count: searchResults.length },
    { value: "posts" as const, label: "Publications", count: 0 },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des talents, compétences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button variant="secondary">
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!searchQuery ? (
          /* Empty State - No Search */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-500/10 border border-violet-500/30 rounded-full mb-6">
              <Search className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Recherchez des talents</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Trouvez des talents par nom, compétence ou localisation
            </p>

            {/* Suggestions */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-3">Recherches populaires :</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Cuisine", "Développeur", "Coiffure", "Plombier", "Designer"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-400 transition-all"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        ) : searchResults.length === 0 ? (
          /* Empty State - No Results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-full mb-6">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Aucun résultat</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Aucun résultat pour &quot;{searchQuery}&quot;. Essayez d&apos;autres mots-clés.
            </p>
            <Button variant="secondary" onClick={() => setSearchQuery("")}>
              Effacer la recherche
            </Button>
          </motion.div>
        ) : (
          /* Results Grid */
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <h2 className="text-xl font-bold">
                {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""}{" "}
                pour &quot;{searchQuery}&quot;
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((talent, index) => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TalentCard
                    talent={talent}
                    onClick={() => router.push(`/profile/${talent.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
