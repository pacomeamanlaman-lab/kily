"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  Users as UsersIcon
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  type: "talent" | "recruiter" | "neighbor";
  city: string;
  status: "active" | "banned" | "suspended";
  joinedAt: string;
  avatar: string;
  stats: {
    posts: number;
    followers: number;
  };
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock data
  const mockUsers: User[] = [
    {
      id: "1",
      name: "Amina Koné",
      email: "amina.kone@example.com",
      type: "talent",
      city: "Abidjan",
      status: "active",
      joinedAt: "2024-01-15",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      stats: { posts: 45, followers: 234 }
    },
    {
      id: "2",
      name: "Kofi Mensah",
      email: "kofi.mensah@example.com",
      type: "talent",
      city: "Accra",
      status: "active",
      joinedAt: "2024-02-20",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      stats: { posts: 32, followers: 189 }
    },
    {
      id: "3",
      name: "Sarah Dubois",
      email: "sarah.dubois@company.com",
      type: "recruiter",
      city: "Dakar",
      status: "active",
      joinedAt: "2024-03-10",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      stats: { posts: 12, followers: 45 }
    },
    {
      id: "4",
      name: "Ibrahim Diallo",
      email: "ibrahim.diallo@example.com",
      type: "talent",
      city: "Dakar",
      status: "banned",
      joinedAt: "2023-12-05",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
      stats: { posts: 8, followers: 23 }
    },
    {
      id: "5",
      name: "Fatou Sow",
      email: "fatou.sow@example.com",
      type: "neighbor",
      city: "Lagos",
      status: "active",
      joinedAt: "2024-04-01",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      stats: { posts: 5, followers: 12 }
    },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || user.type === filterType;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "talent":
        return <User className="w-4 h-4" />;
      case "recruiter":
        return <Briefcase className="w-4 h-4" />;
      case "neighbor":
        return <UsersIcon className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getUserTypeBadge = (type: string) => {
    const badges = {
      talent: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      recruiter: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      neighbor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return badges[type as keyof typeof badges];
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      banned: "bg-red-500/20 text-red-400 border-red-500/30",
      suspended: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return badges[status as keyof typeof badges];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gestion des Utilisateurs</h1>
        <p className="text-gray-400">Gérez tous les utilisateurs de la plateforme</p>
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
                placeholder="Rechercher par nom, email, ville..."
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
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all" className="bg-gray-900">Tous les types</option>
            <option value="talent" className="bg-gray-900">Talents</option>
            <option value="recruiter" className="bg-gray-900">Recruteurs</option>
            <option value="neighbor" className="bg-gray-900">Voisins</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all" className="bg-gray-900">Tous les statuts</option>
            <option value="active" className="bg-gray-900">Actifs</option>
            <option value="banned" className="bg-gray-900">Bannis</option>
            <option value="suspended" className="bg-gray-900">Suspendus</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-400">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Utilisateur</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ville</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Statut</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Stats</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Inscrit le</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                {/* User */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getUserTypeBadge(user.type)}`}>
                    {getUserTypeIcon(user.type)}
                    {user.type === "talent" ? "Talent" : user.type === "recruiter" ? "Recruteur" : "Voisin"}
                  </span>
                </td>

                {/* City */}
                <td className="px-6 py-4 text-white">{user.city}</td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(user.status)}`}>
                    {user.status === "active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {user.status === "active" ? "Actif" : user.status === "banned" ? "Banni" : "Suspendu"}
                  </span>
                </td>

                {/* Stats */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-400">
                    {user.stats.posts} posts · {user.stats.followers} followers
                  </div>
                </td>

                {/* Joined Date */}
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(user.joinedAt).toLocaleDateString("fr-FR")}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-violet-500/10 rounded-lg transition-colors cursor-pointer" title="Voir profil">
                      <Eye className="w-4 h-4 text-violet-400" />
                    </button>
                    <button className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer" title="Éditer">
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Bannir">
                      <Ban className="w-4 h-4 text-red-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-500/10 rounded-lg transition-colors cursor-pointer" title="Supprimer">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            Aucun utilisateur trouvé avec ces critères
          </div>
        )}
      </div>
    </div>
  );
}
