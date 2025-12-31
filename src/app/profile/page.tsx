"use client";

import { Camera, Edit, MapPin, Mail, Phone, Star, Award, Users, TrendingUp, X, Upload, Image as ImageIcon, Pencil, Plus, Check, Search } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SkillBadge from "@/components/talent/SkillBadge";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { Skill, SkillCategory } from "@/types";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [selectedSkills, setSelectedSkills] = useState<Array<{name: string, category: string}>>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Mock user data - will be replaced with real user data from auth
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    coverImage: string;
    bio: string;
    userType: "talent" | "neighbor" | "recruiter";
    location: {
      city: string;
      country: string;
    };
    verified: boolean;
    rating: number;
    reviewCount: number;
    completedProjects: number;
    skills: Skill[];
    portfolio: Array<{ id: string; title: string; description: string; imageUrl: string }>;
    joinedDate: string;
  }>({
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
      isVisible: true,
    });
  };

  const processFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const newItems: Array<{ id: string; title: string; description: string; imageUrl: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();

      await new Promise((resolve) => {
        reader.onloadend = () => {
          const portfolioItemNumber = user.portfolio.length + newItems.length + 1;
          newItems.push({
            id: `${Date.now()}-${i}`,
            title: `Portfolio item ${portfolioItemNumber}`,
            description: "",
            imageUrl: reader.result as string,
          });
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    if (newItems.length === 0) return;

    setUser({
      ...user,
      portfolio: [...user.portfolio, ...newItems],
    });

    setIsAddingPortfolio(false);
    setToast({
      message: `${newItems.length} image(s) ajoutée(s) avec succès !`,
      type: "success",
      isVisible: true,
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files) {
      await processFiles(files);
    }
  };

  const handleEditItem = (item: { id: string; title: string; description: string }) => {
    setEditingItemId(item.id);
    setEditForm({ title: item.title, description: item.description });
  };

  const handleSaveEdit = () => {
    setUser({
      ...user,
      portfolio: user.portfolio.map((item) =>
        item.id === editingItemId
          ? { ...item, title: editForm.title, description: editForm.description }
          : item
      ),
    });
    setEditingItemId(null);
      setToast({
        message: "Portfolio mis à jour avec succès !",
        type: "success",
        isVisible: true,
      });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser({
        ...user,
        avatar: reader.result as string,
      });
      setToast({
        message: "Photo de profil mise à jour !",
        type: "success",
        isVisible: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser({
        ...user,
        coverImage: reader.result as string,
      });
      setToast({
        message: "Photo de couverture mise à jour !",
        type: "success",
        isVisible: true,
      });
    };
    reader.readAsDataURL(file);
  };

  // Compétences prédéfinies par catégorie
  const predefinedSkills = {
    cuisine: ["Pâtisserie", "Cuisine africaine", "Street food", "Traiteur", "Boulangerie"],
    tech: ["Développement Web", "Design UI/UX", "Réparation téléphones", "Maintenance PC", "Photoshop"],
    artisanat: ["Bijoux", "Sculpture", "Poterie", "Décoration", "Vannerie"],
    bricolage: ["Plomberie", "Électricité", "Menuiserie", "Peinture", "Maçonnerie"],
    mecanique: ["Réparation auto", "Mécanique moto", "Soudure", "Carrosserie", "Climatisation"],
    photographie: ["Photo événementiel", "Portrait", "Retouche photo", "Vidéographie", "Drone"],
    couture: ["Couture sur mesure", "Retouche vêtements", "Mode africaine", "Broderie", "Tapisserie"],
    coiffure: ["Coiffure afro", "Barbier", "Tresses", "Mèches", "Maquillage"],
    education: ["Cours particuliers", "Langues", "Musique", "Sport", "Informatique"],
  };

  const toggleSkill = (skillName: string, category: string) => {
    const exists = selectedSkills.find(s => s.name === skillName);
    if (exists) {
      setSelectedSkills(selectedSkills.filter(s => s.name !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, { name: skillName, category }]);
    }
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;

    const exists = selectedSkills.find(s => s.name.toLowerCase() === customSkill.toLowerCase());
    if (!exists) {
      setSelectedSkills([...selectedSkills, { name: customSkill, category: "autre" }]);
      setCustomSkill("");
    }
  };

  const handleSaveSkills = () => {
    if (selectedSkills.length === 0) return;

    const newSkills: Skill[] = selectedSkills.map((skill, index) => ({
      id: `${Date.now()}-${index}`,
      name: skill.name,
      category: skill.category as SkillCategory,
      level: "intermediate" as const,
      verified: false,
    }));

    setUser({
      ...user,
      skills: [...user.skills, ...newSkills],
    });

    setSelectedSkills([]);
    setCustomSkill("");
    setSearchQuery("");
    setIsAddingSkill(false);
    setToast({
      message: `${newSkills.length} compétence(s) ajoutée(s) avec succès !`,
      type: "success",
      isVisible: true,
    });
  };

  // Filtrer les compétences selon la recherche
  const getFilteredSkills = (): typeof predefinedSkills => {
    if (!searchQuery.trim()) return predefinedSkills;

    const query = searchQuery.toLowerCase();
    const filtered: typeof predefinedSkills = {} as typeof predefinedSkills;

    Object.entries(predefinedSkills).forEach(([category, skills]) => {
      const matchingSkills = skills.filter(skill =>
        skill.toLowerCase().includes(query)
      );
      if (matchingSkills.length > 0) {
        (filtered as any)[category] = matchingSkills;
      }
    });

    return filtered;
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
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        >
          <Camera className="w-5 h-5" />
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
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
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-violet-500 hover:bg-violet-600 text-white p-2 rounded-full transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
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

              {/* Bio */}
              <p className="text-white/80 text-base mb-6 leading-relaxed">{user.bio}</p>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/30 transition-colors">
                      <Mail className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/50 mb-0.5">Email</p>
                      <p className="text-sm text-white/90 truncate font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/30 transition-colors">
                      <Phone className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/50 mb-0.5">Téléphone</p>
                      <p className="text-sm text-white/90 truncate font-medium">{user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

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
              <Button variant="ghost" size="sm" onClick={() => setIsAddingSkill(true)}>
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
                <Button variant="primary" onClick={() => setIsAddingSkill(true)}>
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
                    className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay avec bouton edit */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="bg-violet-500 hover:bg-violet-600 text-white p-3 rounded-full transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Info en bas */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-white/60 truncate">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {/* Bouton pour ajouter plus de photos */}
                <button
                  onClick={() => setIsAddingPortfolio(true)}
                  className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-violet-500/50 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-violet-500" />
                  </div>
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                    Ajouter plus
                  </p>
                </button>
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

      {/* Add Portfolio Modal - Multi Upload */}
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

              <div className="space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${
                    isDragging
                      ? "border-violet-500 bg-violet-500/10 scale-105"
                      : "border-white/20 hover:border-violet-500/50"
                  }`}
                >
                  <Upload className={`w-16 h-16 text-violet-500 mx-auto mb-4 transition-transform ${
                    isDragging ? "scale-125" : "group-hover:scale-110"
                  }`} />
                  <h3 className="text-xl font-semibold mb-2">
                    {isDragging ? "Déposez vos images ici" : "Sélectionnez vos images"}
                  </h3>
                  <p className="text-white/60 mb-4">
                    {isDragging
                      ? "Relâchez pour ajouter les images"
                      : "Cliquez ou glissez-déposez plusieurs images"}
                  </p>
                  <p className="text-sm text-white/40">
                    PNG, JPG ou WEBP • Max 5MB par image
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-white/80 mb-2">
                        <strong>Astuce :</strong> Les images seront ajoutées avec des titres automatiques.
                      </p>
                      <p className="text-white/60">
                        Vous pourrez éditer le titre et la description de chaque image après l&apos;upload.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsAddingPortfolio(false)}
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Portfolio Item Modal */}
      <AnimatePresence>
        {editingItemId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setEditingItemId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Modifier le portfolio</h2>
                <button
                  onClick={() => setEditingItemId(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre du projet</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Ex: Création site e-commerce"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    placeholder="Décrivez votre projet..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingItemId(null)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleSaveEdit} className="flex-1">
                    Enregistrer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {isAddingSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsAddingSkill(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Ajouter des compétences</h2>
                  {selectedSkills.length > 0 && (
                    <p className="text-sm text-violet-400 mt-1">
                      {selectedSkills.length} compétence(s) sélectionnée(s)
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsAddingSkill(false);
                    setSelectedSkills([]);
                    setCustomSkill("");
                    setSearchQuery("");
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une compétence..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                </div>

                {/* Compétences prédéfinies par catégorie */}
                <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2">
                  {/* Compétences personnalisées ajoutées manuellement */}
                  {selectedSkills.filter(s => s.category === "autre").length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white/70 mb-2">
                        Compétences personnalisées
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills
                          .filter(s => s.category === "autre")
                          .map((skill) => (
                            <button
                              key={skill.name}
                              type="button"
                              onClick={() => toggleSkill(skill.name, skill.category)}
                              className="px-4 py-2 rounded-full text-sm font-medium transition-all bg-violet-500 text-white cursor-pointer"
                            >
                              <Check className="w-4 h-4 inline mr-1" />
                              {skill.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Compétences prédéfinies */}
                  {Object.entries(getFilteredSkills()).length > 0 ? (
                    Object.entries(getFilteredSkills()).map(([category, skills]) => {
                      const skillsArray = skills as string[];
                      return (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-white/70 mb-2 capitalize">
                        {category === "tech" ? "Technologie" : category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skillsArray.map((skillName) => {
                          const isSelected = selectedSkills.some(s => s.name === skillName);
                          return (
                            <button
                              key={skillName}
                              type="button"
                              onClick={() => toggleSkill(skillName, category)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-violet-500 text-white"
                                  : "bg-white/5 text-white/80 hover:bg-white/10 border border-white/10"
                              }`}
                            >
                              {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                              {skillName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    );
                    })
                  ) : (
                    searchQuery && (
                      <div className="text-center py-8 text-white/60">
                        <p>Aucune compétence trouvée pour "{searchQuery}"</p>
                        <p className="text-sm mt-2">Essayez une autre recherche ou ajoutez-la manuellement ci-dessous</p>
                      </div>
                    )
                  )}
                </div>

                {/* Input personnalisé */}
                <div className="border-t border-white/10 pt-4">
                  <label className="block text-sm font-medium mb-2">Autre compétence ?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSkill();
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="Ex: Menuiserie d'art..."
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-4 py-3 bg-violet-500 hover:bg-violet-600 rounded-xl transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingSkill(false);
                      setSelectedSkills([]);
                      setCustomSkill("");
                      setSearchQuery("");
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveSkills}
                    disabled={selectedSkills.length === 0}
                    className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ajouter ({selectedSkills.length})
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
