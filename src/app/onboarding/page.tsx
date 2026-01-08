"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Camera,
  Upload,
  Home,
  Compass,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  X,
  Image as ImageIcon,
  User as UserIcon,
  Briefcase,
  TrendingUp,
  Plus,
  Check,
  Search,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { getCurrentUser, updateUser, getRedirectPath } from "@/lib/supabase/users.service";
import { isLoggedIn } from "@/lib/supabase/auth.service";
import type { User } from "@/lib/supabase/users.service";

type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const isTalent = currentUser?.user_type === "talent";
  
  // Détecter si l'utilisateur vient de OAuth (pas de phone/country/city)
  const isOAuthUser = currentUser && (!currentUser.phone || !currentUser.country || !currentUser.city);

  // Form data
  const [formData, setFormData] = useState({
    avatar: "",
    bio: "",
    selectedSkills: [] as Array<{name: string, category: string}>,
    portfolioItems: [] as string[],
  });

  const [customSkill, setCustomSkill] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Check auth and load user on client-side only
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === "undefined") return;

      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        router.push("/login");
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.has_completed_onboarding) {
        const redirectPath = getRedirectPath(user);
        router.push(redirectPath);
        return;
      }

      setCurrentUser(user);
      setFormData({
        avatar: user.avatar || "",
        bio: user.bio || "",
        selectedSkills: [], // Will be loaded from skills table if needed
        portfolioItems: [],
      });
      
      // Si utilisateur OAuth avec type par défaut "talent", commencer à l'étape 0 pour choisir le type
      const isOAuth = !user.phone || !user.country || !user.city;
      if (isOAuth && user.user_type === "talent") {
        setCurrentStep(0);
      }
      
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  // Calculer le nombre total d'étapes (inclut l'étape 0 pour OAuth si nécessaire)
  const hasUserTypeStep = isOAuthUser && currentUser?.user_type === "talent";
  const baseSteps = isTalent ? 6 : 4;
  const totalSteps = hasUserTypeStep ? baseSteps + 1 : baseSteps;
  const progress = currentStep === 0 ? 0 : ((currentStep / baseSteps) * 100);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handlePortfolioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: string[] = [];
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onloadend = () => {
          newItems.push(reader.result as string);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    setFormData({ ...formData, portfolioItems: [...formData.portfolioItems, ...newItems] });
  };

  const handleSkip = async () => {
    // Mark onboarding as completed and redirect
    if (currentUser) {
      await updateUser(currentUser.id, { has_completed_onboarding: true });
    }
    if (currentUser) {
      const redirectPath = getRedirectPath(currentUser);
      router.push(redirectPath);
    }
  };

  const handleNext = async () => {
    // Si on est à l'étape 0 (choix du type), sauvegarder le choix avant de continuer
    if (currentStep === 0 && currentUser) {
      // Le type sera mis à jour dans handleUserTypeSelect
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };
  
  // Handler pour choisir le type d'utilisateur (étape 0)
  const handleUserTypeSelect = async (userType: "talent" | "neighbor" | "recruiter") => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Mettre à jour le type d'utilisateur
      await updateUser(currentUser.id, { user_type: userType });
      
      // Recharger l'utilisateur pour avoir les nouvelles données
      const updatedUser = await getCurrentUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
        // Passer à l'étape 1
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du type d'utilisateur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    // Update user with onboarding data
    if (currentUser) {
      await updateUser(currentUser.id, {
        avatar: formData.avatar || currentUser.avatar,
        bio: formData.bio || currentUser.bio,
        has_completed_onboarding: true,
      });
      
      // TODO: Save skills and portfolio items to Supabase tables
      // For now, we'll just mark onboarding as complete
    }

    if (currentUser) {
      const redirectPath = getRedirectPath(currentUser);
      router.push(redirectPath);
    }
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
    const exists = formData.selectedSkills.find(s => s.name === skillName);
    if (exists) {
      setFormData({
        ...formData,
        selectedSkills: formData.selectedSkills.filter(s => s.name !== skillName)
      });
    } else {
      setFormData({
        ...formData,
        selectedSkills: [...formData.selectedSkills, { name: skillName, category }]
      });
    }
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;

    const exists = formData.selectedSkills.find(s => s.name.toLowerCase() === customSkill.toLowerCase());
    if (!exists) {
      setFormData({
        ...formData,
        selectedSkills: [...formData.selectedSkills, { name: customSkill, category: "autre" }]
      });
      setCustomSkill("");
    }
  };

  const getFilteredSkills = () => {
    if (!searchQuery.trim()) return predefinedSkills;

    const query = searchQuery.toLowerCase();
    const filtered: any = {};

    Object.entries(predefinedSkills).forEach(([category, skills]) => {
      const matchingSkills = skills.filter(skill =>
        skill.toLowerCase().includes(query)
      );
      if (matchingSkills.length > 0) {
        filtered[category] = matchingSkills;
      }
    });

    return filtered;
  };

  const canProceedStep2 = formData.avatar && formData.bio.length >= 20;
  const canProceedStep3 = isTalent ? formData.selectedSkills.length >= 1 : true; // Talents need at least 1 skill
  const canProceedStep4 = formData.portfolioItems.length >= 2;

  // Show loading state while checking auth
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950/20 to-black text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
      >
        <span className="text-sm font-medium">Passer</span>
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* Step 0: Choose User Type (OAuth users only) */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl w-full"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center"
                  >
                    <UserIcon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-3">Choisis ton profil</h2>
                  <p className="text-white/60">
                    Pour mieux personnaliser ton expérience, dis-nous qui tu es
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => handleUserTypeSelect("talent")}
                    className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500 rounded-xl transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                        <TrendingUp className="w-6 h-6 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">Talent</h3>
                        <p className="text-white/60 text-sm">
                          Je veux montrer mes compétences et trouver des opportunités
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </button>

                  <button
                    onClick={() => handleUserTypeSelect("neighbor")}
                    className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500 rounded-xl transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                        <Home className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">Voisin</h3>
                        <p className="text-white/60 text-sm">
                          Je cherche des services de proximité près de chez moi
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </button>

                  <button
                    onClick={() => handleUserTypeSelect("recruiter")}
                    className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500 rounded-xl transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                        <Briefcase className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">Recruteur</h3>
                        <p className="text-white/60 text-sm">
                          Je cherche des talents à recruter pour mes projets
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-green-400 transition-colors" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"
              >
                Bienvenue sur Kily !
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/80 mb-12 leading-relaxed"
              >
                {isOAuthUser
                  ? `Bienvenue ${currentUser.first_name || 'sur Kily'} ! Ton compte a été créé avec Google. Complétons ton profil pour commencer.`
                  : isTalent
                  ? "Tu es sur le point de rejoindre une communauté qui valorise les compétences réelles. Montrons au monde ce dont tu es capable !"
                  : "Découvre des talents incroyables près de chez toi. Prêt à explorer ?"}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button variant="primary" size="lg" onClick={handleNext} className="px-12">
                  Commencer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Complete Profile */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl w-full"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Complète ton profil</h2>
                    <p className="text-white/60">Ajoute une photo et parle de toi</p>
                  </div>
                </div>

                {/* Avatar upload */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-3">Photo de profil</label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-4 border-violet-500"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-violet-500 hover:bg-violet-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/80 mb-1">Choisis une belle photo !</p>
                      <p className="text-xs text-white/50">PNG, JPG ou WEBP • Max 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-3">
                    Parle de toi {formData.bio.length >= 20 && "✓"}
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={
                      isTalent
                        ? "Ex: Développeur web passionné, je crée des sites modernes et performants depuis 5 ans..."
                        : "Ex: Passionné par la découverte de nouveaux talents..."
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                  <p className="text-xs text-white/50 mt-2">
                    {formData.bio.length}/500 caractères (minimum 20)
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!canProceedStep2}
                    className="flex-1"
                  >
                    Suivant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Skills Selection (Talents only) */}
          {currentStep === 3 && isTalent && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl w-full flex flex-col h-[calc(100vh-120px)]"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Tes compétences</h2>
                    <p className="text-white/60">Sélectionne au moins 1 compétence</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  {/* Barre de recherche */}
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher une compétence..."
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
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

                  {/* Compétences sélectionnées */}
                  {formData.selectedSkills.length > 0 && (
                    <div className="mb-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                      <p className="text-sm text-violet-400 mb-3">
                        {formData.selectedSkills.length} compétence(s) sélectionnée(s)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedSkills.map((skill) => (
                          <button
                            key={skill.name}
                            onClick={() => toggleSkill(skill.name, skill.category)}
                            className="px-3 py-1.5 bg-violet-500 text-white rounded-full text-sm font-medium flex items-center gap-1 hover:bg-violet-600 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            {skill.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compétences prédéfinies */}
                  <div className="space-y-4 mb-6">
                    {Object.entries(getFilteredSkills()).length > 0 ? (
                      Object.entries(getFilteredSkills()).map(([category, skills]) => (
                        <div key={category}>
                          <h3 className="text-sm font-semibold text-white/70 mb-2 capitalize">
                            {category === "tech" ? "Technologie" : category}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {(skills as string[]).map((skillName) => {
                              const isSelected = formData.selectedSkills.some(s => s.name === skillName);
                              return (
                                <button
                                  key={skillName}
                                  onClick={() => toggleSkill(skillName, category)}
                                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                      ))
                    ) : (
                      searchQuery && (
                        <div className="text-center py-8 text-white/60">
                          <p>Aucune compétence trouvée pour "{searchQuery}"</p>
                          <p className="text-sm mt-2">Ajoutez-la manuellement ci-dessous</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Input personnalisé */}
                  <div className="border-t border-white/10 pt-4 mb-6">
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
                        onClick={addCustomSkill}
                        className="px-4 py-3 bg-violet-500 hover:bg-violet-600 rounded-xl transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation - Fixée en bas */}
                <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!canProceedStep3}
                    className="flex-1"
                  >
                    Suivant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Add Portfolio (Talents only) */}
          {currentStep === 4 && isTalent && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl w-full"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Ajoute tes réalisations</h2>
                    <p className="text-white/60">Montre ce dont tu es capable (min. 2 photos)</p>
                  </div>
                </div>

                {/* Portfolio grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {formData.portfolioItems.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-violet-500"
                    >
                      <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {formData.portfolioItems.length < 3 && (
                    <button
                      onClick={() => portfolioInputRef.current?.click()}
                      className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-violet-500/50 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-violet-400" />
                      <span className="text-xs text-white/60">Ajouter</span>
                    </button>
                  )}
                </div>

                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioChange}
                  className="hidden"
                />

                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-8">
                  <p className="text-sm text-white/80">
                    💡 <strong>Astuce :</strong> Choisis tes meilleures réalisations pour attirer les
                    recruteurs !
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!canProceedStep4}
                    className="flex-1"
                  >
                    Suivant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 for non-Talents / Step 5 for Talents: App Tour */}
          {((currentStep === 3 && !isTalent) || (currentStep === 5 && isTalent)) && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-3xl w-full"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4">Découvre l'application</h2>
                  <p className="text-white/60 text-lg">
                    Voici les principales fonctionnalités pour t'aider à démarrer
                  </p>
                </div>

                {/* Features grid */}
                <div className="grid sm:grid-cols-3 gap-6 mb-12">
                  <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <Home className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Feed</h3>
                    <p className="text-sm text-white/70">
                      Découvre les dernières publications des talents
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Compass className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Discover</h3>
                    <p className="text-sm text-white/70">
                      Explore les talents par catégorie et ville
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Messages</h3>
                    <p className="text-sm text-white/70">
                      Contacte directement les {isTalent ? "recruteurs" : "talents"}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Retour
                  </Button>
                  <Button variant="primary" onClick={handleNext} className="flex-1">
                    Suivant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Final Step: Ready! */}
          {((currentStep === 4 && !isTalent) || (currentStep === 6 && isTalent)) && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl font-bold mb-6"
              >
                Tout est prêt !
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/80 mb-12 leading-relaxed"
              >
                {isTalent
                  ? "Ton profil est configuré ! Tu peux maintenant commencer à partager tes talents avec le monde."
                  : "Ton profil est prêt ! Commence à explorer les talents incroyables de ta région."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-12"
                >
                  {loading ? "Chargement..." : "Découvrir Kily"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step indicator dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i + 1 === currentStep
                ? "bg-violet-500 w-8"
                : i + 1 < currentStep
                ? "bg-violet-500/50"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
