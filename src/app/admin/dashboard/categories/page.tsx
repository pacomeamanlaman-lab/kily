"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Code, Palette, Briefcase, Music, Sparkles, Dumbbell, ChefHat, Wrench } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  talentsCount: number;
  postsCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Tech & Code", icon: "Code", color: "#8b5cf6", talentsCount: 245, postsCount: 567 },
    { id: "2", name: "Design & Créa", icon: "Palette", color: "#ec4899", talentsCount: 198, postsCount: 432 },
    { id: "3", name: "Marketing", icon: "Briefcase", color: "#f59e0b", talentsCount: 134, postsCount: 289 },
    { id: "4", name: "Musique", icon: "Music", color: "#10b981", talentsCount: 167, postsCount: 345 },
    { id: "5", name: "Art", icon: "Sparkles", color: "#06b6d4", talentsCount: 156, postsCount: 312 },
    { id: "6", name: "Sport", icon: "Dumbbell", color: "#ef4444", talentsCount: 123, postsCount: 234 },
    { id: "7", name: "Cuisine", icon: "ChefHat", color: "#f97316", talentsCount: 189, postsCount: 401 },
    { id: "8", name: "Bricolage", icon: "Wrench", color: "#6366f1", talentsCount: 145, postsCount: 278 },
  ]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Catégories</p>
          <p className="text-3xl font-bold text-white">{categories.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Talents</p>
          <p className="text-3xl font-bold text-white">
            {categories.reduce((sum, cat) => sum + cat.talentsCount, 0)}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Posts</p>
          <p className="text-3xl font-bold text-white">
            {categories.reduce((sum, cat) => sum + cat.postsCount, 0)}
          </p>
        </div>
      </div>

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
