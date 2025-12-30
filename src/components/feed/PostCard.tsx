"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle } from "lucide-react";
import { useState } from "react";
import Badge from "@/components/ui/Badge";

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    skill?: string;
  };
  type: "portfolio" | "achievement" | "service";
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
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
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {post.author.verified && (
              <div className="absolute -bottom-1 -right-1 bg-violet-600 rounded-full p-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{post.author.name}</h3>
            </div>
            {post.author.skill && (
              <p className="text-sm text-gray-400">{post.author.skill}</p>
            )}
            <p className="text-xs text-gray-500">{getTimeAgo(post.timestamp)}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-white">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="relative aspect-square sm:aspect-video overflow-hidden">
          <img
            src={post.image}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{likesCount}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments} commentaires</span>
          </div>
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
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Commenter</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
