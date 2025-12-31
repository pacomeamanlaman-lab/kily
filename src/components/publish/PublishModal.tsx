"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Video } from "lucide-react";
import { useState } from "react";
import CreatePostForm from "./CreatePostForm";
import CreateVideoForm from "./CreateVideoForm";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PublishType = "post" | "video" | null;

export default function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const [publishType, setPublishType] = useState<PublishType>(null);

  const handleClose = () => {
    setPublishType(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  {publishType === null
                    ? "Publier du contenu"
                    : publishType === "post"
                    ? "Créer un post"
                    : "Publier une vidéo"}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {publishType === null ? (
                  <div className="space-y-4">
                    {/* Post Option */}
                    <button
                      onClick={() => setPublishType("post")}
                      className="w-full p-6 bg-gradient-to-br from-violet-500/20 to-violet-600/10 hover:from-violet-500/30 hover:to-violet-600/20 border border-violet-500/30 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                          <FileText className="w-6 h-6 text-violet-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-white">
                            Publier un post
                          </h3>
                          <p className="text-sm text-gray-400">
                            Partagez vos idées, réalisations et talents
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Video Option */}
                    <button
                      onClick={() => setPublishType("video")}
                      className="w-full p-6 bg-gradient-to-br from-violet-500/20 to-violet-600/10 hover:from-violet-500/30 hover:to-violet-600/20 border border-violet-500/30 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                          <Video className="w-6 h-6 text-violet-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-white">
                            Publier une vidéo
                          </h3>
                          <p className="text-sm text-gray-400">
                            Montrez vos talents en action
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Cancel Button */}
                    <button
                      onClick={handleClose}
                      className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : publishType === "post" ? (
                  <CreatePostForm onSuccess={handleClose} onCancel={() => setPublishType(null)} />
                ) : (
                  <CreateVideoForm onSuccess={handleClose} onCancel={() => setPublishType(null)} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
