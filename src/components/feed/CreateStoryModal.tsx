"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { showToast } from "@/lib/toast";
import { createStory } from "@/lib/stories";
import { getUserDisplayName } from "@/lib/supabase/users.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const { user: currentUser } = useCurrentUser();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        showToast("Veuillez sélectionner une image", "error");
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast("L'image ne doit pas dépasser 10MB", "error");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile || !imagePreview) {
      showToast("Veuillez sélectionner une image", "error");
      return;
    }

    setIsSubmitting(true);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user is connected
    if (!currentUser) {
      showToast("Vous devez être connecté pour publier", "error");
      setIsSubmitting(false);
      return;
    }

    // Save to localStorage
    const newStory = createStory({
      image: imagePreview,
      author: {
        id: currentUser.id,
        name: getUserDisplayName(currentUser),
        avatar: currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
      },
    });

    console.log("New story created:", newStory);

    showToast("Story publiée avec succès !", "success");
    setIsSubmitting(false);
    removeImage();
    onClose();
  };

  const handleClose = () => {
    removeImage();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Créer une story</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Image Upload */}
                <div>
                  {imagePreview ? (
                    <div className="relative">
                      <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-black/80 rounded-full hover:bg-black transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full aspect-[9/16] border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-violet-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <Upload className="w-12 h-12 text-gray-500" />
                        <div className="text-center">
                          <p className="text-sm text-white font-medium">
                            Télécharger une photo
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG - Max 10MB
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Format 9:16 recommandé
                          </p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !imageFile}
                    className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? "Publication..." : "Publier"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
