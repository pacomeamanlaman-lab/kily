"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { showToast } from "@/lib/toast";
import { createPost } from "@/lib/posts";
import { getUserDisplayName } from "@/lib/supabase/users.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CreatePostFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const categories = [
  "Tech & Code",
  "Design & Créa",
  "Marketing",
  "Musique",
  "Art",
  "Sport",
  "Cuisine",
  "Autre",
];

const MAX_IMAGES = 8;

export default function CreatePostForm({ onSuccess, onCancel }: CreatePostFormProps) {
  const { user: currentUser } = useCurrentUser();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: File[]) => {
    if (files.length === 0) return;

    // Filter only image files
    const validImageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (validImageFiles.length === 0) {
      showToast("Veuillez sélectionner uniquement des images", "error");
      return;
    }

    // Check total count
    if (imageFiles.length + validImageFiles.length > MAX_IMAGES) {
      showToast(`Maximum ${MAX_IMAGES} images autorisées`, "error");
      return;
    }

    // Limit to MAX_IMAGES
    const filesToAdd = validImageFiles.slice(0, MAX_IMAGES - imageFiles.length);
    const newFiles = [...imageFiles, ...filesToAdd];

    // Read all files
    const newPreviews: string[] = [];
    let loadedCount = 0;

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loadedCount++;
        
        if (loadedCount === filesToAdd.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
          setImageFiles(newFiles);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      showToast("Veuillez écrire quelque chose", "error");
      return;
    }

    if (!category) {
      showToast("Veuillez sélectionner une catégorie", "error");
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
    const newPost = createPost({
      content,
      category,
      images: imagePreviews.length > 0 ? imagePreviews : undefined,
      author: {
        id: currentUser.id,
        name: getUserDisplayName(currentUser),
        username: `@${currentUser.first_name?.toLowerCase() || ''}${currentUser.last_name?.toLowerCase() || ''}`,
        avatar: currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
      },
    });

    console.log("New post created:", newPost);

    // Dispatch custom event to refresh feed
    window.dispatchEvent(new Event('postCreated'));

    showToast("Post publié avec succès !", "success");
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Content */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Partagez vos idées, réalisations, talents..."
          className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {content.length}/500
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Catégorie
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="" disabled className="bg-gray-900">
            Choisir une catégorie
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-gray-900">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Image Upload */}
      <div>
        {imagePreviews.length > 0 ? (
          <div className="space-y-3">
            {/* Image Grid Preview - Small thumbnails */}
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-20 h-20 group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 p-1 bg-red-600 hover:bg-red-700 rounded-full transition-colors shadow-lg"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            {imagePreviews.length < MAX_IMAGES && (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  isDragging
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 hover:border-violet-500/50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                  <p className="text-xs text-gray-400">
                    {isDragging ? "Déposez les images ici" : `Ajouter des images (${imagePreviews.length}/${MAX_IMAGES})`}
                  </p>
                </div>
              </label>
            )}
          </div>
        ) : (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`block w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              isDragging
                ? "border-violet-500 bg-violet-500/10"
                : "border-white/10 hover:border-violet-500/50"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-gray-500" />
              <p className="text-sm text-gray-400">
                {isDragging ? "Déposez les images ici" : `Ajouter des images (optionnel, max ${MAX_IMAGES})`}
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Publication..." : "Publier"}
        </button>
      </div>
    </form>
  );
}
