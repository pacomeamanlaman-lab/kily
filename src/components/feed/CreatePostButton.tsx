"use client";

import { useState } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import PublishModal from "../publish/PublishModal";

interface CreatePostButtonProps {
  userAvatar?: string;
  userName?: string;
}

export default function CreatePostButton({
  userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
  userName = "Vous"
}: CreatePostButtonProps) {
  const [showPublishModal, setShowPublishModal] = useState(false);

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <img
            src={userAvatar}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />

          {/* Fake Input - Opens Modal */}
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-left text-gray-400 transition-colors"
          >
            Quoi de neuf, {userName} ?
          </button>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPublishModal(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Photo/Vidéo"
            >
              <ImageIcon className="w-5 h-5 text-violet-400" />
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Vidéo"
            >
              <Video className="w-5 h-5 text-violet-400" />
            </button>
          </div>
        </div>
      </div>

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
      />
    </>
  );
}
