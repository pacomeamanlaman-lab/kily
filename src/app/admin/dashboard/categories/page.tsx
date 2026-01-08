"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Code, Palette, Briefcase, Music, Sparkles, Dumbbell, ChefHat, Wrench, Tag, Users, FileText } from "lucide-react";
import StatsCardsCarousel from "@/components/admin/StatsCardsCarousel";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  talentsCount: number;
  postsCount: number;
}

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { getCategoriesStats } = await import("@/lib/supabase/admin.service");
        const categoriesData = await getCategoriesStats();

        // Transformer les données
        const transformedCategories: Category[] = categoriesData.map((cat, index) => ({
          id: (index + 1).toString(),
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          talentsCount: cat.talentsCount,
          postsCount: cat.postsCount,
        }));

        setCategories(transformedCategories);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        // En cas d'erreur, garder un tableau vide
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      Code,
      Palette,
      Briefcase,
      Music,
      Sparkles,
      Dumbbell,
      ChefHat,
      Wrench
    };
    return icons[iconName] || Code;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestion des Catégories</h1>
          <p className="text-gray-400">Gérez les catégories de compétences</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl text-white font-medium transition-all cursor-pointer">
          <Plus className="w-5 h-5" />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Stats */}
      <StatsCardsCarousel
        cards={[
          {
            id: "categories",
            icon: Tag,
            gradient: "from-violet-600/20 to-violet-800/10",
            border: "border-violet-500/30",
            bgIcon: "bg-violet-500/20",
            textIcon: "text-violet-400",
            label: "Total Catégories",
            value: categories.length.toString(),
          },
          {
            id: "talents",
            icon: Users,
            gradient: "from-pink-600/20 to-pink-800/10",
            border: "border-pink-500/30",
            bgIcon: "bg-pink-500/20",
            textIcon: "text-pink-400",
            label: "Total Talents",
            value: categories.reduce((sum, cat) => sum + cat.talentsCount, 0).toString(),
          },
          {
            id: "posts",
            icon: FileText,
            gradient: "from-orange-600/20 to-orange-800/10",
            border: "border-orange-500/30",
            bgIcon: "bg-orange-500/20",
            textIcon: "text-orange-400",
            label: "Total Posts",
            value: categories.reduce((sum, cat) => sum + cat.postsCount, 0).toString(),
          },
        ]}
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);

          return (
            <div
              key={category.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: category.color }} />
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

              {/* Name */}
              <h3 className="text-lg font-bold text-white mb-4">{category.name}</h3>

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Talents</span>
                  <span className="text-white font-semibold">{category.talentsCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Posts</span>
                  <span className="text-white font-semibold">{category.postsCount}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(category.talentsCount / 300) * 100}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
