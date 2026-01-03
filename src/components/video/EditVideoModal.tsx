"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Video, updateVideo } from "@/lib/videos";
import { showToast } from "@/lib/toast";

interface EditVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
  onVideoUpdated: () => void;
}

export default function EditVideoModal({
  isOpen,
  onClose,
  video,
  onVideoUpdated,
}: EditVideoModalProps) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || "");
  const [category, setCategory] = useState(video.category);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(video.title);
      setDescription(video.description || "");
      setCategory(video.category);
    }
  }, [isOpen, video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showToast("Le titre ne peut pas être vide", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = updateVideo(video.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
      });

      if (updated) {
        showToast("Vidéo modifiée avec succès !", "success");
        onVideoUpdated();
        onClose();
      } else {
        showToast("Erreur lors de la modification", "error");
      }
    } catch (error) {
      showToast("Erreur lors de la modification", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-gray-900 to-black border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold">Modifier la vidéo</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de la vidéo"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description de la vidéo"
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="portfolio">Portfolio</option>
                  <option value="achievement">Réalisation</option>
                  <option value="service">Service</option>
                  <option value="tutorial">Tutoriel</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors font-medium"
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

