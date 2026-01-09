"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Crown, Award, Shield, Zap, Star } from "lucide-react";

interface Badge {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
}

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (badge: Badge) => Promise<void>;
  badge?: Badge | null;
  mode: "create" | "edit";
}

const availableIcons = [
  { name: "CheckCircle", component: CheckCircle },
  { name: "Crown", component: Crown },
  { name: "Award", component: Award },
  { name: "Shield", component: Shield },
  { name: "Zap", component: Zap },
  { name: "Star", component: Star },
];

export default function BadgeModal({ isOpen, onClose, onSave, badge, mode }: BadgeModalProps) {
  const [formData, setFormData] = useState<Badge>({
    name: "",
    description: "",
    icon: "CheckCircle",
    color: "#8b5cf6",
    criteria: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (badge) {
      setFormData(badge);
    } else {
      setFormData({
        name: "",
        description: "",
        icon: "CheckCircle",
        color: "#8b5cf6",
        criteria: "",
      });
    }
    setError("");
  }, [badge, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.description || !formData.criteria) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const IconComponent = availableIcons.find(i => i.name === formData.icon)?.component || CheckCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {mode === "create" ? "Nouveau Badge" : "Éditer le Badge"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium mb-2">Nom du badge *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Ex: Talent Vérifié"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Description du badge"
              rows={3}
              required
            />
          </div>

          {/* Icône */}
          <div>
            <label className="block text-sm font-medium mb-2">Icône *</label>
            <div className="grid grid-cols-3 gap-2">
              {availableIcons.map((icon) => {
                const Icon = icon.component;
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.name })}
                    className={`p-3 rounded-xl border transition-all ${
                      formData.icon === icon.name
                        ? "border-violet-500 bg-violet-500/20"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto" style={{ color: formData.color }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium mb-2">Couleur *</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="#8b5cf6"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <div
                className="w-12 h-12 rounded-lg border border-white/10"
                style={{ backgroundColor: formData.color }}
              />
            </div>
          </div>

          {/* Critères */}
          <div>
            <label className="block text-sm font-medium mb-2">Critères d'attribution *</label>
            <textarea
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Ex: Note moyenne ≥ 4.8/5"
              rows={2}
              required
            />
          </div>

          {/* Aperçu */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-2">Aperçu :</p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                <IconComponent className="w-6 h-6" style={{ color: formData.color }} />
              </div>
              <div>
                <p className="font-semibold text-white">{formData.name || "Nom du badge"}</p>
                <p className="text-sm text-gray-400">{formData.description || "Description"}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : mode === "create" ? "Créer" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


