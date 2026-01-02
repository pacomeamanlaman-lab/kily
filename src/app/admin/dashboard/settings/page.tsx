"use client";

import { useState } from "react";
import {
  Settings,
  Globe,
  Shield,
  Bell,
  Mail,
  Database,
  Palette,
  Save,
  RotateCcw
} from "lucide-react";

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState("Kily");
  const [platformDescription, setPlatformDescription] = useState("Plateforme de mise en avant des talents bruts");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [moderationMode, setModerationMode] = useState<"auto" | "manual">("auto");
  const [primaryColor, setPrimaryColor] = useState("#8b5cf6");
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [bannedWords, setBannedWords] = useState("spam, arnaque, fake");

  const handleSave = () => {
    // TODO: Save settings to database
    alert("✅ Paramètres sauvegardés avec succès !");
  };

  const handleReset = () => {
    setPlatformName("Kily");
    setPlatformDescription("Plateforme de mise en avant des talents bruts");
    setMaintenanceMode(false);
    setRegistrationOpen(true);
    setEmailNotifications(true);
    setModerationMode("auto");
    setPrimaryColor("#8b5cf6");
    setMaxFileSize(10);
    setBannedWords("spam, arnaque, fake");
    alert("🔄 Paramètres réinitialisés aux valeurs par défaut");
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Paramètres de la Plateforme</h1>
          <p className="text-sm sm:text-base text-gray-400">Configurez les paramètres globaux de Kily</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl text-white font-medium transition-all cursor-pointer"
          >
            <Save className="w-5 h-5" />
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold">Paramètres Généraux</h2>
          </div>

          <div className="space-y-4">
            {/* Platform Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nom de la Plateforme
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Platform Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                value={platformDescription}
                onChange={(e) => setPlatformDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">Mode Maintenance</p>
                <p className="text-sm text-gray-400">Bloquer l'accès à la plateforme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Registration Open */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">Inscriptions Ouvertes</p>
                <p className="text-sm text-gray-400">Autoriser les nouvelles inscriptions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={registrationOpen}
                  onChange={(e) => setRegistrationOpen(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold">Modération</h2>
          </div>

          <div className="space-y-4">
            {/* Moderation Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mode de Modération
              </label>
              <select
                value={moderationMode}
                onChange={(e) => setModerationMode(e.target.value as "auto" | "manual")}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                <option value="auto" className="bg-gray-900">Automatique</option>
                <option value="manual" className="bg-gray-900">Manuelle</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {moderationMode === "auto"
                  ? "Les contenus sont publiés automatiquement et modérés après"
                  : "Les contenus doivent être approuvés avant publication"
                }
              </p>
            </div>

            {/* Banned Words */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mots Interdits (séparés par des virgules)
              </label>
              <textarea
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">Notifications par Email</p>
                <p className="text-sm text-gray-400">Envoyer des emails aux utilisateurs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Upload Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold">Upload & Stockage</h2>
          </div>

          <div className="space-y-4">
            {/* Max File Size */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Taille Max Fichiers (MB)
              </label>
              <input
                type="number"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Taille maximale pour les uploads d'images et vidéos
              </p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-xl font-bold">Apparence</h2>
          </div>

          <div className="space-y-4">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Couleur Principale
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer"
                />
                <div>
                  <p className="text-white font-mono">{primaryColor}</p>
                  <p className="text-sm text-gray-400">Couleur des boutons et accents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (Fixed Bottom) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-10">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-medium shadow-lg shadow-violet-500/50 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Sauvegarder les Modifications</span>
          <span className="sm:hidden">Sauvegarder</span>
        </button>
      </div>
    </div>
  );
}
