"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Post, updatePost } from "@/lib/posts";
import { showToast } from "@/lib/toast";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onPostUpdated: () => void;
}

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onPostUpdated,
}: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [images, setImages] = useState<string[]>(post.images || []);
  const [category, setCategory] = useState(post.category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(post.content);
      setImages(post.images || []);
      setCategory(post.category);
    }
  }, [isOpen, post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 8;
    
    if (images.length + files.length > maxImages) {
      showToast(`Maximum ${maxImages} images autorisées`, "error");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showToast("Seules les images sont autorisées", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      showToast("Le contenu ne peut pas être vide", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = updatePost(post.id, {
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        category,
      });

      if (updated) {
        showToast("Post modifié avec succès !", "success");
        onPostUpdated();
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
              <h2 className="text-2xl font-bold">Modifier le post</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contenu
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Quoi de neuf ?"
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Images Preview */}
              {images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Images ({images.length}/8)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Images */}
              {images.length < 8 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ajouter des images
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-xl hover:border-violet-500/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Ajouter des images ({images.length}/8)</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}

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
                  disabled={isSubmitting || !content.trim()}
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

