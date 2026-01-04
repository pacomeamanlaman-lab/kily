"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/users";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // Selector CSS ou "mobile" / "desktop"
  position?: "top" | "bottom" | "left" | "right" | "center";
}

interface FeedTourProps {
  onComplete?: () => void;
}

export default function FeedTour({ onComplete }: FeedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      id: "filters",
      title: "Filtrez votre feed",
      description: "Utilisez les filtres pour voir tous les posts, ceux de vos abonnements ou les tendances",
      target: '[data-tour="filters"]',
      position: "bottom",
    },
    {
      id: "create-post",
      title: "Publiez vos créations",
      description: "Partagez vos talents avec la communauté en publiant des posts ou des vidéos",
      target: '[data-tour="create-post"]',
      position: "bottom",
    },
    {
      id: "stories",
      title: "Découvrez les stories",
      description: "Parcourez les stories pour voir les dernières actualités de vos talents favoris",
      target: '[data-tour="stories"]',
      position: "bottom",
    },
    {
      id: "posts",
      title: "Explorez le feed",
      description: "Faites défiler pour découvrir les posts et vidéos de la communauté",
      target: '[data-tour="posts"]',
      position: "top",
    },
    {
      id: "bottom-nav",
      title: "Navigation rapide",
      description: "Accédez rapidement à l'accueil, la découverte, les messages et votre profil",
      target: '[data-tour="bottom-nav"]',
      position: "top",
    },
  ];

  // Check if tour was already completed for this user
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Use user-specific key
    const TOUR_STORAGE_KEY = `kily_feed_tour_completed_${currentUser.id}`;
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    
    if (!completed) {
      // Show tour after a short delay to allow page to render
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    }
  }, []);

  // Find and highlight target element
  useEffect(() => {
    if (!isVisible || currentStep >= steps.length) return;

    const step = steps[currentStep];
    if (!step) return;

    // Wait a bit for elements to render
    const timer = setTimeout(() => {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          // If element doesn't exist, skip to next step
          if (currentStep < steps.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 100);
          } else {
            setIsVisible(false);
            if (typeof window !== "undefined") {
              const currentUser = getCurrentUser();
              if (currentUser) {
                const TOUR_STORAGE_KEY = `kily_feed_tour_completed_${currentUser.id}`;
                localStorage.setItem(TOUR_STORAGE_KEY, "true");
              }
            }
            onComplete?.();
          }
        }
      }, 300);

    return () => clearTimeout(timer);
  }, [currentStep, isVisible, onComplete]);

  const handleComplete = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const TOUR_STORAGE_KEY = `kily_feed_tour_completed_${currentUser.id}`;
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      }
    }
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  // Calculate position for tooltip
  const getTooltipPosition = () => {
    if (!targetElement) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const rect = targetElement.getBoundingClientRect();
    const position = currentStepData.position || "bottom";
    const tooltipWidth = 384; // max-w-sm = 384px
    const tooltipHeight = 200; // approximate height
    const padding = 20;

    let top = 0;
    let left = 0;
    let transform = "";

    switch (position) {
      case "top":
        top = rect.top - padding;
        left = Math.max(padding, Math.min(rect.left + rect.width / 2, window.innerWidth - tooltipWidth - padding));
        transform = top - tooltipHeight < 0 ? "translate(-50%, 0)" : "translate(-50%, -100%)";
        if (top - tooltipHeight < 0) top = rect.bottom + padding;
        break;
      case "bottom":
        top = rect.bottom + padding;
        left = Math.max(padding, Math.min(rect.left + rect.width / 2, window.innerWidth - tooltipWidth - padding));
        transform = "translate(-50%, 0)";
        if (top + tooltipHeight > window.innerHeight) {
          top = rect.top - padding;
          transform = "translate(-50%, -100%)";
        }
        break;
      case "left":
        top = Math.max(padding, Math.min(rect.top + rect.height / 2, window.innerHeight - tooltipHeight - padding));
        left = rect.left - padding;
        transform = "translate(-100%, -50%)";
        if (left - tooltipWidth < 0) {
          left = rect.right + padding;
          transform = "translate(0, -50%)";
        }
        break;
      case "right":
        top = Math.max(padding, Math.min(rect.top + rect.height / 2, window.innerHeight - tooltipHeight - padding));
        left = rect.right + padding;
        transform = "translate(0, -50%)";
        if (left + tooltipWidth > window.innerWidth) {
          left = rect.left - padding;
          transform = "translate(-100%, -50%)";
        }
        break;
      default:
        top = rect.top + rect.height / 2;
        left = rect.left + rect.width / 2;
        transform = "translate(-50%, -50%)";
    }

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  // Calculate spotlight position
  const getSpotlightStyle = () => {
    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    return {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    };
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay with spotlight */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] pointer-events-auto"
            onClick={handleNext}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />
            
            {/* Spotlight border */}
            {targetElement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute rounded-xl border-2 border-violet-500 pointer-events-none z-10"
                style={{
                  ...getSpotlightStyle(),
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                }}
              />
            )}
          </motion.div>

          {/* Tooltip */}
          {targetElement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed z-[9999] pointer-events-auto"
              style={getTooltipPosition()}
            >
              <div className="bg-gradient-to-br from-violet-900/95 to-purple-900/95 backdrop-blur-lg border border-violet-500/50 rounded-2xl p-6 shadow-2xl max-w-sm mx-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentStepData.title}</h3>
                      <p className="text-xs text-violet-300 mt-1">
                        {currentStep + 1} / {steps.length}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Navigation */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
                    {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

