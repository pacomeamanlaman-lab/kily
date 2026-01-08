"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Mail, User, MapPin, Briefcase, Users, Phone, Globe, CheckCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  type: "talent" | "recruiter" | "neighbor";
  city: string;
  status: "active" | "banned" | "suspended";
  joinedAt: string;
  avatar: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
  readOnly?: boolean;
  onEdit?: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUserUpdated, readOnly = false, onEdit }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    commune: "",
    bio: "",
    userType: "talent" as "talent" | "recruiter" | "neighbor",
    verified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Charger les données de l'utilisateur quand le modal s'ouvre
  useEffect(() => {
    if (user && isOpen) {
      // Charger les données complètes de l'utilisateur depuis Supabase
      const loadUserData = async () => {
        try {
          const { supabase } = await import("@/lib/supabase");
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (fetchError) throw fetchError;

          if (userData) {
            setFormData({
              firstName: userData.first_name || "",
              lastName: userData.last_name || "",
              email: userData.email || "",
              phone: userData.phone || "",
              country: userData.country || "",
              city: userData.city || "",
              commune: userData.commune || "",
              bio: userData.bio || "",
              userType: userData.user_type || "talent",
              verified: userData.verified || false,
            });
          }
        } catch (err: any) {
          console.error('Erreur lors du chargement des données:', err);
          setError("Erreur lors du chargement des données de l'utilisateur");
        }
      };

      loadUserData();
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      const { data: { session } } = await (await import("@/lib/supabase")).supabase.auth.getSession();
      if (!session) {
        setError("Vous devez être connecté");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/update-user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          updates: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone || null,
            country: formData.country || null,
            city: formData.city || null,
            commune: formData.commune || null,
            bio: formData.bio || null,
            user_type: formData.userType,
            verified: formData.verified,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erreur lors de la mise à jour de l'utilisateur");
        setLoading(false);
        return;
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onUserUpdated();
          handleClose();
        }, 1500);
      } else {
        setError(result.error || "Erreur lors de la mise à jour de l'utilisateur");
        setLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Exception lors de la mise à jour:', err);
      setError(err.message || "Une erreur est survenue");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      commune: "",
      bio: "",
      userType: "talent",
      verified: false,
    });
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                {readOnly ? (
                  <User className="w-5 h-5 text-violet-400" />
                ) : (
                  <Edit className="w-5 h-5 text-violet-400" />
                )}
              </div>
              <h2 className="text-xl font-bold text-white">
                {readOnly ? "Voir le profil" : "Éditer l'utilisateur"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="px-6 overflow-y-auto flex-1">
            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm"
              >
                ✅ Utilisateur mis à jour avec succès !
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form id="edit-user-form" onSubmit={readOnly ? (e) => { e.preventDefault(); } : handleSubmit} className="space-y-4 pb-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Prénom *
                </label>
                <input
                  type="text"
                  required={!readOnly}
                  disabled={readOnly}
                  readOnly={readOnly}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    readOnly ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom *
                </label>
                <input
                  type="text"
                  required={!readOnly}
                  disabled={readOnly}
                  readOnly={readOnly}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    readOnly ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Nom"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                required={!readOnly}
                disabled={readOnly}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  readOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="exemple@email.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone
              </label>
              <input
                type="tel"
                disabled={readOnly}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  readOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="+225 XX XX XX XX XX"
              />
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Pays
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    readOnly ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Ex: Côte d'Ivoire"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Ville
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    readOnly ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Ex: Abidjan"
                />
              </div>
            </div>

            {/* Commune */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Commune
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  readOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Ex: Cocody"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                disabled={readOnly}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none ${
                  readOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Description de l'utilisateur..."
              />
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Type d'utilisateur *
              </label>
              <select
                disabled={readOnly}
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as any })}
                className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <option value="talent" className="bg-gray-900">Talent</option>
                <option value="recruiter" className="bg-gray-900">Recruteur</option>
                <option value="neighbor" className="bg-gray-900">Voisin</option>
              </select>
            </div>

            {/* Verified */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <input
                type="checkbox"
                id="verified"
                disabled={readOnly}
                checked={formData.verified}
                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                className={`w-4 h-4 text-violet-500 bg-white/5 border-white/20 rounded focus:ring-violet-500 ${
                  readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              />
              <label htmlFor="verified" className={`text-sm text-gray-300 flex items-center gap-2 ${
                readOnly ? '' : 'cursor-pointer'
              }`}>
                <CheckCircle className="w-4 h-4 text-violet-400" />
                Compte vérifié
              </label>
            </div>

            </form>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="p-6 pt-4 border-t border-white/10 bg-gray-900 rounded-b-2xl">
            <div className="flex gap-3">
              {readOnly ? (
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                >
                  Fermer
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    form="edit-user-form"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

