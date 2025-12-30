"use client";

import { MessageCircle, Search, Send, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-500/10 rounded-full mb-6">
            <MessageCircle className="w-10 h-10 text-violet-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Aucun message</h2>
          <p className="text-white/60 max-w-md mx-auto mb-8">
            Vous n&apos;avez pas encore de conversations. Découvrez des talents et commencez à échanger !
          </p>
          <a
            href="/discover"
            className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Send className="w-5 h-5" />
            Découvrir des talents
          </a>
        </div>

        {/* Placeholder for future messages list */}
        <div className="mt-16 space-y-4 opacity-30">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl"
            >
              <div className="w-14 h-14 bg-white/10 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                <div className="h-3 bg-white/10 rounded w-48" />
              </div>
              <div className="text-sm text-white/40">Il y a 2h</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
