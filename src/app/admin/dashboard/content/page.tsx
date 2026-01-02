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
  Calendar,
  MoreVertical,
  Heart,
  MessageCircle
} from "lucide-react";
import StatsCardsCarousel from "@/components/admin/StatsCardsCarousel";

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
      <StatsCardsCarousel
        cards={[
          {
            id: "posts",
            icon: FileText,
            gradient: "from-pink-600/20 to-pink-800/10",
            border: "border-pink-500/30",
            bgIcon: "bg-pink-500/20",
            textIcon: "text-pink-400",
            label: "Posts",
            value: "1,234",
          },
          {
            id: "videos",
            icon: Video,
            gradient: "from-orange-600/20 to-orange-800/10",
            border: "border-orange-500/30",
            bgIcon: "bg-orange-500/20",
            textIcon: "text-orange-400",
            label: "Vidéos",
            value: "567",
          },
          {
            id: "stories",
            icon: ImageIcon,
            gradient: "from-violet-600/20 to-violet-800/10",
            border: "border-violet-500/30",
            bgIcon: "bg-violet-500/20",
            textIcon: "text-violet-400",
            label: "Stories",
            value: "892",
          },
          {
            id: "reports",
            icon: Flag,
            gradient: "from-red-600/20 to-red-800/10",
            border: "border-red-500/30",
            bgIcon: "bg-red-500/20",
            textIcon: "text-red-400",
            label: "Signalements",
            value: "12",
          },
        ]}
      />

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

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
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
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredContent.map((content) => (
          <div
            key={content.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              {content.thumbnail && (
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-white line-clamp-2">{content.title}</p>
                  <button className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadge(content.type)}`}>
                  {getTypeIcon(content.type)}
                  {content.type === "post" ? "Post" : content.type === "video" ? "Vidéo" : "Story"}
                </span>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              <img
                src={content.author.avatar}
                alt={content.author.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm text-gray-300">{content.author.name}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{content.category}</span>
            </div>

            {/* Engagement */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{content.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{content.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{content.comments}</span>
              </div>
              {content.reports > 0 && (
                <div className="flex items-center gap-1 text-red-400">
                  <Flag className="w-4 h-4" />
                  <span>{content.reports}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(content.publishedAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 transition-all text-xs">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Voir
                </button>
                <button className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          Aucun contenu trouvé avec ces critères
        </div>
      )}
    </div>
  );
}
