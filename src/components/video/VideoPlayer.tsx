"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const currentVideo = videos[currentIndex];

  // Auto-play when video changes
  useEffect(() => {
    if (videoRef.current && isOpen) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [currentIndex, isOpen]);

  // Handle progress update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
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

  // Navigate to next/previous video
  const navigateVideo = (direction: "next" | "prev") => {
    if (direction === "next" && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe up - next video
        navigateVideo("next");
      } else {
        // Swipe down - previous video
        navigateVideo("prev");
      }
    }

    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  // Format number for display
  const formatNumber = (num: number | string): string => {
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Toggle like
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Video container */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Video */}
            <video
              ref={videoRef}
              src={currentVideo.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
            />

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-violet-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Play/Pause overlay */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-10 h-10 fill-white text-white ml-1" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top controls */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
              {/* Author avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                  <Image
                    src={currentVideo.author.avatar}
                    alt={currentVideo.author.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                {currentVideo.author.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Like */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
                  <Heart
                    className={`w-6 h-6 ${
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }`}
                  />
                </div>
                <span className="text-white text-xs font-medium">
                  {formatNumber(isLiked ? currentVideo.likes + 1 : currentVideo.likes)}
                </span>
              </motion.button>

              {/* Comments */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">
                  {formatNumber(currentVideo.comments)}
                </span>
              </motion.button>

              {/* Share */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">
                  {formatNumber(currentVideo.shares)}
                </span>
              </motion.button>
            </div>

            {/* Bottom info */}
            <div className="absolute left-4 right-20 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-bold text-xl text-white">{currentVideo.author.name}</p>
                  {currentVideo.author.verified && (
                    <CheckCircle className="w-5 h-5 text-violet-500 fill-violet-500" />
                  )}
                </div>
                <h2 className="text-white text-xl font-bold mb-2">{currentVideo.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                  <span>{formatNumber(currentVideo.views)} vues</span>
                  <span>•</span>
                  <span>{currentVideo.duration}</span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">{currentVideo.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="bg-violet-600/80 px-3 py-1 rounded-full text-xs font-medium">
                    #{currentVideo.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation hints */}
            {currentIndex < videos.length - 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 pointer-events-none">
                <ChevronUp className="w-6 h-6 animate-bounce" />
                <span className="text-xs">Swipe pour suivant</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
