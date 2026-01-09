"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Video, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import CreatePostForm from "./CreatePostForm";
import CreateVideoForm from "./CreateVideoForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "post" | "video" | null;
}

type PublishType = "post" | "video" | null;

export default function PublishModal({ isOpen, onClose, initialType = null }: PublishModalProps) {
  const [publishType, setPublishType] = useState<PublishType>(initialType);

  // Check if user can publish (only Talents)
  const { user: currentUser } = useCurrentUser();
  const canPublish = currentUser?.user_type === "talent";

  // Sync publishType with initialType when modal opens
  useEffect(() => {
    if (isOpen) {
      setPublishType(initialType);
    }
  }, [isOpen, initialType]);

  const handleClose = () => {
    setPublishType(null);
    onClose();
  };

  // If user cannot publish, show error message
  if (isOpen && !canPublish) {
    return (
      <AnimatePresence>
        <motion.div
          key="error-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        />
        <motion.div
          key="error-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Accès refusé</h3>
                <p className="text-sm text-white/60">
                  Seuls les Talents peuvent publier du contenu
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition-colors"
            >
              Compris
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
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
                      className="w-full p-6 bg-gradient-to-br from-violet-500/20 to-violet-600/10 hover:from-violet-500/30 hover:to-violet-600/20 border border-violet-500/30 rounded-xl transition-all group cursor-pointer"
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
                      className="w-full p-6 bg-gradient-to-br from-violet-500/20 to-violet-600/10 hover:from-violet-500/30 hover:to-violet-600/20 border border-violet-500/30 rounded-xl transition-all group cursor-pointer"
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
                      className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
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
