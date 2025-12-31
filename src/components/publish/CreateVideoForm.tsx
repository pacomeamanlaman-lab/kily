"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { showToast } from "@/lib/toast";

interface CreateVideoFormProps {
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

export default function CreateVideoForm({ onSuccess, onCancel }: CreateVideoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB for MVP)
      if (file.size > 100 * 1024 * 1024) {
        showToast("La vidéo ne doit pas dépasser 100MB", "error");
        return;
      }

      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      showToast("Veuillez sélectionner une vidéo", "error");
      return;
    }

    if (!title.trim()) {
      showToast("Veuillez ajouter un titre", "error");
      return;
    }

    if (!category) {
      showToast("Veuillez sélectionner une catégorie", "error");
      return;
    }

    setIsSubmitting(true);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TODO: Save to localStorage or mock store
    const newVideo = {
      id: Date.now().toString(),
      title,
      description,
      category,
      videoUrl: videoPreview,
      author: {
        name: "Vous",
        username: "@vous",
        avatar: "/default-avatar.png",
      },
      likes: 0,
      comments: 0,
      views: 0,
      timestamp: new Date().toISOString(),
    };

    console.log("New video created:", newVideo);

    showToast("Vidéo publiée avec succès !", "success");
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Video Upload */}
      <div>
        {videoPreview ? (
          <div className="relative">
            <video
              src={videoPreview}
              controls
              className="w-full h-48 object-cover rounded-xl bg-black"
            />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute top-2 right-2 p-2 bg-black/80 rounded-full hover:bg-black transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="block w-full p-8 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-violet-500/50 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-gray-500" />
              <div className="text-center">
                <p className="text-sm text-white font-medium">
                  Télécharger une vidéo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  MP4, MOV, AVI - Max 100MB
                </p>
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la vidéo"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {title.length}/100
        </p>
      </div>

      {/* Description */}
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {description.length}/300
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
