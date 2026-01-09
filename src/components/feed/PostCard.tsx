"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, Send, X, Edit, Trash2, Flag, EyeOff, Copy, UserPlus, UserMinus, Link } from "lucide-react";
import ShareModal from "@/components/share/ShareModal";
import ImageLightbox from "@/components/feed/ImageLightbox";
import EditPostModal from "@/components/feed/EditPostModal";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import { togglePostLike, isPostLiked, deletePost, updatePost, Post } from "@/lib/posts";
import { loadComments as loadCommentsFromSupabase, addComment as addCommentToSupabase, toggleCommentLike, isCommentLiked, type Comment as SupabaseComment } from "@/lib/supabase/posts.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getUserDisplayName } from "@/lib/supabase/users.service";
import { hidePost } from "@/lib/hiddenContent";
import { createReport, hasUserReported } from "@/lib/reports";
import { toggleFollow, isFollowing } from "@/lib/follows";

interface PostCardProps {
  post: Post;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likesCount?: number;
  isLiked?: boolean;
  replies?: Comment[];
  parentCommentId?: string | null;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id || null;
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [commentId: string]: string }>({});
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [commentsOffset, setCommentsOffset] = useState(0);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Check if post belongs to current user
  const isOwnPost = currentUserId === post.author.id;

  // Load existing comments and like status on mount
  useEffect(() => {
    const loadComments = async () => {
      try {
        const result = await loadCommentsFromSupabase(post.id, 20, 0);
        // Transform Supabase comments to frontend Comment format
        const formattedComments: Comment[] = await Promise.all(
          result.comments.map(async (c: any) => {
            const isLiked = currentUserId ? await isCommentLiked(c.id, currentUserId) : false;
            const replies = (c.replies || []).map((r: any) => ({
              id: r.id,
              author: r.author ? `${r.author.first_name} ${r.author.last_name}` : 'Utilisateur',
              avatar: r.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.author?.first_name || 'user'}`,
              content: r.content,
              timestamp: r.created_at,
              likesCount: r.likes_count || 0,
              isLiked: false, // Will be loaded separately if needed
            }));
            
            return {
              id: c.id,
              author: c.author ? `${c.author.first_name} ${c.author.last_name}` : 'Utilisateur',
              avatar: c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.first_name || 'user'}`,
              content: c.content,
              timestamp: c.created_at,
              likesCount: c.likes_count || 0,
              isLiked,
              replies,
            };
          })
        );
        setComments(formattedComments);
        setHasMoreComments(result.hasMore);
        setCommentsOffset(20);
      } catch (error) {
        console.error('Erreur chargement commentaires:', error);
        setComments([]);
      }
    };

    if (showComments) {
      loadComments();
    }

    if (currentUserId) {
      const isLiked = isPostLiked(post.id, currentUserId);
      setLiked(isLiked);
      
      // Check if following author
      if (post.author.id && post.author.id !== currentUserId) {
        const following = isFollowing(currentUserId, post.author.id);
        setIsFollowingAuthor(following);
      }
    }
  }, [post.id, currentUserId, post.author.id, showComments]);

  const handleLike = () => {
    if (!currentUserId) {
      setToast({
        message: "Vous devez être connecté pour liker",
        type: "error",
        visible: true,
      });
      return;
    }
    const result = togglePostLike(post.id, currentUserId);
    setLiked(result.liked);
    setLikesCount(result.likesCount);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    if (!currentUser) {
      setToast({
        message: "Vous devez être connecté pour commenter",
        type: "error",
        visible: true,
      });
      return;
    }

    try {
      // Optimistic update: add comment immediately to UI
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        author: getUserDisplayName(currentUser),
        avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.first_name}${currentUser.last_name}`,
        content: commentText,
        timestamp: new Date().toISOString(),
      };

      setComments([...comments, optimisticComment]);
      setCommentText("");

      // Save to Supabase
      const savedComment = await addCommentToSupabase(
        post.id,
        commentText,
        currentUser.id
      );

      if (savedComment) {
        // Replace optimistic comment with real one
        const formattedComment: Comment = {
          id: savedComment.id,
          author: savedComment.author ? `${savedComment.author.first_name} ${savedComment.author.last_name}` : 'Utilisateur',
          avatar: savedComment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${savedComment.author?.first_name || 'user'}`,
          content: savedComment.content,
          timestamp: savedComment.created_at,
        };

        setComments(prevComments => 
          prevComments.map(c => 
            c.id === optimisticComment.id ? formattedComment : c
          )
        );

        setToast({
          message: "Commentaire ajouté !",
          type: "success",
          visible: true,
        });
      }
    } catch (error: any) {
      console.error('Erreur ajout commentaire:', error);
      // Remove optimistic comment on error
      setComments(prevComments => prevComments.filter(c => !c.id.startsWith('temp-')));
      setToast({
        message: error?.message || "Erreur lors de l'ajout du commentaire",
        type: "error",
        visible: true,
      });
    }
  };

  const handleLoadMoreComments = async () => {
    if (loadingMoreComments || !hasMoreComments) return;
    
    setLoadingMoreComments(true);
    try {
      const result = await loadCommentsFromSupabase(post.id, 20, commentsOffset);
      const newComments: Comment[] = await Promise.all(
        result.comments.map(async (c: any) => {
          const isLiked = currentUserId ? await isCommentLiked(c.id, currentUserId) : false;
          const replies = (c.replies || []).map((r: any) => ({
            id: r.id,
            author: r.author ? `${r.author.first_name} ${r.author.last_name}` : 'Utilisateur',
            avatar: r.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.author?.first_name || 'user'}`,
            content: r.content,
            timestamp: r.created_at,
            likesCount: r.likes_count || 0,
            isLiked: false,
          }));
          
          return {
            id: c.id,
            author: c.author ? `${c.author.first_name} ${c.author.last_name}` : 'Utilisateur',
            avatar: c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.first_name || 'user'}`,
            content: c.content,
            timestamp: c.created_at,
            likesCount: c.likes_count || 0,
            isLiked,
            replies,
          };
        })
      );
      
      setComments(prev => [...prev, ...newComments]);
      setHasMoreComments(result.hasMore);
      setCommentsOffset(prev => prev + 20);
    } catch (error) {
      console.error('Erreur chargement commentaires supplémentaires:', error);
    } finally {
      setLoadingMoreComments(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!currentUserId) {
      setToast({
        message: "Vous devez être connecté pour liker",
        type: "error",
        visible: true,
      });
      return;
    }

    try {
      const result = await toggleCommentLike(commentId, currentUserId);
      setComments(prevComments => 
        prevComments.map(c => {
          if (c.id === commentId) {
            return { ...c, isLiked: result.liked, likesCount: result.likesCount };
          }
          // Also update in replies
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r.id === commentId 
                  ? { ...r, isLiked: result.liked, likesCount: result.likesCount }
                  : r
              ),
            };
          }
          return c;
        })
      );
    } catch (error: any) {
      console.error('Erreur like commentaire:', error);
      setToast({
        message: error?.message || "Erreur lors du like",
        type: "error",
        visible: true,
      });
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    const text = replyText[parentCommentId];
    if (!text?.trim() || !currentUser) return;

    try {
      const savedReply = await addCommentToSupabase(
        post.id,
        text,
        currentUser.id,
        parentCommentId
      );

      if (savedReply) {
        const formattedReply: Comment = {
          id: savedReply.id,
          author: savedReply.author ? `${savedReply.author.first_name} ${savedReply.author.last_name}` : 'Utilisateur',
          avatar: savedReply.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${savedReply.author?.first_name || 'user'}`,
          content: savedReply.content,
          timestamp: savedReply.created_at,
          likesCount: savedReply.likes_count || 0,
          isLiked: false,
        };

        setComments(prevComments =>
          prevComments.map(c =>
            c.id === parentCommentId
              ? { ...c, replies: [...(c.replies || []), formattedReply] }
              : c
          )
        );

        setReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
        setReplyingTo(null);
        setToast({
          message: "Réponse ajoutée !",
          type: "success",
          visible: true,
        });
      }
    } catch (error: any) {
      console.error('Erreur ajout réponse:', error);
      setToast({
        message: error?.message || "Erreur lors de l'ajout de la réponse",
        type: "error",
        visible: true,
      });
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setShowMenu(false);
    setToast({
      message: "Lien copié dans le presse-papiers",
      type: "success",
      visible: true,
    });
  };

  const handleSharePost = () => {
    setShowMenu(false);
    setShowShareModal(true);
  };

  const handleDelete = () => {
    setShowMenu(false);
    
    // Delete post from localStorage
    const deleted = deletePost(post.id);
    
    if (deleted) {
      setToast({
        message: "Post supprimé",
        type: "success",
        visible: true,
      });
      
      // Dispatch event to refresh feed
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: post.id } }));
    } else {
      setToast({
        message: "Erreur lors de la suppression",
        type: "error",
        visible: true,
      });
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handlePostUpdated = () => {
    // Dispatch event to refresh feed
    window.dispatchEvent(new CustomEvent('postUpdated', { detail: { postId: post.id } }));
  };

  const handleReport = () => {
    if (!currentUserId) return;
    
    setShowMenu(false);
    
    // Check if already reported
    if (hasUserReported(post.id, currentUserId)) {
      setToast({
        message: "Vous avez déjà signalé ce post",
        type: "info",
        visible: true,
      });
      return;
    }
    
    // Create report
    createReport(
      "post",
      post.id,
      currentUserId,
      "Contenu inapproprié",
      "Signalement depuis le menu du post"
    );
    
    setToast({
      message: "Post signalé. Merci pour votre vigilance.",
      type: "success",
      visible: true,
    });
    
    // Dispatch event to refresh feed (hide the post)
    window.dispatchEvent(new CustomEvent('postReported', { detail: { postId: post.id } }));
  };

  const handleHide = () => {
    setShowMenu(false);
    
    // Hide post
    const hidden = hidePost(post.id);
    
    if (hidden) {
      setToast({
        message: "Post masqué",
        type: "success",
        visible: true,
      });
      
      // Dispatch event to refresh feed
      window.dispatchEvent(new CustomEvent('postHidden', { detail: { postId: post.id } }));
    } else {
      setToast({
        message: "Erreur lors du masquage",
        type: "error",
        visible: true,
      });
    }
  };

  const handleFollow = () => {
    if (!currentUserId || !post.author.id) return;
    
    setShowMenu(false);
    const result = toggleFollow(currentUserId, post.author.id);
    setIsFollowingAuthor(result.following);
    
    setToast({
      message: `Vous suivez maintenant ${post.author.name}`,
      type: "success",
      visible: true,
    });
  };

  const handleUnfollow = () => {
    if (!currentUserId || !post.author.id) return;
    
    setShowMenu(false);
    const result = toggleFollow(currentUserId, post.author.id);
    setIsFollowingAuthor(result.following);
    
    setToast({
      message: `Vous ne suivez plus ${post.author.name}`,
      type: "info",
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
        <button
          onClick={() => router.push(`/profile/${post.author.id}`)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {false && (
              <div className="absolute -bottom-1 -right-1 bg-violet-600 rounded-full p-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{isOwnPost ? "Vous" : post.author.name}</h3>
            </div>
            <p className="text-xs text-gray-500">{getTimeAgo(post.timestamp)}</p>
          </div>
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Menu Dropdown */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 bg-black/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {isOwnPost ? (
                  // Menu for own posts
                  <div className="py-2">
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Modifier</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Supprimer</span>
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={handleSharePost}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Partager</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Link className="w-4 h-4" />
                      <span className="text-sm">Copier le lien</span>
                    </button>
                  </div>
                ) : (
                  // Menu for other users' posts
                  <div className="py-2">
                    {isFollowingAuthor ? (
                      <button
                        onClick={handleUnfollow}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span className="text-sm">Ne plus suivre</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="text-sm">Suivre</span>
                      </button>
                    )}
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={handleSharePost}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Partager</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Link className="w-4 h-4" />
                      <span className="text-sm">Copier le lien</span>
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={handleHide}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <EyeOff className="w-4 h-4" />
                      <span className="text-sm">Masquer</span>
                    </button>
                    <button
                      onClick={handleReport}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                      <span className="text-sm">Signaler</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-white">{post.content}</p>
      </div>

      {/* Images Grid - Facebook Style */}
      {(() => {
        // Get images array (support both old single image and new images array)
        const images = post.images || (post.image ? [post.image] : []);
        
        if (images.length === 0) return null;

        const handleImageClick = (index: number) => {
          setLightboxIndex(index);
          setShowLightbox(true);
        };

        // Single image - full width
        if (images.length === 1) {
          return (
            <div
              className="relative aspect-square sm:aspect-video overflow-hidden cursor-pointer"
              onClick={() => handleImageClick(0)}
            >
              <img
                src={images[0]}
                alt="Post"
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>
          );
        }

        // Two images - side by side
        if (images.length === 2) {
          return (
            <div className="grid grid-cols-2 gap-1">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={img}
                    alt={`Post ${index + 1}`}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
          );
        }

        // Five images - 2 on top, 3 on bottom (first bottom left, 2 others stacked right)
        if (images.length === 5) {
          const remainingCount = images.length > 5 ? images.length - 5 : 0;
          
          return (
            <div className="grid grid-cols-2 gap-1 aspect-video sm:aspect-[16/9]">
              {/* Top row - 2 images side by side */}
              {images.slice(0, 2).map((img, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={img}
                    alt={`Post ${index + 1}`}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
              
              {/* Bottom row - first image left, 2 others stacked right */}
              <div
                className="relative overflow-hidden cursor-pointer"
                onClick={() => handleImageClick(2)}
              >
                <img
                  src={images[2]}
                  alt="Post 3"
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </div>
              
              {/* Right side - 2 images stacked */}
              <div className="flex flex-col gap-1">
                {images.slice(3, 5).map((img, index) => {
                  const actualIndex = index + 3;
                  const isLast = index === 1;
                  const showBadge = isLast && remainingCount > 0;
                  
                  return (
                    <div
                      key={actualIndex}
                      className="relative flex-1 overflow-hidden cursor-pointer min-h-0"
                      onClick={() => handleImageClick(actualIndex)}
                    >
                      <img
                        src={img}
                        alt={`Post ${actualIndex + 1}`}
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      />
                      {showBadge && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-xl sm:text-2xl font-bold text-white">
                            +{remainingCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // Multiple images (3, 4, 6+) - Facebook style: main image left, others right stacked
        const mainImage = images[0];
        // Show max 3 images on the right
        const maxRightImages = 3;
        const rightImages = images.slice(1, maxRightImages + 1);
        const remainingCount = images.length > (1 + maxRightImages) ? images.length - (1 + maxRightImages) : 0;

        return (
          <div className="grid grid-cols-2 gap-1 aspect-video sm:aspect-[16/9]">
            {/* Main image - left side */}
            <div
              className="relative overflow-hidden cursor-pointer"
              onClick={() => handleImageClick(0)}
            >
              <img
                src={mainImage}
                alt="Post 1"
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>

            {/* Right side - stacked images */}
            <div className="flex flex-col gap-1">
              {rightImages.map((img, index) => {
                const actualIndex = index + 1;
                const isLast = index === rightImages.length - 1;
                const showBadge = isLast && remainingCount > 0;
                
                return (
                  <div
                    key={actualIndex}
                    className="relative flex-1 overflow-hidden cursor-pointer min-h-0"
                    onClick={() => handleImageClick(actualIndex)}
                  >
                    <img
                      src={img}
                      alt={`Post ${actualIndex + 1}`}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                    {showBadge && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                          +{remainingCount}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Actions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Heart className={`w-4 h-4 ${liked ? "fill-violet-500 text-violet-500" : ""}`} />
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
                ? "bg-violet-500/10 text-violet-500"
                : "bg-white/5 hover:bg-white/10 text-gray-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-violet-500" : ""}`} />
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
                  <div key={comment.id} className="space-y-3">
                    {/* Commentaire principal */}
                    <motion.div
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
                        <p className="text-sm text-gray-300 mb-2">{comment.content}</p>
                        {/* Boutons J'aime et Répondre */}
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              comment.isLiked
                                ? 'text-violet-400'
                                : 'text-gray-400 hover:text-violet-400'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likesCount || 0}</span>
                          </button>
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-400 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Répondre</span>
                          </button>
                        </div>
                        {/* Input de réponse */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={replyText[comment.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                              onKeyPress={(e) => e.key === "Enter" && handleAddReply(comment.id)}
                              placeholder="Écrire une réponse..."
                              className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                              autoFocus
                            />
                            <button
                              onClick={() => handleAddReply(comment.id)}
                              disabled={!replyText[comment.id]?.trim()}
                              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-white/10 disabled:text-gray-600 rounded-lg text-sm transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    {/* Réponses */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-13 space-y-2">
                        {comment.replies.map((reply) => (
                          <motion.div
                            key={reply.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3"
                          >
                            <img
                              src={reply.avatar}
                              alt={reply.author}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 bg-white/3 rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-xs">{reply.author}</span>
                                <span className="text-xs text-gray-500">
                                  {getTimeAgo(reply.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300">{reply.content}</p>
                              <button
                                onClick={() => handleCommentLike(reply.id)}
                                className={`flex items-center gap-1 text-xs mt-1 transition-colors ${
                                  reply.isLiked
                                    ? 'text-violet-400'
                                    : 'text-gray-400 hover:text-violet-400'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                <span>{reply.likesCount || 0}</span>
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {/* Bouton Charger plus */}
                {hasMoreComments && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMoreComments}
                      disabled={loadingMoreComments}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
                    >
                      {loadingMoreComments ? 'Chargement...' : 'Charger plus'}
                    </button>
                  </div>
                )}
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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`}
        title={post.content.substring(0, 100)}
        description={post.content}
      />

      {/* Image Lightbox */}
      {(() => {
        const images = post.images || (post.image ? [post.image] : []);
        if (images.length === 0) return null;
        
        return (
          <ImageLightbox
            images={images}
            initialIndex={lightboxIndex}
            isOpen={showLightbox}
            onClose={() => setShowLightbox(false)}
          />
        );
      })()}

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={post}
        onPostUpdated={handlePostUpdated}
      />
    </motion.div>
  );
}
