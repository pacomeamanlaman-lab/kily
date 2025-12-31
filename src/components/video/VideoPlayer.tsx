"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  CheckCircle,
  Users,
  MoreVertical,
  Lock,
  ArrowDown,
  Volume2,
  VolumeX,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Video } from "@/lib/videoData";

interface VideoPlayerProps {
  videos: Video[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayer({
  videos,
  initialIndex,
  isOpen,
  onClose,
}: VideoPlayerProps) {
  const router = useRouter();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialIndex);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = videos[currentVideoIndex];
  const isYouTubeVideo =
    currentVideo?.videoUrl.includes("youtube.com/shorts") ||
    currentVideo?.videoUrl.includes("youtube.com/watch");

  // Navigation vidéo
  const navigateToVideo = (direction: "next" | "prev") => {
    if (direction === "next" && currentVideoIndex < videos.length - 1) {
      const nextIndex = currentVideoIndex + 1;
      const nextVideo = videos[nextIndex];

      // Si la vidéo est premium et non abonné, afficher paywall
      if (nextVideo.isPremium && !isSubscribed) {
        setShowPaywall(true);
      } else {
        setCurrentVideoIndex(nextIndex);
        setShowPaywall(false);
      }
    } else if (direction === "prev" && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setShowPaywall(false);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Gestion de la progression
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  // Gérer le clic sur la barre de progression
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  // Formater le temps (secondes -> mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gestion du swipe tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swipe up - next video
      navigateToVideo("next");
    } else {
      // Swipe down - previous video
      navigateToVideo("prev");
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Gestion du scroll avec molette
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.deltaY > 0) {
        navigateToVideo("next");
      } else if (e.deltaY < 0) {
        navigateToVideo("prev");
      }
    };

    const container = containerRef.current;
    if (container && isOpen) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [isOpen, currentVideoIndex, videos.length]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowUp") {
        navigateToVideo("prev");
      } else if (e.key === "ArrowDown") {
        navigateToVideo("next");
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentVideoIndex, videos.length, onClose]);

  // Update currentVideoIndex when initialIndex changes (when clicking a different video)
  useEffect(() => {
    if (isOpen) {
      setCurrentVideoIndex(initialIndex);
      setProgress(0);
      setCurrentTime(0);
    }
  }, [initialIndex, isOpen]);

  // Auto-play when video changes
  useEffect(() => {
    if (videoRef.current && isOpen) {
      videoRef.current.play();
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);
    }
  }, [currentVideoIndex, isOpen]);

  // Protection contre les vidéos manquantes
  if (!currentVideo) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <div className="text-white text-center">
              <p className="text-xl mb-4">Aucune vidéo disponible</p>
              <button
                onClick={onClose}
                className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-full font-medium transition-all"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const canAccess = isSubscribed || !currentVideo.isPremium;

  // Créer les données du créateur depuis la vidéo
  const creatorData = {
    name: currentVideo.author.name,
    avatar: currentVideo.author.avatar,
    verified: currentVideo.author.verified,
    subscribers: "125K", // Mock data, à adapter selon vos besoins
  };

  // Blocage du scroll du body quand le player est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          ref={containerRef}
          className="fixed inset-0 z-[9999] bg-black overflow-hidden"
          style={{ 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            width: '100vw',
            height: '100vh',
            position: 'fixed'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm"
          >
            <div className="flex items-center justify-between p-4">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-violet-600/20 border-2 border-violet-500 overflow-hidden">
                  <Image
                    src={creatorData.avatar}
                    alt={creatorData.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white">{creatorData.name}</span>
                    {creatorData.verified && (
                      <CheckCircle className="w-4 h-4 text-violet-500 fill-violet-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>{creatorData.subscribers}</span>
                  </div>
                </div>
              </div>

              <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                <MoreVertical className="w-6 h-6 text-white" />
              </button>
            </div>
          </motion.header>

          {/* Vidéo principale */}
          <div className="absolute inset-0 flex items-center justify-center w-full h-full">
            {/* Background thumbnail avec blur */}
            <div className="absolute inset-0 bg-black w-full h-full">
              <div
                className="w-full h-full bg-center bg-cover blur-3xl opacity-30"
                style={{ backgroundImage: `url(${currentVideo.thumbnail})` }}
              />
            </div>

            {/* Contenu vidéo */}
            <div
              className="relative w-full h-full max-w-md mx-auto bg-black"
              style={{ height: '100vh', width: '100%' }}
              onClick={togglePlay}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              {canAccess ? (
                <>
                  {isYouTubeVideo ? (
                    // Cas spécifique : vidéo YouTube (Shorts ou normale) intégrée en iframe avec autoplay + contrôles natifs
                    <iframe
                      key={currentVideo.id}
                      className="w-full h-full object-cover"
                      src={`${currentVideo.videoUrl
                        .replace("shorts/", "embed/")
                        .replace("watch?v=", "embed/")}?autoplay=1&mute=1&playsinline=1&controls=1`}
                      title={currentVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      key={currentVideo.id}
                      className="w-full h-full object-cover"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      src={currentVideo.videoUrl}
                      autoPlay
                      muted={isMuted}
                      playsInline
                      onError={(e) => console.error("Erreur vidéo:", e)}
                      onLoadedMetadata={(e) => {
                        const video = e.target as HTMLVideoElement;
                        setDuration(video.duration);
                      }}
                      onTimeUpdate={handleTimeUpdate}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => navigateToVideo("next")}
                    />
                  )}

                  {/* Contrôles personnalisés */}
                  <AnimatePresence>
                    {(showControls || !isPlaying) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none"
                      >
                        {/* Icône play/pause au centre */}
                        {!isPlaying && (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          >
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                              <Play className="w-10 h-10 text-white fill-white ml-1" />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bouton volume & barre de progression : seulement pour les vidéos MP4 contrôlables */}
                  {!isYouTubeVideo && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        className="absolute top-20 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors pointer-events-auto"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>

                      {/* Barre de progression */}
                      <AnimatePresence>
                        {showControls && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-24 left-0 right-0 px-6 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Barre de temps */}
                            <div className="flex items-center justify-between text-xs text-white mb-2">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                            {/* Barre de progression cliquable */}
                            <div
                              className="relative h-1 bg-white/30 rounded-full cursor-pointer"
                              onClick={handleProgressClick}
                            >
                              <motion.div
                                className="absolute top-0 left-0 h-full bg-violet-500 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                              <motion.div
                                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                                style={{ left: `${progress}%`, marginLeft: "-6px" }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </>
              ) : (
                // Aperçu flouté pour contenu premium
                <div className="relative w-full h-full">
                  <div
                    className="absolute inset-0 bg-center bg-cover blur-md"
                    style={{ backgroundImage: `url(${currentVideo.thumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70">Contenu Premium</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations vidéo */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="mb-4">
                  <h2 className="text-white text-xl font-bold mb-2">{currentVideo.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{currentVideo.views} vues</span>
                    <span>•</span>
                    <span>{currentVideo.duration}</span>
                    {currentVideo.isPremium && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-violet-400">
                          <Lock className="w-3 h-3" />
                          <span>Premium</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions sidebar */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">{currentVideo.likes}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">{currentVideo.comments}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">Partager</span>
              </motion.button>
            </div>
          </div>

          {/* Indicateurs de navigation */}
          <div className="fixed left-1/2 transform -translate-x-1/2 bottom-6 flex flex-col gap-2 z-40">
            {currentVideoIndex < videos.length - 1 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateToVideo("next")}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ArrowDown className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="fixed right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-40">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => {
                  if (video.isPremium && !isSubscribed) {
                    setShowPaywall(true);
                  } else {
                    setCurrentVideoIndex(index);
                    setShowPaywall(false);
                  }
                }}
                className={`w-1 h-8 rounded-full transition-all ${
                  index === currentVideoIndex
                    ? "bg-violet-500 w-1.5"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
