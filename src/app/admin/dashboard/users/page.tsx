"use client";

import { useState, useEffect } from "react";
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
  Users as UsersIcon,
  MapPin,
  Calendar,
  UserPlus
} from "lucide-react";
import AddUserModal from "@/components/admin/AddUserModal";

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
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Charger les utilisateurs depuis Supabase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const { getAllUsers } = await import("@/lib/supabase/users.service");
        const { loadPosts } = await import("@/lib/supabase/posts.service");
        const { loadFollows } = await import("@/lib/supabase/follows.service");
        
        const allUsers = await getAllUsers();
        const allPosts = await loadPosts(1000);
        const allFollows = await loadFollows();

        // Transformer les utilisateurs Supabase en format User
        const transformedUsers: User[] = allUsers.map(user => {
          const userPosts = allPosts.filter(p => p.author_id === user.id);
          const userFollowers = allFollows.filter(f => f.followed_id === user.id).length;

          return {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            type: user.user_type,
            city: user.city || "Non spécifié",
            status: user.verified ? "active" : "active", // Mapper "pending" vers "active" pour correspondre à l'interface
            joinedAt: new Date(user.created_at).toISOString().split('T')[0],
            avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}${user.last_name}`,
            stats: {
              posts: userPosts.length,
              followers: userFollowers
            }
          };
        });

        setUsers(transformedUsers);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleUserAdded = async () => {
    // Recharger la liste des utilisateurs après ajout
    try {
      setLoading(true);
      const { getAllUsers } = await import("@/lib/supabase/users.service");
      const { loadPosts } = await import("@/lib/supabase/posts.service");
      const { loadFollows } = await import("@/lib/supabase/follows.service");
      
      const allUsers = await getAllUsers();
      const allPosts = await loadPosts(1000);
      const allFollows = await loadFollows();

      const transformedUsers: User[] = allUsers.map(user => {
        const userPosts = allPosts.filter(p => p.author_id === user.id);
        const userFollowers = allFollows.filter(f => f.followed_id === user.id).length;

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          type: user.user_type,
          city: user.city || "Non spécifié",
          status: user.verified ? "active" : "active",
          joinedAt: new Date(user.created_at).toISOString().split('T')[0],
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}${user.last_name}`,
          stats: {
            posts: userPosts.length,
            followers: userFollowers
          }
        };
      });

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Erreur lors du rechargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
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

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestion des Utilisateurs</h1>
          <p className="text-gray-400">Gérez tous les utilisateurs de la plateforme</p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 rounded-lg text-white font-medium transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Ajouter un utilisateur</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
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

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
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
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(user.status)}`}>
                  {user.status === "active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                </span>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getUserTypeBadge(user.type)}`}>
                {getUserTypeIcon(user.type)}
                {user.type === "talent" ? "Talent" : user.type === "recruiter" ? "Recruteur" : "Voisin"}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{user.city}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(user.joinedAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="col-span-2 text-sm text-gray-400">
                {user.stats.posts} posts · {user.stats.followers} followers
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 transition-all text-sm">
                <Eye className="w-4 h-4" />
                Voir
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 transition-all text-sm">
                <Edit className="w-4 h-4" />
                Éditer
              </button>
              <button className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all">
                <Ban className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          Aucun utilisateur trouvé avec ces critères
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}
