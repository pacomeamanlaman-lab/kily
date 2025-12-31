"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import CreateStoryModal from "./CreateStoryModal";

export interface Story {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  thumbnail: string;
  viewed: boolean;
}

interface StoryCarouselProps {
  stories: Story[];
}

export default function StoryCarousel({ stories }: StoryCarouselProps) {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);

  const handleStoryClick = (index: number, storyId: string) => {
    setSelectedStory(index);
    setViewedStories((prev) => new Set(prev).add(storyId));
  };

  const handleNext = () => {
    if (selectedStory !== null && selectedStory < stories.length - 1) {
      const nextStory = stories[selectedStory + 1];
      setSelectedStory(selectedStory + 1);
      setViewedStories((prev) => new Set(prev).add(nextStory.id));
    } else {
      setSelectedStory(null);
    }
  };

  const handlePrevious = () => {
    if (selectedStory !== null && selectedStory > 0) {
      setSelectedStory(selectedStory - 1);
    }
  };

  const handleClose = () => {
    setSelectedStory(null);
  };
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {/* Add Story */}
        <button
          onClick={() => setShowCreateStoryModal(true)}
          className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <span className="text-xs text-gray-400 w-16 text-center truncate">
            Ajouter
          </span>
        </button>

        {/* Stories */}
        {stories.map((story, index) => {
          const isViewed = story.viewed || viewedStories.has(story.id);

          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleStoryClick(index, story.id)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-16 h-16 rounded-full p-0.5 ${
                  isViewed
                    ? "bg-white/20"
                    : "bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700"
                } group-hover:scale-110 transition-transform`}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-black">
                  <img
                    src={story.thumbnail}
                    alt={story.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400 w-16 text-center truncate">
                {story.author.name.split(" ")[0]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Story Modal */}
      <AnimatePresence>
        {selectedStory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Previous Button */}
            {selectedStory > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Next Button */}
            {selectedStory < stories.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Story Content */}
            <motion.div
              key={selectedStory}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full max-w-md flex flex-col"
            >
              {/* Progress Bars */}
              <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-4">
                {stories.map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full bg-white transition-all duration-300 ${
                        index < selectedStory
                          ? "w-full"
                          : index === selectedStory
                          ? "w-full"
                          : "w-0"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Author Info */}
              <div className="absolute top-12 left-0 right-0 z-10 flex items-center gap-3 px-4">
                <img
                  src={stories[selectedStory].author.avatar}
                  alt={stories[selectedStory].author.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <span className="font-semibold text-white">
                  {stories[selectedStory].author.name}
                </span>
              </div>

              {/* Story Image */}
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={stories[selectedStory].thumbnail}
                  alt={stories[selectedStory].author.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Click Areas for Navigation */}
              <div className="absolute inset-0 flex">
                <button
                  onClick={handlePrevious}
                  disabled={selectedStory === 0}
                  className="flex-1 cursor-pointer"
                  aria-label="Previous story"
                />
                <button
                  onClick={handleNext}
                  className="flex-1 cursor-pointer"
                  aria-label="Next story"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={showCreateStoryModal}
        onClose={() => setShowCreateStoryModal(false)}
      />
    </div>
  );
}
