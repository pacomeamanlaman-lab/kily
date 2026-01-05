"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Filter,
  UserPlus,
  UserCheck,
  Home,
  Compass,
  MessageCircle,
  User,
  BookMarked,
  Users,
  Calendar,
  MapPin,
  Code,
  Flame,
  Bell,
  FileText,
  Video,
  Briefcase,
  Search,
  LayoutDashboard,
  Heart,
  ChevronDown,
  ChevronUp,
  Menu,
} from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import StoryCarousel from "@/components/feed/StoryCarousel";
import CreatePostButton from "@/components/feed/CreatePostButton";
import { mockStories } from "@/lib/feedData";
import { loadPosts } from "@/lib/posts";
import { loadVideos } from "@/lib/videos";
import { getHiddenPosts, getHiddenVideos } from "@/lib/hiddenContent";
import VideoCard from "@/components/video/VideoCard";
import VideoCardFeed from "@/components/video/VideoCardFeed";
import VideoPlayer from "@/components/video/VideoPlayer";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import NotificationsSidebar from "@/components/notifications/NotificationsSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FeedBottomSheet from "@/components/feed/FeedBottomSheet";
import FeedTour from "@/components/feed/FeedTour";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function FeedPageContent() {
  const router = useRouter();
  const scrollDirection = useScrollDirection({ threshold: 10 });
  const [filter, setFilter] = useState<"all" | "following" | "trending">("all");
  const [followedTalents, setFollowedTalents] = useState<Set<number>>(new Set());
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [unreadNotifications] = useState(5); // Mock notifications count
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    talent: true,
    recruiter: true,
    neighbor: true,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Get current user to check if they can publish
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const canPublish = currentUser?.user_type === "talent";

  // Load posts and videos from localStorage on mount and when window gets focus
  useEffect(() => {
    const loadedPosts = loadPosts();
    const loadedVideos = loadVideos();
    setPosts(loadedPosts);
    setVideos(loadedVideos);
  }, []);

  // Refresh posts and videos when window gains focus (after creating a post/video)
  useEffect(() => {
    const handleFocus = () => {
      const loadedPosts = loadPosts();
      const loadedVideos = loadVideos();
      setPosts(loadedPosts);
      setVideos(loadedVideos);
    };

    window.addEventListener('focus', handleFocus);

    // Listen for custom events from the modals
    const handlePostCreated = () => {
      const loadedPosts = loadPosts();
      setPosts(loadedPosts);
    };

    const handleVideoCreated = () => {
      const loadedVideos = loadVideos();
      setVideos(loadedVideos);
    };

    const handlePostDeleted = () => {
      const loadedPosts = loadPosts();
      const loadedVideos = loadVideos();
      setPosts(loadedPosts);
      setVideos(loadedVideos);
    };

    const handleVideoDeleted = () => {
      const loadedPosts = loadPosts();
      const loadedVideos = loadVideos();
      setPosts(loadedPosts);
      setVideos(loadedVideos);
    };

    const handlePostHidden = () => {
      const loadedPosts = loadPosts();
      setPosts(loadedPosts);
    };

    const handleVideoHidden = () => {
      const loadedVideos = loadVideos();
      setVideos(loadedVideos);
    };

    const handlePostReported = () => {
      const loadedPosts = loadPosts();
      setPosts(loadedPosts);
    };

    const handleVideoReported = () => {
      const loadedVideos = loadVideos();
      setVideos(loadedVideos);
    };

    const handlePostUpdated = () => {
      const loadedPosts = loadPosts();
      setPosts(loadedPosts);
    };

    const handleVideoUpdated = () => {
      const loadedVideos = loadVideos();
      setVideos(loadedVideos);
    };

    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('videoCreated', handleVideoCreated);
    window.addEventListener('postDeleted', handlePostDeleted);
    window.addEventListener('videoDeleted', handleVideoDeleted);
    window.addEventListener('postHidden', handlePostHidden);
    window.addEventListener('videoHidden', handleVideoHidden);
    window.addEventListener('postReported', handlePostReported);
    window.addEventListener('videoReported', handleVideoReported);
    window.addEventListener('postUpdated', handlePostUpdated);
    window.addEventListener('videoUpdated', handleVideoUpdated);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('videoCreated', handleVideoCreated);
      window.removeEventListener('postDeleted', handlePostDeleted);
      window.removeEventListener('videoDeleted', handleVideoDeleted);
      window.removeEventListener('postHidden', handlePostHidden);
      window.removeEventListener('videoHidden', handleVideoHidden);
      window.removeEventListener('postReported', handlePostReported);
      window.removeEventListener('videoReported', handleVideoReported);
      window.removeEventListener('postUpdated', handlePostUpdated);
      window.removeEventListener('videoUpdated', handleVideoUpdated);
    };
  }, []);

  // Video player state
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostElementRefDesktop = useRef<HTMLDivElement | null>(null);
  const lastPostElementRefMobile = useRef<HTMLDivElement | null>(null);
  const [observerKey, setObserverKey] = useState(0);

  // Pull to refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { value: "all" as const, label: "Tous", icon: Sparkles },
    { value: "following" as const, label: "Abonnements", icon: TrendingUp },
    { value: "trending" as const, label: "Tendances", icon: Filter },
  ];

  const suggestedTalents = [
    {
      id: 1,
      name: "Sarah Mensah",
      skill: "Designer graphique",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      postAuthorId: "1", // Amina Koné
    },
    {
      id: 2,
      name: "Ibrahim Diop",
      skill: "Plombier",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      postAuthorId: "2", // Kofi Mensah
    },
    {
      id: 3,
      name: "Aïcha Kamara",
      skill: "Pâtissière",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      postAuthorId: "3", // Fatoumata Diallo
    },
  ];

  // Filter posts based on selected filter
  const filteredPosts = useMemo(() => {
    if (filter === "all") {
      return posts;
    }

    if (filter === "following") {
      // Show posts from followed talents only
      const followedAuthorIds = suggestedTalents
        .filter((talent) => followedTalents.has(talent.id))
        .map((talent) => talent.postAuthorId);

      const filtered = posts.filter((post) =>
        followedAuthorIds.includes(post.author.id)
      );

      return filtered.length > 0 ? filtered : posts; // Fallback to all if no followed
    }

    if (filter === "trending") {
      // Sort by likes (descending)
      return [...posts].sort((a, b) => b.likes - a.likes);
    }

    return posts;
  }, [filter, followedTalents, posts]);

  // Get hidden content IDs
  const hiddenPosts = getHiddenPosts();
  const hiddenVideos = getHiddenVideos();

  // Create mixed feed of posts and videos, sorted by date (newest first), excluding hidden content
  const mixedFeed = useMemo(() => {
    const feed: Array<{ type: "post" | "video"; data: any; id: string; timestamp: number }> = [];

    // Add all posts (excluding hidden ones)
    filteredPosts
      .filter((post) => !hiddenPosts.includes(post.id))
      .forEach((post) => {
        feed.push({
          type: "post",
          data: post,
          id: `post-${post.id}`,
          timestamp: new Date(post.timestamp || post.createdAt || 0).getTime(),
        });
      });

    // Add all videos (excluding hidden ones)
    videos
      .filter((video) => !hiddenVideos.includes(video.id))
      .forEach((video) => {
        feed.push({
          type: "video",
          data: video,
          id: `video-${video.id}`,
          timestamp: new Date(video.createdAt || 0).getTime(),
        });
      });

    // Sort by timestamp (newest first)
    feed.sort((a, b) => b.timestamp - a.timestamp);

    return feed;
  }, [filteredPosts, videos, hiddenPosts, hiddenVideos]);

  const handleVideoClick = (videoId: string) => {
    const videoIndex = videos.findIndex((v) => v.id === videoId);
    if (videoIndex !== -1) {
      setSelectedVideoIndex(videoIndex);
      setIsVideoPlayerOpen(true);
    }
  };

  // Reset visible posts when filter changes
  useEffect(() => {
    setVisiblePosts(3);
  }, [filter]);

  // Set up and manage intersection observer
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Create observer callback
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setVisiblePosts((prev) => {
          const currentLength = filteredPosts.length;
          if (prev < currentLength) {
            return Math.min(prev + 2, currentLength);
          }
          return prev;
        });
      }
    };

    // Only set up observer if there are more posts to load
    if (visiblePosts < filteredPosts.length) {
      // Set up observer
      observerRef.current = new IntersectionObserver(observerCallback, {
        rootMargin: "200px",
        threshold: 0.1,
      });

      // Observe both desktop and mobile elements (only the visible one will trigger)
      if (lastPostElementRefDesktop.current) {
        observerRef.current.observe(lastPostElementRefDesktop.current);
      }
      if (lastPostElementRefMobile.current) {
        observerRef.current.observe(lastPostElementRefMobile.current);
      }
    } else {
      // All posts loaded, ensure observer is cleaned up
      observerRef.current = null;
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [visiblePosts, filteredPosts.length, observerKey]);

  // Handle window resize to update observer when switching between mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setObserverKey((prev) => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const lastPostRefDesktop = useCallback((node: HTMLDivElement | null) => {
    lastPostElementRefDesktop.current = node;
    // Trigger observer re-setup when ref changes
    if (node) {
      setObserverKey((prev) => prev + 1);
    }
  }, []);

  const lastPostRefMobile = useCallback((node: HTMLDivElement | null) => {
    lastPostElementRefMobile.current = node;
    // Trigger observer re-setup when ref changes
    if (node) {
      setObserverKey((prev) => prev + 1);
    }
  }, []);

  const handleFollow = (talentId: number, talentName: string) => {
    const isFollowing = followedTalents.has(talentId);

    if (isFollowing) {
      setFollowedTalents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(talentId);
        return newSet;
      });
      setToast({
        message: `Vous ne suivez plus ${talentName}`,
        type: "info",
        visible: true,
      });
    } else {
      setFollowedTalents((prev) => new Set(prev).add(talentId));
      setToast({
        message: `Vous suivez maintenant ${talentName}`,
        type: "success",
        visible: true,
      });
    }
  };

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollableRef.current && scrollableRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === 0) return;

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;

    if (distance > 0 && scrollableRef.current && scrollableRef.current.scrollTop === 0) {
      setPullDistance(Math.min(distance, 100));
      if (distance > 80) {
        setIsPulling(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling) {
      // Simulate refresh
      setToast({
        message: "Actualisation en cours...",
        type: "info",
        visible: true,
      });

      setTimeout(() => {
        setToast({
          message: "Contenu actualisé !",
          type: "success",
          visible: true,
        });
      }, 1000);
    }

    touchStartY.current = 0;
    setPullDistance(0);
    setIsPulling(false);
  };

  // Navigation principale (commune à tous)
  const mainNavigation = [
    { icon: Home, label: "Accueil", path: "/feed", active: true },
    { icon: Compass, label: "Découvrir", path: "/discover" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: User, label: "Profil", path: "/profile" },
  ];

  // Sections spécifiques selon le type d'utilisateur
  const getSpecificSection = () => {
    if (!currentUser) return null;

    switch (currentUser?.user_type) {
      case "talent":
        return {
          title: "Mes contenus",
          items: [
            { icon: FileText, label: "Mes posts", path: "/profile?tab=posts" },
            { icon: Video, label: "Mes vidéos", path: "/profile?tab=videos" },
          ],
          key: "talent",
        };
      case "recruiter":
        return {
          title: "Recherche",
          items: [
            { icon: Heart, label: "Talents sauvegardés", path: "/recruiter/dashboard?tab=saved", badge: 0 },
            { icon: Search, label: "Recherche avancée", path: "/discover" },
            { icon: LayoutDashboard, label: "Dashboard", path: "/recruiter/dashboard" },
          ],
          key: "recruiter",
        };
      case "neighbor":
        return {
          title: "Services",
          items: [
            { icon: BookMarked, label: "Services sauvegardés", path: "/profile?tab=saved" },
            { icon: Briefcase, label: "Demandes actives", path: "/profile?tab=requests" },
          ],
          key: "neighbor",
        };
      default:
        return null;
    }
  };

  const specificSection = getSpecificSection();
  const isSectionExpanded = specificSection ? expandedSections[specificSection.key] : false;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const trendingSkills = [
    { icon: Code, label: "Développement Web", count: 234 },
    { icon: Sparkles, label: "Design Graphique", count: 189 },
    { icon: Calendar, label: "Organisation Événements", count: 156 },
  ];

  const activeCities = [
    { name: "Abidjan", flag: "🇨🇮", count: 456 },
    { name: "Lagos", flag: "🇳🇬", count: 389 },
    { name: "Accra", flag: "🇬🇭", count: 298 },
    { name: "Dakar", flag: "🇸🇳", count: 267 },
  ];

  return (
    <div
      className="min-h-screen bg-black text-white pb-20 lg:pb-0"
      ref={scrollableRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center lg:hidden"
          style={{
            height: `${pullDistance}px`,
            opacity: pullDistance / 100,
            transition: isPulling ? 'none' : 'all 0.3s ease-out'
          }}
        >
          <div className="bg-violet-600 text-white rounded-full p-2">
            <motion.div
              animate={{ rotate: isPulling ? 360 : 0 }}
              transition={{ duration: 0.5, repeat: isPulling ? Infinity : 0, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <div
        className={`sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10 lg:hidden transition-transform duration-300 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold">Kily</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-violet-400 hover:text-violet-300 transition-colors ${
                  showNotifications ? "bg-white/10" : ""
                }`}
              >
                <Bell className="w-6 h-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0 -right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowBottomSheet(true)}
                className="relative p-2 text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div data-tour="filters" className="flex items-center gap-2 overflow-x-auto horizontal-scrollbar pb-1">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filter === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Layout - 3 Columns */}
      <div className="hidden lg:flex max-w-[1400px] mx-auto gap-6 pt-6">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Navigation principale */}
            <div className="space-y-2">
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      item.active
                        ? "bg-violet-600 text-white"
                        : "hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section spécifique (pliable) */}
            {specificSection && (
              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={() => toggleSection(specificSection.key)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {specificSection.title}
                  </span>
                  {isSectionExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {isSectionExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1"
                  >
                    {specificSection.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            // Mark that we're coming from feed for auto-scroll
                            if (item.path.includes("/profile") || item.path.includes("/recruiter/dashboard")) {
                              sessionStorage.setItem("scrollToProfileTab", "true");
                            }
                            router.push(item.path);
                          }}
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="px-2 py-0.5 bg-violet-500 text-white text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 max-w-2xl">
          {/* Filter Tabs */}
          <div data-tour="filters" className="flex items-center gap-2 mb-6 overflow-x-auto horizontal-scrollbar pb-1">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filter === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Create Post Button - Only for Talents */}
          {canPublish && (
            <div data-tour="create-post">
              <CreatePostButton
                userAvatar={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"}
                userName={currentUser?.first_name || "Vous"}
              />
            </div>
          )}

          {/* Stories */}
          <motion.div
            data-tour="stories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <StoryCarousel stories={mockStories} />
          </motion.div>

          {/* Mixed Feed - Posts & Videos */}
          <div data-tour="posts" className="space-y-6">
            {mixedFeed.slice(0, visiblePosts).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.type === "post" ? (
                  <PostCard post={item.data} />
                ) : (
                  <VideoCardFeed
                    video={item.data}
                    onClick={() => handleVideoClick(item.data.id)}
                  />
                )}
              </motion.div>
            ))}

            {/* Infinite Scroll Trigger */}
            {visiblePosts < filteredPosts.length ? (
              <div 
                ref={lastPostRefDesktop} 
                className="h-20 flex items-center justify-center"
                key="infinite-scroll-trigger-desktop"
              >
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="h-20 flex items-center justify-center">
                <p className="text-sm text-gray-500">Vous avez vu tous les posts</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-20 space-y-6">
            {/* Suggestions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Talents suggérés</h2>
              <div className="space-y-4">
                {suggestedTalents.map((talent) => {
                  const isFollowing = followedTalents.has(talent.id);

                  return (
                    <div
                      key={talent.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={talent.avatar}
                          alt={talent.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-sm">{talent.name}</p>
                          <p className="text-xs text-gray-400">{talent.skill}</p>
                        </div>
                      </div>
                      <Button
                        variant={isFollowing ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => handleFollow(talent.id, talent.name)}
                      >
                        {isFollowing ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trending Skills */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold">Tendances</h2>
              </div>
              <div className="space-y-3">
                {trendingSkills.map((skill, index) => {
                  const Icon = skill.icon;
                  return (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium">{skill.label}</span>
                      </div>
                      <span className="text-xs text-gray-400">{skill.count} talents</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Cities */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-bold">Villes actives</h2>
              </div>
              <div className="space-y-2">
                {activeCities.map((city, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all"
                  >
                    <span className="text-sm font-medium">{city.name}</span>
                    <span className="text-xs text-gray-400">{city.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Stories */}
        <motion.div
          data-tour="stories"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <StoryCarousel stories={mockStories} />
        </motion.div>

        {/* Mixed Feed - Posts & Videos */}
        <div data-tour="posts" className="space-y-6">
          {mixedFeed.slice(0, visiblePosts).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.type === "post" ? (
                <PostCard post={item.data} />
              ) : (
                <VideoCardFeed
                  video={item.data}
                  onClick={() => handleVideoClick(item.data.id)}
                />
              )}
            </motion.div>
          ))}

          {/* Infinite Scroll Trigger */}
          {visiblePosts < filteredPosts.length ? (
            <div 
              ref={lastPostRefMobile} 
              className="h-20 flex items-center justify-center"
              key="infinite-scroll-trigger-mobile"
            >
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="h-20 flex items-center justify-center">
              <p className="text-sm text-gray-500">Vous avez vu tous les posts</p>
            </div>
          ) : null}
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold mb-4">Talents suggérés</h2>
          <div className="space-y-4">
            {suggestedTalents.map((talent, index) => {
              const isFollowing = followedTalents.has(talent.id);

              return (
                <div
                  key={talent.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">{talent.name}</p>
                      <p className="text-xs text-gray-400">{talent.skill}</p>
                    </div>
                  </div>
                  <Button
                    variant={isFollowing ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleFollow(talent.id, talent.name)}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Suivi</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Suivre</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayer
        videos={videos}
        initialIndex={selectedVideoIndex}
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
      />

      {/* Notifications Sidebar */}
      <NotificationsSidebar
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Bottom Sheet */}
      <FeedBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
      />

      {/* Feed Tour */}
      <FeedTour />
    </div>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedPageContent />
    </ProtectedRoute>
  );
}
