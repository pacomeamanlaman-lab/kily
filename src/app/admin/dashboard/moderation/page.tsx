"use client";

import { useState } from "react";
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
  User
} from "lucide-react";

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

  // Mock data
  const mockReports: Report[] = [
    {
      id: "1",
      type: "content",
      contentType: "post",
      reportedItem: {
        id: "p1",
        title: "Arnaque - Ne pas faire confiance",
        author: {
          name: "Ibrahim Diallo",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"
        },
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300"
      },
      reportedBy: {
        name: "Amina Koné",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
      },
      reason: "Spam ou arnaque",
      description: "Ce post contient des informations trompeuses et tente d'arnaquer les utilisateurs",
      reportCount: 5,
      status: "pending",
      createdAt: "2024-06-25T10:30:00"
    },
    {
      id: "2",
      type: "content",
      contentType: "video",
      reportedItem: {
        id: "v1",
        title: "Contenu inapproprié",
        author: {
          name: "User Suspect",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
        },
        thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=300"
      },
      reportedBy: {
        name: "Sarah Mensah",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
      },
      reason: "Contenu inapproprié",
      description: "Vidéo contenant du contenu violent ou choquant",
      reportCount: 3,
      status: "pending",
      createdAt: "2024-06-24T15:20:00"
    },
    {
      id: "3",
      type: "user",
      reportedItem: {
        id: "u1",
        author: {
          name: "Fake Account",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
        }
      },
      reportedBy: {
        name: "Kofi Mensah",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
      },
      reason: "Usurpation d'identité",
      description: "Ce compte se fait passer pour une autre personne",
      reportCount: 2,
      status: "pending",
      createdAt: "2024-06-23T09:15:00"
    },
    {
      id: "4",
      type: "comment",
      reportedItem: {
        id: "c1",
        title: "Commentaire haineux sous post de Amina",
        author: {
          name: "User Toxique",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
        }
      },
      reportedBy: {
        name: "Fatou Sow",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
      },
      reason: "Harcèlement",
      description: "Commentaire insultant et haineux",
      reportCount: 7,
      status: "approved",
      createdAt: "2024-06-20T14:00:00"
    }
  ];

  const filteredReports = mockReports.filter((report) => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesStatus && matchesType;
  });

  const pendingCount = mockReports.filter(r => r.status === "pending").length;
  const approvedCount = mockReports.filter(r => r.status === "approved").length;
  const rejectedCount = mockReports.filter(r => r.status === "rejected").length;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-xs text-gray-400">En attente</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{approvedCount}</p>
              <p className="text-xs text-gray-400">Approuvés</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-red-800/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{rejectedCount}</p>
              <p className="text-xs text-gray-400">Rejetés</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-600/20 to-violet-800/10 border border-violet-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{mockReports.length}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </div>

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
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex gap-4">
              {/* Thumbnail/Avatar */}
              {report.reportedItem.thumbnail ? (
                <img
                  src={report.reportedItem.thumbnail}
                  alt="Thumbnail"
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-12 h-12 text-violet-400" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadge(report.type)}`}>
                        {getTypeIcon(report.type, report.contentType)}
                        {report.type === "content" ? "Contenu" : report.type === "user" ? "Utilisateur" : "Commentaire"}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(report.status)}`}>
                        {report.status === "pending" ? "En attente" : report.status === "approved" ? "Approuvé" : "Rejeté"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
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
                  <div className="flex items-center gap-2">
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
