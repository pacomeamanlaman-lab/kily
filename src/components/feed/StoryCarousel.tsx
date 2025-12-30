"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

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
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {/* Add Story */}
        <button className="flex-shrink-0 flex flex-col items-center gap-2 group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <span className="text-xs text-gray-400 w-16 text-center truncate">
            Ajouter
          </span>
        </button>

        {/* Stories */}
        {stories.map((story, index) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            <div
              className={`w-16 h-16 rounded-full p-0.5 ${
                story.viewed
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
        ))}
      </div>
    </div>
  );
}
