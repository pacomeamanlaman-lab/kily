"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { showToast } from "@/lib/toast";
import { createVideo } from "@/lib/supabase/videos.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createDirectUpload, uploadVideoToMux } from "@/lib/mux/mux.service";

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
  const { user: currentUser } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<string>("0:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [muxUploadId, setMuxUploadId] = useState<string | null>(null);

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

    // Check if user is connected
    if (!currentUser) {
      showToast("Vous devez être connecté pour publier", "error");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Étape 1: Créer un direct upload vers Mux
      showToast("Préparation de l'upload...", "info");
      const directUpload = await createDirectUpload();
      setMuxUploadId(directUpload.id);

      // Étape 2: Uploader la vidéo vers Mux
      setUploadProgress(10);
      showToast("Upload de la vidéo en cours...", "info");
      
      await uploadVideoToMux(videoFile, directUpload.url, (progress) => {
        // Progress de 10% à 90% pour l'upload
        setUploadProgress(10 + (progress * 0.8));
      });

      setUploadProgress(90);
      showToast("Traitement de la vidéo par Mux...", "info");

      // Étape 3: Attendre que Mux traite la vidéo et récupérer le playback_id
      // On va poller l'API pour récupérer le playback_id
      let playbackId: string | null = null;
      let attempts = 0;
      const maxAttempts = 60; // 60 tentatives max (environ 2 minutes)

      while (!playbackId && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
        
        try {
          // Récupérer les infos du direct upload pour obtenir le playback_id
          const response = await fetch(`/api/videos/mux-upload/${directUpload.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.playback_id && data.asset_status === 'ready') {
              playbackId = data.playback_id;
              break;
            }
          }
        } catch (error) {
          console.error('Erreur récupération playback_id:', error);
        }
        
        attempts++;
        setUploadProgress(90 + Math.min((attempts / maxAttempts) * 5, 5)); // Progress de 90% à 95%
      }

      if (!playbackId) {
        throw new Error("Impossible de récupérer le playback_id. La vidéo est peut-être encore en cours de traitement.");
      }

      setUploadProgress(95);

      // Étape 4: Construire l'URL de la vidéo Mux
      // Format: https://stream.mux.com/{playback_id}.m3u8 (HLS)
      const videoUrl = `https://stream.mux.com/${playbackId}.m3u8`;
      const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;

      // Étape 5: Sauvegarder dans Supabase
      const newVideo = await createVideo({
        title: title.trim(),
        description: description.trim(),
        category,
        video_url: videoUrl,
        thumbnail: thumbnailUrl,
        duration: videoDuration,
        author_id: currentUser.id,
      });

      if (!newVideo) {
        throw new Error("Erreur lors de la sauvegarde de la vidéo");
      }

      setUploadProgress(100);
      
      // Dispatch custom event to refresh feed
      window.dispatchEvent(new Event('videoCreated'));

      showToast("Vidéo publiée avec succès !", "success");
      onSuccess();
    } catch (error: any) {
      console.error('Erreur upload vidéo:', error);
      showToast(error?.message || "Erreur lors de l'upload de la vidéo", "error");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setMuxUploadId(null);
    }
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
          className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {isSubmitting ? (
            <span className="relative z-10">
              {uploadProgress > 0 ? `Upload ${Math.round(uploadProgress)}%` : "Publication..."}
            </span>
          ) : (
            "Publier"
          )}
          {isSubmitting && uploadProgress > 0 && (
            <div
              className="absolute inset-0 bg-violet-700 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          )}
        </button>
      </div>
    </form>
  );
}
