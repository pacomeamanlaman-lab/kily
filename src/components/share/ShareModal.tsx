"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Facebook, Twitter, Linkedin, MessageCircle, Link as LinkIcon, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  description?: string;
}

export default function ShareModal({ isOpen, onClose, url, title, description }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        onClose();
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-black hover:bg-gray-900",
      action: () => {
        const text = title ? `${title} - ${description || ""}` : "";
        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        onClose();
      },
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      action: () => {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        onClose();
      },
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
      action: () => {
        const text = title ? `${title} - ${description || ""}` : "";
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        window.open(shareUrl, "_blank");
        onClose();
      },
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      action: () => {
        const subject = title || "Partage depuis Kily";
        const body = `${description || ""}\n\n${url}`;
        const shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = shareUrl;
        onClose();
      },
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-3xl w-full max-w-md overflow-hidden backdrop-blur-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Partager</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Share Options */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {shareOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.name}
                        onClick={option.action}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl ${option.color} text-white transition-all hover:scale-105`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{option.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                >
                  <div className={`p-2 rounded-lg ${copied ? "bg-green-600" : "bg-white/10"}`}>
                    {copied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <LinkIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">
                      {copied ? "Lien copié !" : "Copier le lien"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{url}</p>
                  </div>
                  {!copied && <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


