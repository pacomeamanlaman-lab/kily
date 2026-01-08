"use client";

import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Content[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fonction pour voir le contenu
  const handleView = (contentItem: Content) => {
    // Rediriger vers le feed avec un hash pour identifier le contenu
    // TODO: Créer des routes dédiées /posts/[id], /videos/[id], /stories/[id] pour une meilleure UX
    const url = `/feed#${contentItem.type}-${contentItem.id}`;
    window.open(url, '_blank');
  };

  // Fonction pour supprimer le contenu
  const handleDelete = async (contentItem: Content) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce ${contentItem.type} ?`)) {
      return;
    }

    setDeleting(contentItem.id);

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Vous devez être connecté');
        return;
      }

      const response = await fetch('/api/admin/delete-content', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          contentId: contentItem.id,
          contentType: contentItem.type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Retirer le contenu de la liste
        setContent(content.filter(c => c.id !== contentItem.id));
        alert(`${contentItem.type} supprimé avec succès`);
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // Charger le contenu depuis Supabase
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const { loadPosts } = await import("@/lib/supabase/posts.service");
        const { loadVideos } = await import("@/lib/supabase/videos.service");
        const { loadStories } = await import("@/lib/supabase/stories.service");
        const { getUserById } = await import("@/lib/supabase/users.service");
        const { getReportsCountByContent } = await import("@/lib/supabase/admin.service");

        const [posts, videos, stories, reportsCount] = await Promise.all([
          loadPosts(1000),
          loadVideos(1000),
          loadStories(),
          getReportsCountByContent(),
        ]);

        // Transformer les posts
        const postsContent: Content[] = await Promise.all(
          posts.map(async (post) => {
            const author = post.author || await getUserById(post.author_id);
            const reportKey = `post_${post.id}`;
            return {
              id: post.id,
              type: "post" as const,
              title: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
              author: {
                name: author ? `${author.first_name} ${author.last_name}` : "Utilisateur",
                avatar: author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
              },
              category: post.category || "Général",
              likes: post.likes_count || 0,
              comments: post.comments_count || 0,
              views: post.views_count || 0,
              reports: reportsCount[reportKey] || 0,
              publishedAt: new Date(post.created_at).toISOString().split('T')[0],
              thumbnail: post.images?.[0] || undefined,
            };
          })
        );

        // Transformer les vidéos
        const videosContent: Content[] = await Promise.all(
          videos.map(async (video) => {
            const author = video.author || await getUserById(video.author_id);
            const reportKey = `video_${video.id}`;
            return {
              id: video.id,
              type: "video" as const,
              title: video.title,
              author: {
                name: author ? `${author.first_name} ${author.last_name}` : "Utilisateur",
                avatar: author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
              },
              category: video.category || "Général",
              likes: video.likes_count || 0,
              comments: video.comments_count || 0,
              views: parseInt(video.views_count || "0"),
              reports: reportsCount[reportKey] || 0,
              publishedAt: new Date(video.created_at).toISOString().split('T')[0],
              thumbnail: video.thumbnail,
            };
          })
        );

        // Transformer les stories
        const storiesContent: Content[] = await Promise.all(
          stories.map(async (story) => {
            const author = story.author || await getUserById(story.author_id);
            const reportKey = `story_${story.id}`;
            return {
              id: story.id,
              type: "story" as const,
              title: `Story de ${author ? `${author.first_name} ${author.last_name}` : "Utilisateur"}`,
              author: {
                name: author ? `${author.first_name} ${author.last_name}` : "Utilisateur",
                avatar: author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
              },
              category: "Story",
              likes: 0,
              comments: 0,
              views: 0,
              reports: reportsCount[reportKey] || 0,
              publishedAt: new Date(story.created_at).toISOString().split('T')[0],
              thumbnail: story.thumbnail,
            };
          })
        );

        setContent([...postsContent, ...videosContent, ...storiesContent]);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);


  const filteredContent = content.filter((contentItem) => {
    const matchesSearch = contentItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contentItem.author.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || contentItem.type === filterType;
    const matchesCategory = filterCategory === "all" || contentItem.category === filterCategory;

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

  // Calculer les stats depuis le contenu chargé
  const postsCount = content.filter(c => c.type === 'post').length;
  const videosCount = content.filter(c => c.type === 'video').length;
  const storiesCount = content.filter(c => c.type === 'story').length;

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement du contenu...</p>
        </div>
      </div>
    );
  }

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
            value: postsCount.toLocaleString(),
          },
          {
            id: "videos",
            icon: Video,
            gradient: "from-orange-600/20 to-orange-800/10",
            border: "border-orange-500/30",
            bgIcon: "bg-orange-500/20",
            textIcon: "text-orange-400",
            label: "Vidéos",
            value: videosCount.toLocaleString(),
          },
          {
            id: "stories",
            icon: ImageIcon,
            gradient: "from-violet-600/20 to-violet-800/10",
            border: "border-violet-500/30",
            bgIcon: "bg-violet-500/20",
            textIcon: "text-violet-400",
            label: "Stories",
            value: storiesCount.toLocaleString(),
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
                    <button
                      onClick={() => handleView(content)}
                      className="p-2 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4 text-violet-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(content)}
                      disabled={deleting === content.id}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Supprimer"
                    >
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
                <button
                  onClick={() => handleView(content)}
                  className="px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 transition-all text-xs"
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Voir
                </button>
                <button
                  onClick={() => handleDelete(content)}
                  disabled={deleting === content.id}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
