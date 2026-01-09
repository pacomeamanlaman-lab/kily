"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, Play, Send, X, Edit, Trash2, Flag, EyeOff, Copy, UserPlus, UserMinus, Link, User } from "lucide-react";
import ShareModal from "@/components/share/ShareModal";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Video } from "@/lib/videoData";
import Toast from "@/components/ui/Toast";
import { isVideoLiked, getVideoLikesCount, toggleVideoLike, initVideoLikesCount } from "@/lib/videoLikes";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { loadVideoComments, addVideoComment, type VideoComment } from "@/lib/supabase/videos.service";
import { deleteVideo, updateVideo } from "@/lib/videos";
import EditVideoModal from "@/components/video/EditVideoModal";
import { toggleFollow, isFollowing } from "@/lib/follows";
import { hideVideo } from "@/lib/hiddenContent";
import { createReport, hasUserReported } from "@/lib/reports";

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
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id || null;
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Check if video belongs to current user
  const isOwnVideo = currentUserId === video.author.id;
  
  // Debug: log thumbnail info
  useEffect(() => {
    if (video.thumbnail) {
      console.log('Video thumbnail:', {
        hasThumbnail: !!video.thumbnail,
        isDataUrl: video.thumbnail.startsWith('data:'),
        isBlob: video.thumbnail.startsWith('blob:'),
        thumbnailLength: video.thumbnail.length,
      });
    }
  }, [video.thumbnail]);

  // Load existing comments and likes on mount
  useEffect(() => {
    const loadComments = async () => {
      setLoadingComments(true);
      try {
        const videoComments = await loadVideoComments(video.id);
        // Transform Supabase comments to frontend Comment format
        const transformedComments: Comment[] = videoComments.map((vc: VideoComment) => ({
          id: vc.id,
          author: vc.author ? `${vc.author.first_name} ${vc.author.last_name}` : 'Utilisateur',
          avatar: vc.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${vc.author?.first_name || 'user'}`,
          content: vc.content,
          timestamp: vc.created_at,
        }));
        setComments(transformedComments);
      } catch (error) {
        console.error('Erreur chargement commentaires:', error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
    
    // Initialize likes count in localStorage
    initVideoLikesCount(video.id, video.likes);
    
    // Load liked state and count from localStorage
    setLiked(isVideoLiked(video.id));
    setLikesCount(getVideoLikesCount(video.id, video.likes));
    
    // Check if following author
    if (currentUserId && video.author.id && video.author.id !== currentUserId) {
      const following = isFollowing(currentUserId, video.author.id);
      setIsFollowingAuthor(following);
    }
  }, [video.id, video.likes, currentUserId, video.author.id]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleVideoLike(video.id, likesCount);
    setLiked(result.liked);
    setLikesCount(result.likesCount);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoUrl = `${window.location.origin}/video/${video.id}`;
    navigator.clipboard.writeText(videoUrl);
    setShowMenu(false);
    setToast({
      message: "Lien copié dans le presse-papiers",
      type: "success",
      visible: true,
    });
  };

  const handleShareVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowShareModal(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    
    // Delete video from localStorage
    const deleted = deleteVideo(video.id);
    
    if (deleted) {
      setToast({
        message: "Vidéo supprimée",
        type: "success",
        visible: true,
      });
      
      // Dispatch event to refresh feed
      window.dispatchEvent(new CustomEvent('videoDeleted', { detail: { videoId: video.id } }));
    } else {
      setToast({
        message: "Erreur lors de la suppression",
        type: "error",
        visible: true,
      });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleVideoUpdated = () => {
    // Dispatch event to refresh feed
    window.dispatchEvent(new CustomEvent('videoUpdated', { detail: { videoId: video.id } }));
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    
    setShowMenu(false);
    
    // Check if already reported
    if (hasUserReported(video.id, currentUserId)) {
      setToast({
        message: "Vous avez déjà signalé cette vidéo",
        type: "info",
        visible: true,
      });
      return;
    }
    
    // Create report
    createReport(
      "video",
      video.id,
      currentUserId,
      "Contenu inapproprié",
      "Signalement depuis le menu de la vidéo"
    );
    
    setToast({
      message: "Vidéo signalée. Merci pour votre vigilance.",
      type: "success",
      visible: true,
    });
    
    // Dispatch event to refresh feed (hide the video)
    window.dispatchEvent(new CustomEvent('videoReported', { detail: { videoId: video.id } }));
  };

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    
    // Hide video
    const hidden = hideVideo(video.id);
    
    if (hidden) {
      setToast({
        message: "Vidéo masquée",
        type: "success",
        visible: true,
      });
      
      // Dispatch event to refresh feed
      window.dispatchEvent(new CustomEvent('videoHidden', { detail: { videoId: video.id } }));
    } else {
      setToast({
        message: "Erreur lors du masquage",
        type: "error",
        visible: true,
      });
    }
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId || !video.author.id) return;
    
    setShowMenu(false);
    const result = toggleFollow(currentUserId, video.author.id);
    setIsFollowingAuthor(result.following);
    
    setToast({
      message: `Vous suivez maintenant ${video.author.name}`,
      type: "success",
      visible: true,
    });
  };

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId || !video.author.id) return;
    
    setShowMenu(false);
    const result = toggleFollow(currentUserId, video.author.id);
    setIsFollowingAuthor(result.following);
    
    setToast({
      message: `Vous ne suivez plus ${video.author.name}`,
      type: "info",
      visible: true,
    });
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
        author: `${currentUser.first_name} ${currentUser.last_name}`,
        avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.first_name}${currentUser.last_name}`,
        content: commentText,
        timestamp: new Date().toISOString(),
      };

      setComments([...comments, optimisticComment]);
      setCommentText("");

      // Save to Supabase
      const savedComment = await addVideoComment(
        video.id,
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
        <button
          onClick={() => router.push(`/profile/${video.author.id}`)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
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
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{isOwnVideo ? "Vous" : video.author.name}</h3>
            </div>
            <p className="text-sm text-gray-400 capitalize">{video.category}</p>
            <p className="text-xs text-gray-500">{getTimeAgo(video.createdAt)}</p>
          </div>
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
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
                onClick={(e) => e.stopPropagation()}
              >
                {isOwnVideo ? (
                  // Menu for own videos
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
                      onClick={handleShareVideo}
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
                  // Menu for other users' videos
                  <div className="py-2">
                    <button
                      onClick={handleFollow}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-sm">Suivre</span>
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={handleShareVideo}
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
        <p className="text-white">{video.description}</p>
      </div>

      {/* Video Thumbnail */}
      <div 
        className="relative aspect-square sm:aspect-video overflow-hidden cursor-pointer group bg-black"
        onClick={onClick}
      >
        {/* Check if thumbnail is a data URL (base64) or regular URL */}
        {video.thumbnail && (video.thumbnail.startsWith('data:image') || video.thumbnail.startsWith('blob:')) ? (
          // Use regular img for data URLs and blob URLs
          <img
            src={video.thumbnail}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading thumbnail image:', e);
              // Fallback to placeholder if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : video.thumbnail && video.thumbnail.startsWith('data:video') ? (
          // If thumbnail is actually a video data URL, try to use it as background
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${video.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : video.thumbnail ? (
          // Use Next.js Image for regular URLs
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={video.thumbnail.startsWith('http://') || video.thumbnail.startsWith('https://') ? false : true}
            onError={() => {
              console.error('Error loading thumbnail with Next.js Image');
            }}
          />
        ) : (
          // Fallback: show video URL as background or placeholder
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-gray-900 flex items-center justify-center">
            <Play className="w-16 h-16 text-white/50" />
          </div>
        )}
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
        <div className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white">
          {video.duration || "0:00"}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Heart className={`w-4 h-4 ${liked ? "fill-violet-500 text-violet-500" : ""}`} />
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
                {loadingComments ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
                    <p>Chargement des commentaires...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun commentaire pour le moment</p>
                    <p className="text-sm mt-1">Soyez le premier à commenter !</p>
                  </div>
                ) : null}

                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={comment.avatar}
                        alt={comment.author}
                        fill
                        className="object-cover"
                        sizes="40px"
                        onError={(e) => {
                          // Fallback vers un avatar par défaut si l'image ne charge pas
                          const target = e.target as HTMLImageElement;
                          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`;
                        }}
                      />
                    </div>
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
                  {currentUser ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.first_name}${currentUser.last_name}`}
                        alt={currentUser.first_name || "Vous"}
                        fill
                        className="object-cover"
                        sizes="40px"
                        onError={(e) => {
                          // Fallback vers un avatar par défaut si l'image ne charge pas
                          const target = e.target as HTMLImageElement;
                          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.first_name}${currentUser.last_name}`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
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
        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/video/${video.id}`}
        title={video.title}
        description={video.description}
      />

      {/* Edit Video Modal */}
      <EditVideoModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        video={video}
        onVideoUpdated={handleVideoUpdated}
      />

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

