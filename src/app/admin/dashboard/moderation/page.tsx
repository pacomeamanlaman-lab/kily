"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Ban,
  MessageSquare,
  FileText,
  Video,
  User,
  MoreVertical,
  ChevronDown
} from "lucide-react";
import StatsCardsCarousel from "@/components/admin/StatsCardsCarousel";

interface Report {
  id: string;
  type: "content" | "user" | "comment";
  contentType?: "post" | "video" | "story";
  reportedItem: {
    id: string;
    title?: string;
    author: {
      name: string;
      avatar: string;
    };
    thumbnail?: string;
  };
  reportedBy: {
    name: string;
    avatar: string;
  };
  reason: string;
  description: string;
  reportCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function ModerationPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedActions, setExpandedActions] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  // Charger les signalements depuis Supabase
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const { getAllReports } = await import("@/lib/supabase/admin.service");
        const reportsData = await getAllReports();
        
        // Transformer les données Supabase en format Report
        const transformedReports: Report[] = reportsData.map(report => {
          // Déterminer le type de contenu signalé
          let type: "content" | "user" | "comment" = "content";
          let contentType: "post" | "video" | "story" | undefined = undefined;
          
          if (report.reported_item_type === 'post' || report.reported_item_type === 'video' || report.reported_item_type === 'story') {
            type = "content";
            contentType = report.reported_item_type as "post" | "video" | "story";
          } else if (report.reported_item_type === 'user') {
            type = "user";
          } else if (report.reported_item_type === 'comment') {
            type = "comment";
          }

          return {
            id: report.id,
            type,
            contentType,
            reportedItem: {
              id: report.reported_item_id,
              title: report.description?.substring(0, 50) || "Contenu signalé",
              author: report.reporter ? {
                name: `${report.reporter.first_name} ${report.reporter.last_name}`,
                avatar: report.reporter.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
              } : {
                name: "Utilisateur",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
              },
            },
            reportedBy: report.reporter ? {
              name: `${report.reporter.first_name} ${report.reporter.last_name}`,
              avatar: report.reporter.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=reporter"
            } : {
              name: "Utilisateur",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
            },
            reason: report.reason || "Non spécifié",
            description: report.description || "",
            reportCount: 1, // TODO: Compter les signalements multiples pour le même contenu
            status: report.status as "pending" | "approved" | "rejected",
            createdAt: report.created_at,
          };
        });

        setReports(transformedReports);
      } catch (error) {
        console.error('Erreur lors du chargement des signalements:', error);
        // En cas d'erreur (table n'existe pas), on garde un tableau vide
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);
  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesStatus && matchesType;
  });

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const approvedCount = reports.filter(r => r.status === "approved").length;
  const rejectedCount = reports.filter(r => r.status === "rejected").length;

  const getTypeIcon = (type: string, contentType?: string) => {
    if (type === "user") return <User className="w-4 h-4" />;
    if (type === "comment") return <MessageSquare className="w-4 h-4" />;
    if (contentType === "video") return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      content: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      user: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      comment: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
    return badges[type as keyof typeof badges];
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return badges[status as keyof typeof badges];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Modération</h1>
        <p className="text-gray-400">Gérez les signalements et contenus problématiques</p>
      </div>

      {/* Stats Cards */}
      <StatsCardsCarousel
        cards={[
          {
            id: "pending",
            icon: AlertTriangle,
            gradient: "from-yellow-600/20 to-yellow-800/10",
            border: "border-yellow-500/30",
            bgIcon: "bg-yellow-500/20",
            textIcon: "text-yellow-400",
            label: "En attente",
            value: pendingCount.toString(),
          },
          {
            id: "approved",
            icon: CheckCircle,
            gradient: "from-green-600/20 to-green-800/10",
            border: "border-green-500/30",
            bgIcon: "bg-green-500/20",
            textIcon: "text-green-400",
            label: "Approuvés",
            value: approvedCount.toString(),
          },
          {
            id: "rejected",
            icon: XCircle,
            gradient: "from-red-600/20 to-red-800/10",
            border: "border-red-500/30",
            bgIcon: "bg-red-500/20",
            textIcon: "text-red-400",
            label: "Rejetés",
            value: rejectedCount.toString(),
          },
          {
            id: "total",
            icon: AlertTriangle,
            gradient: "from-violet-600/20 to-violet-800/10",
            border: "border-violet-500/30",
            bgIcon: "bg-violet-500/20",
            textIcon: "text-violet-400",
            label: "Total",
            value: reports.length.toString(),
          },
        ]}
      />

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all" className="bg-gray-900">Tous les types</option>
            <option value="content" className="bg-gray-900">Contenu</option>
            <option value="user" className="bg-gray-900">Utilisateur</option>
            <option value="comment" className="bg-gray-900">Commentaire</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all" className="bg-gray-900">Tous les statuts</option>
            <option value="pending" className="bg-gray-900">En attente</option>
            <option value="approved" className="bg-gray-900">Approuvés</option>
            <option value="rejected" className="bg-gray-900">Rejetés</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          {filteredReports.length} signalement{filteredReports.length > 1 ? "s" : ""} trouvé{filteredReports.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6 hover:border-white/20 transition-all"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Thumbnail/Avatar */}
              {report.reportedItem.thumbnail ? (
                <img
                  src={report.reportedItem.thumbnail}
                  alt="Thumbnail"
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-10 h-10 lg:w-12 lg:h-12 text-violet-400" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadge(report.type)}`}>
                        {getTypeIcon(report.type, report.contentType)}
                        <span className="hidden sm:inline">{report.type === "content" ? "Contenu" : report.type === "user" ? "Utilisateur" : "Commentaire"}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(report.status)}`}>
                        {report.status === "pending" ? "En attente" : report.status === "approved" ? "Approuvé" : "Rejeté"}
                      </span>
                      <span className="px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        {report.reportCount} signalement{report.reportCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    {report.reportedItem.title && (
                      <h3 className="text-lg font-bold text-white mb-1">{report.reportedItem.title}</h3>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <img
                        src={report.reportedItem.author.avatar}
                        alt={report.reportedItem.author.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>Publié par {report.reportedItem.author.name}</span>
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="bg-white/5 rounded-lg p-4 mb-3">
                  <p className="text-sm font-semibold text-white mb-1">Raison : {report.reason}</p>
                  <p className="text-sm text-gray-400">{report.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <img
                      src={report.reportedBy.avatar}
                      alt={report.reportedBy.name}
                      className="w-4 h-4 rounded-full"
                    />
                    <span>Signalé par {report.reportedBy.name}</span>
                    <span>•</span>
                    <span>{new Date(report.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>

                {/* Actions */}
                {report.status === "pending" && (
                  <>
                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 transition-all cursor-pointer">
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 transition-all cursor-pointer">
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 transition-all cursor-pointer">
                        <Ban className="w-4 h-4" />
                        Bannir auteur
                      </button>
                    </div>

                    {/* Mobile Actions */}
                    <div className="lg:hidden relative">
                      <button
                        onClick={() => setExpandedActions(expandedActions === report.id ? null : report.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all w-full justify-between"
                      >
                        <span>Actions</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedActions === report.id ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedActions === report.id && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg p-2 space-y-2 z-10">
                          <button className="w-full flex items-center gap-2 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 transition-all text-sm">
                            <Eye className="w-4 h-4" />
                            Voir détails
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 transition-all text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Approuver
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all text-sm">
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 transition-all text-sm">
                            <Ban className="w-4 h-4" />
                            Bannir auteur
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun signalement trouvé avec ces critères</p>
        </div>
      )}
    </div>
  );
}
