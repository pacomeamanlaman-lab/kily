"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, Users, FileText, User, RefreshCw, Video, ChevronDown, MapPin } from "lucide-react";
import { skillCategories, cities } from "@/lib/mockData";
import { coteIvoireCities } from "@/lib/locationData";
import { mockPosts } from "@/lib/feedData";
import { mockVideos } from "@/lib/videoData";
import { useRouter, useSearchParams } from "next/navigation";
import TalentCard from "@/components/talent/TalentCard";
import PostCard from "@/components/feed/PostCard";
import VideoCard from "@/components/video/VideoCard";
import VideoPlayer from "@/components/video/VideoPlayer";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getAllTalents } from "@/lib/supabase/users.service";
import { Talent } from "@/types";

function DiscoverPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollDirection = useScrollDirection({ threshold: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Pour les vidéos uniquement
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOtherCities, setShowOtherCities] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"talents" | "posts" | "videos" | "users">("talents");
  
  // État pour les talents réels
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loadingTalents, setLoadingTalents] = useState(true);

  // Liste de toutes les compétences depuis l'onboarding
  const allSkills = useMemo(() => {
    const predefinedSkills = {
      cuisine: ["Pâtisserie", "Cuisine africaine", "Street food", "Traiteur", "Boulangerie"],
      tech: ["Développement Web", "Design UI/UX", "Réparation téléphones", "Maintenance PC", "Photoshop"],
      artisanat: ["Bijoux", "Sculpture", "Poterie", "Décoration", "Vannerie"],
      bricolage: ["Plomberie", "Électricité", "Menuiserie", "Peinture", "Maçonnerie"],
      mecanique: ["Réparation auto", "Mécanique moto", "Soudure", "Carrosserie", "Climatisation"],
      photographie: ["Photo événementiel", "Portrait", "Retouche photo", "Vidéographie", "Drone"],
      couture: ["Couture sur mesure", "Retouche vêtements", "Mode africaine", "Broderie", "Tapisserie"],
      coiffure: ["Coiffure afro", "Barbier", "Tresses", "Mèches", "Maquillage"],
      education: ["Cours particuliers", "Langues", "Musique", "Sport", "Informatique"],
    };
    return Object.values(predefinedSkills).flat();
  }, []);

  // Video player state
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // Infinite scroll state
  const [visibleItems, setVisibleItems] = useState({
    talents: 8,
    posts: 6,
    videos: 8,
    users: 10,
  });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRefDesktop = useRef<HTMLDivElement | null>(null);
  const lastItemRefMobile = useRef<HTMLDivElement | null>(null);
  const [observerKey, setObserverKey] = useState(0);
  const otherCitiesDropdownRef = useRef<HTMLDivElement | null>(null);

  // Pull to refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState({
    message: "",
    type: "success" as "success" | "error" | "info",
    visible: false,
  });

  // Reset visible items when tab or filters change
  useEffect(() => {
    setVisibleItems({
      talents: 8,
      posts: 6,
      videos: 8,
      users: 10,
    });
  }, [activeTab, searchQuery, selectedSkill, selectedCity]);

  // Charger les talents depuis Supabase
  useEffect(() => {
    const loadTalents = async () => {
      try {
        setLoadingTalents(true);
        const talentsData = await getAllTalents();
        setTalents(talentsData);
      } catch (error) {
        console.error('Erreur lors du chargement des talents:', error);
        setToast({
          message: "Erreur lors du chargement des talents",
          type: "error",
          visible: true,
        });
      } finally {
        setLoadingTalents(false);
      }
    };

    loadTalents();
  }, []);

  // Lire le paramètre skill depuis l'URL (pour compatibilité, on garde "category" mais on le mappe vers skill)
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      // Si c'est une compétence valide, on l'utilise directement
      if (allSkills.includes(categoryParam)) {
        setSelectedSkill(categoryParam);
      }
      setShowFilters(true);
    }
  }, [searchParams, allSkills]);

  // Fermer le dropdown "Autres villes" quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (otherCitiesDropdownRef.current && !otherCitiesDropdownRef.current.contains(event.target as Node)) {
        setShowOtherCities(false);
      }
    };

    if (showOtherCities) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOtherCities]);

  // Filtrage des talents
  const filteredTalents = useMemo(() => {
    return talents.filter((talent) => {
      // Filtre par recherche
      const matchesSearch =
        searchQuery === "" ||
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.skills.some((skill) =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Filtre par compétence
      const matchesSkill =
        !selectedSkill ||
        talent.skills.some((skill) => skill.name === selectedSkill);

      // Filtre par ville
      const matchesCity = !selectedCity || talent.location.city === selectedCity;

      return matchesSearch && matchesSkill && matchesCity;
    });
  }, [talents, searchQuery, selectedSkill, selectedCity]);

  // Filtrage des posts
  const filteredPosts = useMemo(() => {
    return mockPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery]);

  // Filtrage des utilisateurs (tous les auteurs de posts + talents)
  const filteredUsers = useMemo(() => {
    const users = [
      ...talents.map(t => ({
        id: t.id,
        name: t.name,
        avatar: t.avatar,
        type: "talent" as const,
        info: t.skills[0]?.name || "",
        location: t.location.city,
      })),
      ...mockPosts.map(p => ({
        id: p.author.id,
        name: p.author.name,
        avatar: p.author.avatar,
        type: "user" as const,
        info: "Utilisateur",
        location: "",
      }))
    ];

    // Retirer les doublons par ID
    const uniqueUsers = Array.from(
      new Map(users.map(u => [u.id, u])).values()
    );

    return uniqueUsers.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [talents, searchQuery]);

  // Filtrage des vidéos
  const filteredVideos = useMemo(() => {
    return mockVideos.filter((video) => {
      const matchesSearch =
        searchQuery === "" ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.author.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || video.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleVideoClick = (videoId: string) => {
    const videoIndex = mockVideos.findIndex((v) => v.id === videoId);
    if (videoIndex !== -1) {
      setSelectedVideoIndex(videoIndex);
      setIsVideoPlayerOpen(true);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSkill(null);
    setSelectedCategory(null);
    setSelectedCity(null);
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

  const handleTouchEnd = async () => {
    if (isPulling) {
      setToast({
        message: "Actualisation en cours...",
        type: "info",
        visible: true,
      });

      // Recharger les talents si on est sur l'onglet talents
      if (activeTab === "talents") {
        try {
          setLoadingTalents(true);
          const talentsData = await getAllTalents();
          setTalents(talentsData);
        } catch (error) {
          console.error('Erreur lors du rechargement des talents:', error);
        } finally {
          setLoadingTalents(false);
        }
      }

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

  // Get current filtered items based on active tab
  const getCurrentFilteredItems = () => {
    switch (activeTab) {
      case "talents":
        return filteredTalents;
      case "posts":
        return filteredPosts;
      case "videos":
        return filteredVideos;
      case "users":
        return filteredUsers;
      default:
        return [];
    }
  };

  const currentFilteredItems = getCurrentFilteredItems();
  const currentVisibleCount = visibleItems[activeTab];

  // Set up and manage intersection observer for infinite scroll
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Create observer callback
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setVisibleItems((prev) => {
          const currentLength = currentFilteredItems.length;
          const currentCount = prev[activeTab];
          
          if (currentCount < currentLength) {
            // Load more items based on tab type
            const increment = activeTab === "posts" ? 3 : activeTab === "users" ? 5 : 8;
            return {
              ...prev,
              [activeTab]: Math.min(currentCount + increment, currentLength),
            };
          }
          return prev;
        });
      }
    };

    // Only set up observer if there are more items to load
    if (currentVisibleCount < currentFilteredItems.length) {
      // Set up observer
      observerRef.current = new IntersectionObserver(observerCallback, {
        rootMargin: "200px",
        threshold: 0.1,
      });

      // Observe both desktop and mobile elements
      if (lastItemRefDesktop.current) {
        observerRef.current.observe(lastItemRefDesktop.current);
      }
      if (lastItemRefMobile.current) {
        observerRef.current.observe(lastItemRefMobile.current);
      }
    } else {
      // All items loaded, ensure observer is cleaned up
      observerRef.current = null;
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [currentVisibleCount, currentFilteredItems.length, activeTab, observerKey, filteredTalents.length, filteredPosts.length, filteredVideos.length, filteredUsers.length]);

  // Handle window resize to update observer when switching between mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setObserverKey((prev) => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const lastItemCallbackDesktop = useCallback((node: HTMLDivElement | null) => {
    lastItemRefDesktop.current = node;
    // Trigger observer re-setup when ref changes
    if (node) {
      setObserverKey((prev) => prev + 1);
    }
  }, []);

  const lastItemCallbackMobile = useCallback((node: HTMLDivElement | null) => {
    lastItemRefMobile.current = node;
    // Trigger observer re-setup when ref changes
    if (node) {
      setObserverKey((prev) => prev + 1);
    }
  }, []);

  const hasActiveFilters = searchQuery || selectedSkill || selectedCategory || selectedCity;

  return (
    <div
      className="min-h-screen bg-black text-white pb-20"
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
              <RefreshCw className="w-5 h-5" />
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
        className={`lg:hidden sticky top-0 z-40 bg-black backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 pt-6 pb-6 shadow-xl transition-transform duration-300 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Retour à l&apos;accueil</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">
              Découvrir <span className="text-violet-500">des talents</span>
            </h1>
            <p className="text-gray-400">
              {activeTab === "talents" && `${filteredTalents.length} talent${filteredTalents.length > 1 ? "s" : ""}`}
              {activeTab === "posts" && `${filteredPosts.length} post${filteredPosts.length > 1 ? "s" : ""}`}
              {activeTab === "videos" && `${filteredVideos.length} vidéo${filteredVideos.length > 1 ? "s" : ""}`}
              {activeTab === "users" && `${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? "s" : ""}`}
              {" "}trouvé{(activeTab === "talents" && filteredTalents.length > 1) || (activeTab === "posts" && filteredPosts.length > 1) || (activeTab === "videos" && filteredVideos.length > 1) || (activeTab === "users" && filteredUsers.length > 1) ? "s" : ""}
            </p>
          </motion.div>

          {/* Barre de recherche */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou compétence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            <Button
              variant={showFilters || hasActiveFilters ? "primary" : "secondary"}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full" />
              )}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto horizontal-scrollbar pb-1">
            <button
              onClick={() => setActiveTab("talents")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "talents"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Talents</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {filteredTalents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "posts"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Posts</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {filteredPosts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "videos"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="font-medium">Vidéos</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {filteredVideos.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === "users"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="font-medium">Utilisateurs</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {filteredUsers.length}
              </span>
            </button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10"
            >
              {/* Compétences */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-300">Compétences</h3>
                  {selectedSkill && (
                    <button
                      onClick={() => setSelectedSkill(null)}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                
                {/* Barre de recherche rapide pour compétences */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Rechercher une compétence..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                  {skillSearchQuery && (
                    <button
                      onClick={() => setSkillSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Liste des compétences filtrées */}
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto categories-scrollbar pr-1">
                  {allSkills
                    .filter((skill) =>
                      skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
                    )
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkill === skill ? "primary" : "secondary"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          setSelectedSkill(
                            selectedSkill === skill ? null : skill
                          )
                        }
                      >
                        {skill}
                      </Badge>
                    ))}
                  {allSkills.filter((skill) =>
                    skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="w-full text-center py-4 text-gray-500 text-sm">
                      Aucune compétence trouvée
                    </div>
                  )}
                </div>
              </div>

              {/* Villes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-300">Localisation</h3>
                  {selectedCity && (
                    <button
                      onClick={() => setSelectedCity(null)}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {cities.slice(0, 8).map((city) => (
                    <Badge
                      key={city}
                      variant={selectedCity === city ? "primary" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                    >
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Bouton reset */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="w-4 h-4" />
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Filtres actifs */}
          {hasActiveFilters && !showFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Filtres actifs:</span>
              {selectedSkill && (
                <Badge variant="primary" className="cursor-pointer" onClick={() => setSelectedSkill(null)}>
                  {selectedSkill}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {selectedCity && (
                <Badge variant="primary" className="cursor-pointer" onClick={() => setSelectedCity(null)}>
                  {selectedCity}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Content Section */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-5xl font-bold mb-2">
          Découvrir <span className="text-violet-500">des talents</span>
        </h1>
        <p className="text-gray-400 mb-8">
          {activeTab === "talents" && `${filteredTalents.length} talent${filteredTalents.length > 1 ? "s" : ""}`}
          {activeTab === "posts" && `${filteredPosts.length} post${filteredPosts.length > 1 ? "s" : ""}`}
          {activeTab === "videos" && `${filteredVideos.length} vidéo${filteredVideos.length > 1 ? "s" : ""}`}
          {activeTab === "users" && `${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? "s" : ""}`}
          {" "}trouvé{(activeTab === "talents" && filteredTalents.length > 1) || (activeTab === "posts" && filteredPosts.length > 1) || (activeTab === "videos" && filteredVideos.length > 1) || (activeTab === "users" && filteredUsers.length > 1) ? "s" : ""}
        </p>

        {/* Tabs + Filter Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("talents")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === "talents"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Talents</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {filteredTalents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === "posts"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Posts</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {filteredPosts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === "videos"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="font-medium">Vidéos</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {filteredVideos.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === "users"
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="font-medium">Utilisateurs</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {filteredUsers.length}
              </span>
            </button>
          </div>

          <Button
            variant={showFilters || hasActiveFilters ? "primary" : "secondary"}
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-400 rounded-full" />
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Compétences */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-300">Compétences</h3>
                  {selectedSkill && (
                    <button
                      onClick={() => setSelectedSkill(null)}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                
                {/* Barre de recherche rapide pour compétences */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Rechercher une compétence..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                  {skillSearchQuery && (
                    <button
                      onClick={() => setSkillSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Liste des compétences filtrées */}
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto categories-scrollbar pr-1">
                  {allSkills
                    .filter((skill) =>
                      skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
                    )
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkill === skill ? "primary" : "secondary"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          setSelectedSkill(
                            selectedSkill === skill ? null : skill
                          )
                        }
                      >
                        {skill}
                      </Badge>
                    ))}
                  {allSkills.filter((skill) =>
                    skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="w-full text-center py-4 text-gray-500 text-sm">
                      Aucune compétence trouvée
                    </div>
                  )}
                </div>
              </div>

              {/* Villes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-300">Villes</h3>
                  {selectedCity && (
                    <button
                      onClick={() => setSelectedCity(null)}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                {/* Villes principales de Côte d'Ivoire */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {["Abidjan", "Bouaké", "Daloa", "Korhogo", "San-Pédro", "Yamoussoukro", "Man"].map((city) => (
                    <Badge
                      key={city}
                      variant={selectedCity === city ? "primary" : "secondary"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                    >
                      {city}
                    </Badge>
                  ))}
                </div>

                {/* Autres villes - Dropdown */}
                <div className="relative" ref={otherCitiesDropdownRef}>
                  <button
                    onClick={() => setShowOtherCities(!showOtherCities)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Autres villes
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showOtherCities ? "rotate-180" : ""}`} />
                  </button>

                  {showOtherCities && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-hidden"
                    >
                      {/* Recherche dans le dropdown */}
                      <div className="p-3 border-b border-white/10">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            placeholder="Rechercher une ville..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>

                      {/* Liste des autres villes de CI */}
                      <div className="max-h-48 overflow-y-auto">
                        {coteIvoireCities
                          .filter(city => 
                            !["Abidjan", "Bouaké", "Daloa", "Korhogo", "San-Pédro", "Yamoussoukro", "Man"].includes(city) &&
                            city.toLowerCase().includes(citySearchQuery.toLowerCase())
                          )
                          .map((city) => (
                            <button
                              key={city}
                              onClick={() => {
                                setSelectedCity(selectedCity === city ? null : city);
                                setShowOtherCities(false);
                                setCitySearchQuery("");
                              }}
                              className={`w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors ${
                                selectedCity === city ? "bg-violet-500/20 text-violet-400" : "text-gray-300"
                              }`}
                            >
                              {city}
                            </button>
                          ))}
                        {coteIvoireCities.filter(city => 
                          !["Abidjan", "Bouaké", "Daloa", "Korhogo", "San-Pédro", "Yamoussoukro", "Man"].includes(city) &&
                          city.toLowerCase().includes(citySearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            Aucune ville trouvée
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="w-4 h-4" />
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && !showFilters && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Filtres actifs:</span>
            {selectedCategory && (
              <Badge variant="primary" className="cursor-pointer" onClick={() => setSelectedCategory(null)}>
                {skillCategories.find((c) => c.id === selectedCategory)?.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {selectedCity && (
              <Badge variant="primary" className="cursor-pointer" onClick={() => setSelectedCity(null)}>
                {selectedCity}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Contenu selon le tab actif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Talents */}
        {activeTab === "talents" && (
          <>
            {loadingTalents ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                </div>
                <p className="text-gray-400">Chargement des talents...</p>
              </motion.div>
            ) : filteredTalents.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredTalents.slice(0, currentVisibleCount).map((talent, index) => (
                    <motion.div
                      key={talent.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TalentCard
                        talent={talent}
                        onClick={() => router.push(`/profile/${talent.id}`)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                {/* Infinite Scroll Trigger */}
                {currentVisibleCount < filteredTalents.length ? (
                  <div
                    ref={lastItemCallbackDesktop}
                    className="hidden lg:block h-20 flex items-center justify-center mt-6"
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                ) : filteredTalents.length > 0 ? (
                  <div className="h-20 flex items-center justify-center mt-6">
                    <p className="text-sm text-gray-500">Tous les talents ont été chargés</p>
                  </div>
                ) : null}
                {/* Mobile trigger */}
                {currentVisibleCount < filteredTalents.length && (
                  <div
                    ref={lastItemCallbackMobile}
                    className="lg:hidden h-20 flex items-center justify-center mt-6"
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Aucun talent trouvé</h3>
                <p className="text-gray-400 mb-6">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Tab Posts */}
        {activeTab === "posts" && (
          <>
            {filteredPosts.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="max-w-2xl mx-auto space-y-6"
                >
                  {filteredPosts.slice(0, currentVisibleCount).map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </motion.div>
                {/* Infinite Scroll Trigger */}
                {currentVisibleCount < filteredPosts.length ? (
                  <div
                    ref={lastItemCallbackDesktop}
                    className="hidden lg:block h-20 flex items-center justify-center mt-6"
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                ) : filteredPosts.length > 0 ? (
                  <div className="h-20 flex items-center justify-center mt-6">
                    <p className="text-sm text-gray-500">Tous les posts ont été chargés</p>
                  </div>
                ) : null}
                {/* Mobile trigger */}
                {currentVisibleCount < filteredPosts.length && (
                  <div
                    ref={lastItemCallbackMobile}
                    className="lg:hidden h-20 flex items-center justify-center mt-6"
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Aucun post trouvé</h3>
                <p className="text-gray-400 mb-6">
                  Essayez une autre recherche
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Réinitialiser la recherche
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Tab Users */}
        {activeTab === "users" && (
          <>
            {filteredUsers.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="max-w-2xl mx-auto space-y-3"
                >
                  {filteredUsers.slice(0, currentVisibleCount).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => router.push(`/profile/${user.id}`)}
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{user.name}</h3>
                        <p className="text-sm text-gray-400">
                          {user.info}
                          {user.location && ` • ${user.location}`}
                        </p>
                      </div>
                      <Badge variant={user.type === "talent" ? "primary" : "secondary"}>
                        {user.type === "talent" ? "Talent" : "Utilisateur"}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
                {/* Infinite Scroll Trigger */}
                {currentVisibleCount < filteredUsers.length ? (
                  <div
                    ref={lastItemCallbackDesktop}
                    className="hidden lg:block h-20 flex items-center justify-center mt-6"
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="h-20 flex items-center justify-center mt-6">
                    <p className="text-sm text-gray-500">Tous les utilisateurs ont été chargés</p>
                  </div>
                ) : null}
                {/* Mobile trigger */}
                {currentVisibleCount < filteredUsers.length && (
                  <div
                    ref={lastItemCallbackMobile}
                    className="lg:hidden h-20 flex items-center justify-center mt-6"
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-xl font-semibold mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-400 mb-6">
                  Essayez une autre recherche
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Réinitialiser la recherche
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Tab Vidéos */}
        {activeTab === "videos" && (
          <>
            {filteredVideos.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredVideos.slice(0, currentVisibleCount).map((video, index) => (
                    <motion.div
                      key={video.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <VideoCard
                        video={video}
                        onClick={() => handleVideoClick(video.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                {/* Infinite Scroll Trigger */}
                {currentVisibleCount < filteredVideos.length ? (
                  <div
                    ref={lastItemCallbackDesktop}
                    className="hidden lg:block h-20 flex items-center justify-center mt-6"
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                ) : filteredVideos.length > 0 ? (
                  <div className="h-20 flex items-center justify-center mt-6">
                    <p className="text-sm text-gray-500">Toutes les vidéos ont été chargées</p>
                  </div>
                ) : null}
                {/* Mobile trigger */}
                {currentVisibleCount < filteredVideos.length && (
                  <div
                    ref={lastItemCallbackMobile}
                    className="lg:hidden h-20 flex items-center justify-center mt-6"
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-xl font-semibold mb-2">Aucune vidéo trouvée</h3>
                <p className="text-gray-400 mb-6">
                  Essayez une autre recherche ou catégorie
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            )}
          </>
        )}
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

export default function DiscoverPage() {
  return (
    <ProtectedRoute>
      <DiscoverPageContent />
    </ProtectedRoute>
  );
}
