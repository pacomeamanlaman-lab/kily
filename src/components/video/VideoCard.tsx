"use client";

import { Play, Heart, MessageCircle, Eye, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Video } from "@/lib/videoData";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const formatNumber = (num: number | string): string => {
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="relative group cursor-pointer bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 bg-violet-600/90 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-violet-500 transition-colors"
          >
            <Play className="w-8 h-8 fill-white text-white ml-1" />
          </motion.div>
        </div>

        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
          {video.duration}
        </div>

        {/* Views badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/80 px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
          <Eye className="w-3 h-3" />
          <span>{video.views}</span>
        </div>
      </div>

      {/* Video info */}
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-violet-500">
            <Image
              src={video.author.avatar}
              alt={video.author.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm truncate">{video.author.name}</p>
              {video.author.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-violet-500 fill-violet-500 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-violet-400 transition-colors">
          {video.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {video.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>{formatNumber(video.likes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{formatNumber(video.comments)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
