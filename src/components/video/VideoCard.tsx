"use client";

import { Users, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Video } from "@/lib/videoData";

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="text-left rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-violet-500/60 focus:outline-none w-full"
    >
      <div className="relative h-40 sm:h-44 overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/0" />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-[11px] font-medium">
          {video.duration}
        </div>
      </div>

      <div className="p-3 space-y-2">
        {/* Author info */}
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-violet-500/50 flex-shrink-0">
            <Image
              src={video.author.avatar}
              alt={video.author.name}
              fill
              className="object-cover"
              sizes="24px"
            />
          </div>
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {video.author.name}
            </p>
            {video.author.verified && (
              <CheckCircle className="w-3 h-3 text-violet-500 fill-violet-500 flex-shrink-0" />
            )}
          </div>
        </div>
        
        {/* Title */}
        <p className="text-sm font-medium line-clamp-2 text-white">
          {video.title}
        </p>
        
        {/* Views */}
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {video.views} vues
        </p>
      </div>
    </motion.button>
  );
}
