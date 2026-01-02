"use client";

import { useState } from "react";
import {
  Search,
  FileText,
  Video,
  Image as ImageIcon,
  Eye,
  Trash2,
  Flag,
  TrendingUp,
  Calendar
} from "lucide-react";

interface Content {
  id: string;
  type: "post" | "video" | "story";
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  likes: number;
  comments: number;
  views: number;
  reports: number;
  publishedAt: string;
  thumbnail?: string;
}

export default function ContentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Mock data
  const mockContent: Content[] = [
    {
      id: "1",
      type: "post",
      title: "Les secrets d'une bonne pâtisserie africaine",
      author: {
        name: "Amina Koné",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
      },
      category: "Cuisine",
      likes: 234,
      comments: 45,
      views: 1200,
      reports: 0,
      publishedAt: "2024-06-15",
      thumbnail: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=300"
    },
    {
      id: "2",
      type: "video",
      title: "Développer une app mobile en 30min",
      author: {
        name: "Kofi Mensah",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
      },
      category: "Tech & Code",
      likes: 567,
      comments: 89,
      views: 3400,
      reports: 0,
      publishedAt: "2024-06-20",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300"
    },
    {
      id: "3",
      type: "story",
      title: "Story du jour - Design UI/UX",
      author: {
        name: "Sarah Mensah",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
      },
      category: "Design & Créa",
      likes: 123,
      comments: 12,
      views: 890,
      reports: 0,
      publishedAt: "2024-06-25",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300"
    },
    {
      id: "4",
      type: "post",
      title: "Réparer une fuite d'eau en 5 étapes",
      author: {
        name: "Ibrahim Diallo",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"
      },
      category: "Bricolage",
      likes: 189,
      comments: 34,
      views: 980,
      reports: 2,
      publishedAt: "2024-06-10"
    }
  ];

  const filteredContent = mockContent.filter((content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.author.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || content.type === filterType;
    const matchesCategory = filterCategory === "all" || content.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return <FileText className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "story":
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      post: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      video: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      story: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    };
    return badges[type as keyof typeof badges];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gestion du Contenu</h1>
        <p className="text-gray-400">Gérez tous les posts, vidéos et stories</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/10 border border-pink-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1,234</p>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/10 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">567</p>
              <p className="text-xs text-gray-400">Vidéos</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-600/20 to-violet-800/10 border border-violet-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">892</p>
              <p className="text-xs text-gray-400">Stories</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-red-800/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-xs text-gray-400">Signalements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, auteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all" className="bg-gray-900">Tous les types</option>
            <option value="post" className="bg-gray-900">Posts</option>
            <option value="video" className="bg-gray-900">Vidéos</option>
            <option value="story" className="bg-gray-900">Stories</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all" className="bg-gray-900">Toutes catégories</option>
            <option value="Tech & Code" className="bg-gray-900">Tech & Code</option>
            <option value="Design & Créa" className="bg-gray-900">Design & Créa</option>
            <option value="Cuisine" className="bg-gray-900">Cuisine</option>
            <option value="Bricolage" className="bg-gray-900">Bricolage</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          {filteredContent.length} contenu{filteredContent.length > 1 ? "s" : ""} trouvé{filteredContent.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Contenu</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Auteur</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Catégorie</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Engagement</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Publié le</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredContent.map((content) => (
              <tr key={content.id} className="hover:bg-white/5 transition-colors">
                {/* Content */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {content.thumbnail && (
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <p className="font-medium text-white max-w-xs truncate">{content.title}</p>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadge(content.type)}`}>
                    {getTypeIcon(content.type)}
                    {content.type === "post" ? "Post" : content.type === "video" ? "Vidéo" : "Story"}
                  </span>
                </td>

                {/* Author */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={content.author.avatar}
                      alt={content.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-white text-sm">{content.author.name}</span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 text-white text-sm">{content.category}</td>

                {/* Engagement */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {content.views}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>❤️ {content.likes}</span>
                      <span>💬 {content.comments}</span>
                    </div>
                    {content.reports > 0 && (
                      <div className="flex items-center gap-1 text-red-400">
                        <Flag className="w-3 h-3" />
                        {content.reports} signalement{content.reports > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </td>

                {/* Published Date */}
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(content.publishedAt).toLocaleDateString("fr-FR")}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer" title="Voir">
                      <Eye className="w-4 h-4 text-violet-400" />
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

        {filteredContent.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            Aucun contenu trouvé avec ces critères
          </div>
        )}
      </div>
    </div>
  );
}
