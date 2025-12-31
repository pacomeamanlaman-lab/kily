"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, Play, Send, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Video } from "@/lib/videoData";
import { mockComments } from "@/lib/feedData";
import Toast from "@/components/ui/Toast";
import { isVideoLiked, getVideoLikesCount, toggleVideoLike, initVideoLikesCount } from "@/lib/videoLikes";

interface VideoCardFeedProps {
  video: Video;
  onClick: () => void;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export default function VideoCardFeed({ video, onClick }: VideoCardFeedProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Load existing comments and likes on mount
  useEffect(() => {
    const existingComments = mockComments[video.id] || [];
    setComments(existingComments);
    
    // Initialize likes count in localStorage
    initVideoLikesCount(video.id, video.likes);
    
    // Load liked state and count from localStorage
    setLiked(isVideoLiked(video.id));
    setLikesCount(getVideoLikesCount(video.id, video.likes));
  }, [video.id, video.likes]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleVideoLike(video.id, likesCount);
    setLiked(result.liked);
    setLikesCount(result.likesCount);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToast({
      message: "Lien copié dans le presse-papiers",
      type: "success",
      visible: true,
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: "Vous",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
      content: commentText,
      timestamp: new Date().toISOString(),
    };

    setComments([...comments, newComment]);
    setCommentText("");
    setToast({
      message: "Commentaire ajouté !",
      type: "success",
      visible: true,
    });
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
        <div className="absolute inset-0 flex items-center justify-center">
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
              setShowComments(true);
            }}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-violet-400 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{formatNumber(comments.length || video.comments)} commentaires</span>
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
              setShowComments(true);
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

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowComments(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold">Commentaires ({comments.length})</h2>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun commentaire pour le moment</p>
                    <p className="text-sm mt-1">Soyez le premier à commenter !</p>
                  </div>
                )}

                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 bg-white/5 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
                    alt="Vous"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                      placeholder="Écrire un commentaire..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      className="p-2 bg-violet-600 hover:bg-violet-700 disabled:bg-white/10 disabled:text-gray-600 rounded-full transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </motion.div>
  );
}

