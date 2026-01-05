"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Bell,
  Lock,
  Eye,
  Shield,
  LogOut,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toast from "@/components/ui/Toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function SettingsPageContent() {
  const router = useRouter();
  const scrollDirection = useScrollDirection({ threshold: 10 });
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "privacy" | "security">("profile");

  // Mock user data
  const [formData, setFormData] = useState({
    name: "Utilisateur",
    email: "user@example.com",
    phone: "+225 07 00 00 00 00",
    city: "Abidjan",
    bio: "Passionné par mon métier",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newMessages: true,
    newFollowers: true,
    projectUpdates: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public" as "public" | "private" | "connections",
    showEmail: false,
    showPhone: false,
    showLocation: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });

  const [phoneForm, setPhoneForm] = useState({
    newPhone: "",
    password: "",
  });

  const [toast, setToast] = useState({
    message: "",
    type: "success" as "success" | "error" | "info",
    visible: false,
  });

  const tabs = [
    { value: "profile" as const, label: "Profil", icon: User },
    { value: "notifications" as const, label: "Notifications", icon: Bell },
    { value: "privacy" as const, label: "Confidentialité", icon: Eye },
    { value: "security" as const, label: "Sécurité", icon: Shield },
  ];

  const handleLogout = async () => {
    try {
      const { logout } = await import("@/lib/supabase/auth.service");
      await logout();
      // Forcer le rechargement pour s'assurer que la session est bien supprimée
      window.location.href = "/login";
    } catch (error) {
      console.error('Error logging out:', error);
      // En cas d'erreur, forcer quand même la redirection
      window.location.href = "/login";
    }
  };

  const handleSaveProfile = () => {
    setToast({
      message: "Profil mis à jour avec succès !",
      type: "success",
      visible: true,
    });
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setToast({
        message: "Veuillez remplir tous les champs",
        type: "error",
        visible: true,
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setToast({
        message: "Le mot de passe doit contenir au moins 8 caractères",
        type: "error",
        visible: true,
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({
        message: "Les mots de passe ne correspondent pas",
        type: "error",
        visible: true,
      });
      return;
    }

    setToast({
      message: "Mot de passe modifié avec succès !",
      type: "success",
      visible: true,
    });

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangeEmail = () => {
    if (!emailForm.newEmail || !emailForm.password) {
      setToast({
        message: "Veuillez remplir tous les champs",
        type: "error",
        visible: true,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      setToast({
        message: "Veuillez entrer une adresse email valide",
        type: "error",
        visible: true,
      });
      return;
    }

    setFormData({ ...formData, email: emailForm.newEmail });
    setToast({
      message: "Email modifié avec succès !",
      type: "success",
      visible: true,
    });

    setEmailForm({ newEmail: "", password: "" });
  };

  const handleChangePhone = () => {
    if (!phoneForm.newPhone || !phoneForm.password) {
      setToast({
        message: "Veuillez remplir tous les champs",
        type: "error",
        visible: true,
      });
      return;
    }

    const phoneRegex = /^\+?[0-9\s-]{10,}$/;
    if (!phoneRegex.test(phoneForm.newPhone)) {
      setToast({
        message: "Veuillez entrer un numéro de téléphone valide",
        type: "error",
        visible: true,
      });
      return;
    }

    setFormData({ ...formData, phone: phoneForm.newPhone });
    setToast({
      message: "Numéro de téléphone modifié avec succès !",
      type: "success",
      visible: true,
    });

    setPhoneForm({ newPhone: "", password: "" });
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    setToast({
      message: "Préférences de notification mises à jour",
      type: "success",
      visible: true,
    });
  };

  const handleTogglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
    setToast({
      message: "Paramètres de confidentialité mis à jour",
      type: "success",
      visible: true,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <div
        className={`sticky top-0 z-40 bg-black border-b border-white/10 transition-transform duration-300 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold">Paramètres</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto horizontal-scrollbar pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Avatar Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Photo de profil</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                    <User className="w-12 h-12" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-700 p-2 rounded-full transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-3">
                    JPG, PNG ou GIF. Taille maximale de 5MB.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">
                      Changer la photo
                    </Button>
                    <Button variant="secondary" size="sm">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
              <div className="space-y-4">
                <Input
                  label="Nom complet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  icon={<User className="w-5 h-5" />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone className="w-5 h-5" />}
                />
                <Input
                  label="Ville"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  icon={<MapPin className="w-5 h-5" />}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button variant="primary" onClick={handleSaveProfile}>Sauvegarder les modifications</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold mb-6">Préférences de notification</h2>
            <div className="space-y-4">
              {[
                { key: "emailNotifications", label: "Notifications par email", description: "Recevoir les notifications par email" },
                { key: "pushNotifications", label: "Notifications push", description: "Recevoir les notifications push" },
                { key: "newMessages", label: "Nouveaux messages", description: "Être notifié des nouveaux messages" },
                { key: "newFollowers", label: "Nouveaux abonnés", description: "Être notifié des nouveaux abonnés" },
                { key: "projectUpdates", label: "Mises à jour de projets", description: "Recevoir les mises à jour" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={() => handleToggleNotification(item.key as keyof typeof notifications)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Visibilité du profil</h2>
              <div className="space-y-3">
                {[
                  { value: "public", label: "Public", description: "Visible par tous" },
                  { value: "connections", label: "Connexions", description: "Visible par vos connexions uniquement" },
                  { value: "private", label: "Privé", description: "Visible par vous uniquement" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                      privacy.profileVisibility === option.value
                        ? "bg-violet-600/20 border-2 border-violet-500"
                        : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={privacy.profileVisibility === option.value}
                      onChange={(e) =>
                        setPrivacy({ ...privacy, profileVisibility: e.target.value as any })
                      }
                      className="mt-1 accent-violet-500"
                    />
                    <div>
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Informations visibles</h2>
              <div className="space-y-4">
                {[
                  { key: "showEmail", label: "Afficher mon email", icon: Mail },
                  { key: "showPhone", label: "Afficher mon téléphone", icon: Phone },
                  { key: "showLocation", label: "Afficher ma localisation", icon: MapPin },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <p className="font-semibold">{item.label}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacy[item.key as keyof typeof privacy] as boolean}
                          onChange={() => handleTogglePrivacy(item.key as keyof typeof privacy)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Mot de passe</h2>
              <div className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  icon={<Lock className="w-5 h-5" />}
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  icon={<Lock className="w-5 h-5" />}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  icon={<Lock className="w-5 h-5" />}
                />
              </div>
              <div className="mt-6">
                <Button variant="primary" onClick={handleChangePassword}>Changer le mot de passe</Button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Changer l'email</h2>
              <div className="space-y-4">
                <Input
                  label="Nouvel email"
                  type="email"
                  placeholder="nouveau@email.com"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                />
                <Input
                  label="Mot de passe (pour confirmer)"
                  type="password"
                  placeholder="••••••••"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  icon={<Lock className="w-5 h-5" />}
                />
              </div>
              <div className="mt-6">
                <Button variant="primary" onClick={handleChangeEmail}>Changer l'email</Button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Changer le téléphone</h2>
              <div className="space-y-4">
                <Input
                  label="Nouveau numéro"
                  type="tel"
                  placeholder="+225 07 00 00 00 00"
                  value={phoneForm.newPhone}
                  onChange={(e) => setPhoneForm({ ...phoneForm, newPhone: e.target.value })}
                  icon={<Phone className="w-5 h-5" />}
                />
                <Input
                  label="Mot de passe (pour confirmer)"
                  type="password"
                  placeholder="••••••••"
                  value={phoneForm.password}
                  onChange={(e) => setPhoneForm({ ...phoneForm, password: e.target.value })}
                  icon={<Lock className="w-5 h-5" />}
                />
              </div>
              <div className="mt-6">
                <Button variant="primary" onClick={handleChangePhone}>Changer le téléphone</Button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Actions du compte</h2>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-orange-500" />
                    <div className="text-left">
                      <p className="font-semibold">Se déconnecter</p>
                      <p className="text-sm text-gray-400">Déconnexion de votre compte</p>
                    </div>
                  </div>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <div className="text-left">
                      <p className="font-semibold group-hover:text-red-500 transition-colors">
                        Supprimer le compte
                      </p>
                      <p className="text-sm text-gray-400">
                        Cette action est irréversible
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
