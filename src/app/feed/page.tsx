"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Filter, UserPlus, UserCheck } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import StoryCarousel from "@/components/feed/StoryCarousel";
import { mockPosts, mockStories } from "@/lib/feedData";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useState } from "react";

export default function FeedPage() {
  const [filter, setFilter] = useState<"all" | "following" | "trending">("all");
  const [followedTalents, setFollowedTalents] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

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
    },
    {
      id: 2,
      name: "Ibrahim Diop",
      skill: "Plombier",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    {
      id: 3,
      name: "Aïcha Kamara",
      skill: "Pâtissière",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
  ];

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

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10">
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

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
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
          {mockPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}

          {/* Load More */}
          <div className="flex justify-center pt-6">
            <Button variant="secondary" className="w-full sm:w-auto">
              Charger plus de contenu
            </Button>
          </div>
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
