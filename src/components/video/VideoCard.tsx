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
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="relative group text-left rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-violet-500/60 focus:outline-none w-full"
    >
      {/* Thumbnail */}
      <div className="relative h-40 sm:h-44 overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/0" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 bg-violet-600/90 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <Play className="w-6 h-6 fill-white text-white ml-0.5" />
          </motion.div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-[11px] font-medium">
          {video.duration}
        </div>

        {/* Views badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] text-gray-200">
          <Eye className="w-3 h-3" />
          <span>{video.views}</span>
        </div>
      </div>

      {/* Video info */}
      <div className="p-3 space-y-1">
        {/* Title */}
        <p className="text-sm font-medium line-clamp-2 text-white">
          {video.title}
        </p>
        
        {/* Author & Stats */}
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="relative w-4 h-4 rounded-full overflow-hidden">
              <Image
                src={video.author.avatar}
                alt={video.author.name}
                fill
                className="object-cover"
                sizes="16px"
              />
            </div>
            <span className="truncate max-w-[100px]">{video.author.name}</span>
            {video.author.verified && (
              <CheckCircle className="w-3 h-3 text-violet-500 fill-violet-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{formatNumber(video.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{formatNumber(video.comments)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
