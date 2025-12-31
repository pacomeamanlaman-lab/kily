"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-green-500/10 border-green-500/30 text-green-500",
    error: "bg-red-500/10 border-red-500/30 text-red-500",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-500",
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 right-4 z-[100] max-w-sm"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg ${colors[type]} bg-black/80`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium text-white flex-1">{message}</p>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
