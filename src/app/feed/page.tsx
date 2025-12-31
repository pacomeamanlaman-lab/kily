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
} from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import StoryCarousel from "@/components/feed/StoryCarousel";
import { mockPosts, mockStories } from "@/lib/feedData";
import { mockVideos } from "@/lib/videoData";
import VideoCard from "@/components/video/VideoCard";
import VideoCardFeed from "@/components/video/VideoCardFeed";
import VideoPlayer from "@/components/video/VideoPlayer";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "following" | "trending">("all");
  const [followedTalents, setFollowedTalents] = useState<Set<number>>(new Set());
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [unreadNotifications] = useState(5); // Mock notifications count
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

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
      return mockPosts;
    }

    if (filter === "following") {
      // Show posts from followed talents only
      const followedAuthorIds = suggestedTalents
        .filter((talent) => followedTalents.has(talent.id))
        .map((talent) => talent.postAuthorId);

      const filtered = mockPosts.filter((post) =>
        followedAuthorIds.includes(post.author.id)
      );

      return filtered.length > 0 ? filtered : mockPosts; // Fallback to all if no followed
    }

    if (filter === "trending") {
      // Sort by likes (descending)
      return [...mockPosts].sort((a, b) => b.likes - a.likes);
    }

    return mockPosts;
  }, [filter, followedTalents]);

  // Create mixed feed of posts and videos
  const mixedFeed = useMemo(() => {
    const feed: Array<{ type: "post" | "video"; data: any; id: string }> = [];
    let postIndex = 0;
    let videoIndex = 0;

    // Alternate: 2 posts, 1 video, 2 posts, 1 video...
    for (let i = 0; i < Math.max(filteredPosts.length, mockVideos.length * 2); i++) {
      if (i % 3 === 2 && videoIndex < mockVideos.length) {
        // Every 3rd item is a video
        feed.push({
          type: "video",
          data: mockVideos[videoIndex],
          id: `video-${mockVideos[videoIndex].id}`,
        });
        videoIndex++;
      } else if (postIndex < filteredPosts.length) {
        // Otherwise, add a post
        feed.push({
          type: "post",
          data: filteredPosts[postIndex],
          id: `post-${filteredPosts[postIndex].id}`,
        });
        postIndex++;
      }
    }

    return feed;
  }, [filteredPosts]);

  const handleVideoClick = (videoId: string) => {
    const videoIndex = mockVideos.findIndex((v) => v.id === videoId);
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

  const leftMenuItems = [
    { icon: Home, label: "Accueil", path: "/feed", active: true },
    { icon: Compass, label: "Découvrir", path: "/discover" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: User, label: "Profil", path: "/profile" },
    { icon: BookMarked, label: "Sauvegardés", path: "/recruiter/dashboard?tab=saved" },
    { icon: Users, label: "Communautés", path: "#" },
  ];

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
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10 lg:hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold">Kily</h1>
            </div>
            <button className="relative p-2 text-violet-400 hover:text-violet-300 transition-colors">
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0 -right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
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
          <div className="sticky top-20 space-y-2">
            {/* Navigation */}
            {leftMenuItems.map((item) => {
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
        </div>

        {/* Main Feed */}
        <div className="flex-1 max-w-2xl">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
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

          {/* Stories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <StoryCarousel stories={mockStories} />
          </motion.div>

          {/* Mixed Feed - Posts & Videos */}
          <div className="space-y-6">
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
          <div className="sticky top-6 space-y-6">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <StoryCarousel stories={mockStories} />
        </motion.div>

        {/* Mixed Feed - Posts & Videos */}
        <div className="space-y-6">
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
        videos={mockVideos}
        initialIndex={selectedVideoIndex}
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
      />
    </div>
  );
}
