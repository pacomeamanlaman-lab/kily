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
} from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import StoryCarousel from "@/components/feed/StoryCarousel";
import { mockPosts, mockStories } from "@/lib/feedData";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "following" | "trending">("all");
  const [followedTalents, setFollowedTalents] = useState<Set<number>>(new Set());
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisiblePosts((prev) => {
            if (prev < filteredPosts.length) {
              return Math.min(prev + 2, filteredPosts.length);
            }
            return prev;
          });
        }
      },
      {
        root: null,
        rootMargin: '400px',
        threshold: 0
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [filteredPosts.length, visiblePosts]);

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
    <div className="min-h-screen bg-black text-white pb-20 lg:pb-0">
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
            <button className="text-sm text-violet-500 hover:text-violet-400 transition-colors">
              Notifications
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
          <div className="sticky top-6 space-y-2">
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 py-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Kily</span>
            </div>

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

          {/* Feed Posts */}
          <div className="space-y-6">
            {filteredPosts.slice(0, visiblePosts).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}

            {/* Infinite Scroll Trigger */}
            {visiblePosts < filteredPosts.length && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            )}
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

        {/* Feed Posts */}
        <div className="space-y-6">
          {filteredPosts.slice(0, visiblePosts).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}

          {/* Infinite Scroll Trigger */}
          {visiblePosts < filteredPosts.length && (
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          )}
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

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
