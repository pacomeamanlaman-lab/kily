"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, Send, X } from "lucide-react";
import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import { togglePostLike, isPostLiked, addComment, loadComments } from "@/lib/posts";

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

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export default function PostCard({ post }: PostCardProps) {
  const currentUserId = "current_user";
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Load existing comments and like status on mount
  useEffect(() => {
    const existingComments = loadComments(post.id);
    const formattedComments = existingComments.map(c => ({
      id: c.id,
      author: c.author.name,
      avatar: c.author.avatar,
      content: c.content,
      timestamp: c.timestamp,
    }));
    setComments(formattedComments);

    const isLiked = isPostLiked(post.id, currentUserId);
    setLiked(isLiked);
  }, [post.id]);

  const handleLike = () => {
    const result = togglePostLike(post.id, currentUserId);
    setLiked(result.liked);
    setLikesCount(result.likesCount);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment = addComment(
      post.id,
      commentText,
      {
        name: "Vous",
        username: "@vous",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
      }
    );

    const formattedComment: Comment = {
      id: newComment.id,
      author: newComment.author.name,
      avatar: newComment.author.avatar,
      content: newComment.content,
      timestamp: newComment.timestamp,
    };

    setComments([...comments, formattedComment]);
    setCommentText("");
    setToast({
      message: "Commentaire ajouté !",
      type: "success",
      visible: true,
    });
  };

  const handleShare = () => {
    setToast({
      message: "Lien copié dans le presse-papiers",
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
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-violet-400 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length} commentaires</span>
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
            onClick={() => setShowComments(true)}
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
