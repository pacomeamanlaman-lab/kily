"use client";

import { useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { showToast } from "@/lib/toast";

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

export default function CreatePostForm({ onSuccess, onCancel }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    // TODO: Save to localStorage or mock store
    const newPost = {
      id: Date.now().toString(),
      content,
      category,
      image: imagePreview,
      author: {
        name: "Vous",
        username: "@vous",
        avatar: "/default-avatar.png",
      },
      likes: 0,
      comments: 0,
      timestamp: new Date().toISOString(),
    };

    console.log("New post created:", newPost);

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
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-black/80 rounded-full hover:bg-black transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="block w-full p-6 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-violet-500/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-gray-500" />
              <p className="text-sm text-gray-400">
                Ajouter une image (optionnel)
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
