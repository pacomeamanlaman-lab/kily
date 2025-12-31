"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Video } from "@/lib/videoData";

interface VideoCardFeedProps {
  video: Video;
  onClick: () => void;
}

export default function VideoCardFeed({ video, onClick }: VideoCardFeedProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Share logic
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  const formatNumber = (num: number | string): string => {
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={video.author.avatar}
              alt={video.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {video.author.verified && (
              <div className="absolute -bottom-1 -right-1 bg-violet-600 rounded-full p-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{video.author.name}</h3>
            </div>
            <p className="text-sm text-gray-400 capitalize">{video.category}</p>
            <p className="text-xs text-gray-500">{getTimeAgo(video.createdAt)}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-white">{video.description}</p>
      </div>

      {/* Video Thumbnail */}
      <div 
        className="relative aspect-square sm:aspect-video overflow-hidden cursor-pointer group"
        onClick={onClick}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 bg-violet-600/90 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <Play className="w-8 h-8 fill-white text-white ml-1" />
          </motion.div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-medium">
          {video.duration}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{formatNumber(likesCount)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-violet-400 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{formatNumber(video.comments)} commentaires</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              liked
                ? "bg-red-500/10 text-red-500"
                : "bg-white/5 hover:bg-white/10 text-gray-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
            <span className="text-sm font-medium">
              {liked ? "Aimé" : "Aimer"}
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Commenter</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

