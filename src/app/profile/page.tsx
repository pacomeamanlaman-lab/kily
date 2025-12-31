"use client";

import { Camera, Edit, MapPin, Mail, Phone, Star, Award, Users, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SkillBadge from "@/components/talent/SkillBadge";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Mock user data - will be replaced with real user data from auth
  const [user, setUser] = useState({
    id: "current-user",
    name: "Utilisateur",
    email: "user@example.com",
    phone: "+225 07 00 00 00 00",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
    bio: "Complétez votre profil pour montrer vos talents au monde !",
    userType: "talent" as const,
    location: {
      city: "Abidjan",
      country: "Côte d'Ivoire",
    },
    verified: false,
    rating: 0,
    reviewCount: 0,
    completedProjects: 0,
    skills: [],
    portfolio: [],
    joinedDate: new Date().toISOString(),
  });

  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    email: user.email,
    phone: user.phone,
    city: user.location.city,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    setUser({
      ...user,
      name: formData.name,
      bio: formData.bio,
      email: formData.email,
      phone: formData.phone,
      location: {
        ...user.location,
        city: formData.city,
      },
    });

    setIsEditing(false);
    setToast({
      message: "Profil mis à jour avec succès !",
      type: "success",
      visible: true,
    });
  };

  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem = {
      id: Date.now().toString(),
      title: portfolioForm.title,
      description: portfolioForm.description,
      imageUrl: portfolioForm.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    };

    setUser({
      ...user,
      portfolio: [...user.portfolio, newItem],
    });

    setPortfolioForm({ title: "", description: "", imageUrl: "" });
    setIsAddingPortfolio(false);
    setToast({
      message: "Portfolio mis à jour avec succès !",
      type: "success",
      visible: true,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-violet-600 to-violet-900">
        <img
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover opacity-30"
        />
        <button className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-2 rounded-full transition-colors">
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-black bg-white/5"
              />
              <button className="absolute bottom-0 right-0 bg-violet-500 hover:bg-violet-600 text-white p-2 rounded-full transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 pt-16 sm:pt-20">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <Badge variant={user.userType === "talent" ? "primary" : "secondary"}>
                      {user.userType === "talent" ? "Talent" : user.userType === "neighbor" ? "Voisin" : "Recruteur"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location.city}, {user.location.country}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="self-start sm:self-auto"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier le profil
                </Button>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-white/70 mb-6">{user.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-2xl font-bold">{user.rating || "—"}</span>
                  </div>
                  <p className="text-xs text-white/60">Note moyenne</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-violet-500" />
                    <span className="text-2xl font-bold">{user.completedProjects}</span>
                  </div>
                  <p className="text-xs text-white/60">Projets</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-2xl font-bold">{user.reviewCount}</span>
                  </div>
                  <p className="text-xs text-white/60">Avis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        {user.userType === "talent" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Compétences</h2>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
            {user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.skills.map((skill) => (
                  <SkillBadge key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <TrendingUp className="w-12 h-12 text-violet-500 mx-auto mb-4 opacity-50" />
                <p className="text-white/60 mb-4">
                  Ajoutez vos compétences pour attirer plus d&apos;opportunités
                </p>
                <Button variant="primary">
                  Ajouter des compétences
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Section */}
        {user.userType === "talent" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Portfolio</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingPortfolio(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
            {user.portfolio.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Camera className="w-12 h-12 text-violet-500 mx-auto mb-4 opacity-50" />
                <p className="text-white/60 mb-4">
                  Montrez vos réalisations en ajoutant des photos à votre portfolio
                </p>
                <Button variant="primary" onClick={() => setIsAddingPortfolio(true)}>
                  Ajouter des photos
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Account Settings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Paramètres du compte</h2>
          <div className="space-y-4">
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Notifications</h3>
                  <p className="text-sm text-white/60">
                    Gérer vos préférences de notification
                  </p>
                </div>
                <Edit className="w-5 h-5 text-white/40" />
              </div>
            </button>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Confidentialité</h3>
                  <p className="text-sm text-white/60">
                    Contrôlez qui peut voir votre profil
                  </p>
                </div>
                <Edit className="w-5 h-5 text-white/40" />
              </div>
            </button>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Sécurité</h3>
                  <p className="text-sm text-white/60">
                    Mot de passe et authentification
                  </p>
                </div>
                <Edit className="w-5 h-5 text-white/40" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Modifier le profil</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    placeholder="Parlez de vous et de vos compétences..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Portfolio Modal */}
      <AnimatePresence>
        {isAddingPortfolio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsAddingPortfolio(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Ajouter au portfolio</h2>
                <button
                  onClick={() => setIsAddingPortfolio(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPortfolio} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre du projet</label>
                  <input
                    type="text"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Ex: Création site e-commerce"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    placeholder="Décrivez votre projet..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL de l'image</label>
                  <input
                    type="url"
                    value={portfolioForm.imageUrl}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="https://exemple.com/image.jpg (optionnel)"
                  />
                  <p className="text-xs text-white/40 mt-2">
                    Laissez vide pour une image par défaut
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingPortfolio(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Ajouter
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}
