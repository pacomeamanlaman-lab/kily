"use client";

import { useState, useRef } from "react";
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
  User,
  Briefcase,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { getCurrentUser, updateUser } from "@/lib/users";
import { isLoggedIn } from "@/lib/auth";

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const currentUser = getCurrentUser();
  const isTalent = currentUser?.userType === "talent";

  // Form data
  const [formData, setFormData] = useState({
    avatar: currentUser?.avatar || "",
    bio: currentUser?.bio || "",
    portfolioItems: [] as string[],
  });

  // Redirect if not logged in
  if (!isLoggedIn() || !currentUser) {
    router.push("/login");
    return null;
  }

  // Redirect if onboarding already completed
  if (currentUser.hasCompletedOnboarding) {
    router.push("/feed");
    return null;
  }

  const totalSteps = isTalent ? 5 : 3; // 5 for Talents, 3 for Voisins/Recruteurs
  const progress = (currentStep / totalSteps) * 100;

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

  const handleSkip = () => {
    // Mark onboarding as completed and redirect
    if (currentUser) {
      updateUser(currentUser.id, { hasCompletedOnboarding: true });
    }
    router.push("/feed");
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };

  const handleComplete = () => {
    setLoading(true);

    // Update user with onboarding data
    if (currentUser) {
      // Use placeholder images to avoid localStorage quota issues
      // In production, these would be uploaded to Supabase Storage
      const portfolioData = formData.portfolioItems.map((img, i) => ({
        id: `${Date.now()}-${i}`,
        title: `Portfolio item ${i + 1}`,
        description: "",
        // Use placeholder instead of base64 to save localStorage space
        imageUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800`,
      }));

      // Use placeholder for avatar if it's base64
      const avatarUrl = formData.avatar?.startsWith('data:')
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.firstName}${currentUser.lastName}&${Date.now()}`
        : formData.avatar || currentUser.avatar;

      updateUser(currentUser.id, {
        avatar: avatarUrl,
        bio: formData.bio || currentUser.bio,
        portfolio: [...(currentUser.portfolio || []), ...portfolioData],
        hasCompletedOnboarding: true,
      });
    }

    setTimeout(() => {
      router.push("/feed");
    }, 500);
  };

  const canProceedStep2 = formData.avatar && formData.bio.length >= 20;
  const canProceedStep3 = formData.portfolioItems.length >= 2;

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
                {isTalent
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
                    <User className="w-6 h-6 text-violet-400" />
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

          {/* Step 3: Add Portfolio (Talents only) */}
          {currentStep === 3 && isTalent && (
            <motion.div
              key="step3"
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

          {/* Step 3 for non-Talents / Step 4 for Talents: App Tour */}
          {((currentStep === 3 && !isTalent) || (currentStep === 4 && isTalent)) && (
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
          {((currentStep === 3 && !isTalent) || (currentStep === 5 && isTalent)) && (
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
