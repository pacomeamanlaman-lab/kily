"use client";

import { motion } from "framer-motion";
import { Home, Search, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        {/* 404 Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-24 h-24 bg-violet-500/10 border border-violet-500/30 rounded-full mb-8"
        >
          <AlertCircle className="w-12 h-12 text-violet-500" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl sm:text-7xl font-bold mb-4"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl font-bold mb-4"
        >
          Page introuvable
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 mb-8"
        >
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="primary"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l&apos;accueil
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/discover")}
            className="inline-flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Découvrir les talents
          </Button>
        </motion.div>

        {/* Decorative elements */}
        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Code d&apos;erreur :</span>
          <code className="bg-white/5 px-2 py-1 rounded text-violet-400">404_NOT_FOUND</code>
        </div>
      </motion.div>
    </div>
  );
}
