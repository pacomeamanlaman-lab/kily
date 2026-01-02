"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { showToast } from "@/lib/toast";
import { createVideo } from "@/lib/videos";
import { getCurrentUser, getUserDisplayName } from "@/lib/users";

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
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<string>("0:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to format duration (seconds to mm:ss)
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to capture video frame as thumbnail
  const captureVideoFrame = (video: HTMLVideoElement): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve('');
      }
    });
  };

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
        const dataUrl = reader.result as string;
        setVideoPreview(dataUrl);
        
        // Create video element to get duration and capture thumbnail
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true; // Mute to allow autoplay
        video.playsInline = true; // For mobile compatibility
        video.src = dataUrl;
        
        // Create object URL as fallback if data URL doesn't work
        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;
        
        const handleLoadedMetadata = () => {
          // Set duration
          if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
            const duration = formatDuration(video.duration);
            setVideoDuration(duration);
            
            // Seek to 1 second (or 10% of duration if less than 1 second) to capture a good frame
            const seekTime = Math.min(1, Math.max(0.1, video.duration * 0.1));
            video.currentTime = seekTime;
          } else {
            setVideoDuration("0:00");
            // Try to capture frame at 0.5 seconds as fallback
            video.currentTime = 0.5;
          }
        };
        
        const handleSeeked = async () => {
          // Capture frame as thumbnail
          try {
            const thumbnail = await captureVideoFrame(video);
            if (thumbnail) {
              setVideoThumbnail(thumbnail);
            } else {
              // Fallback: use a placeholder or the video URL
              console.warn('Failed to capture thumbnail, using fallback');
              setVideoThumbnail(dataUrl);
            }
          } catch (error) {
            console.error('Error capturing thumbnail:', error);
            setVideoThumbnail(dataUrl);
          } finally {
            // Clean up object URL
            URL.revokeObjectURL(objectUrl);
          }
        };
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('seeked', handleSeeked);
        
        video.onerror = () => {
          console.error('Error loading video');
          // Fallback: use video data URL as thumbnail (not ideal but better than nothing)
          setVideoThumbnail(dataUrl);
          setVideoDuration("0:00");
          URL.revokeObjectURL(objectUrl);
        };
        
        // Load the video
        video.load();
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setVideoThumbnail(null);
    setVideoDuration("0:00");
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

    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast("Vous devez être connecté pour publier", "error");
      setIsSubmitting(false);
      return;
    }

    // Save to localStorage
    const newVideo = createVideo({
      title,
      description,
      category,
      videoUrl: videoPreview!,
      thumbnail: videoThumbnail || videoPreview || undefined,
      duration: videoDuration,
      author: {
        id: currentUser.id,
        name: getUserDisplayName(currentUser),
        avatar: currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
        verified: currentUser.verified,
      },
    });

    console.log("New video created:", newVideo);

    // Dispatch custom event to refresh feed
    window.dispatchEvent(new Event('videoCreated'));

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
