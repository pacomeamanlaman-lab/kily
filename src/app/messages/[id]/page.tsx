"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import { mockTalents } from "@/lib/mockData";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isOwn: boolean;
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState("");

  // Trouver le talent pour cette conversation
  const talent = mockTalents.find((t) => t.id === params.id);

  // Messages mockés
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Bonjour ! Merci de m'avoir contacté. Comment puis-je vous aider ?",
      senderId: params.id as string,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isOwn: false,
    },
    {
      id: "2",
      content: "Bonjour ! J'ai vu votre profil et je suis très intéressé par vos services.",
      senderId: "current-user",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      isOwn: true,
    },
    {
      id: "3",
      content: "Super ! Je serais ravi de discuter de votre projet. Quels sont vos besoins précis ?",
      senderId: params.id as string,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isOwn: false,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      senderId: "current-user",
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");

    // Simuler une réponse automatique après 2 secondes
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        content: "Message reçu ! Je vous réponds dès que possible. 👍",
        senderId: params.id as string,
        timestamp: new Date().toISOString(),
        isOwn: false,
      };
      setMessages((prev) => [...prev, autoReply]);
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!talent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Conversation introuvable</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={() => router.push(`/profile/${talent.id}`)}
            >
              <div className="relative">
                <img
                  src={talent.avatar}
                  alt={talent.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
              </div>
              <div>
                <h2 className="font-bold">{talent.name}</h2>
                <p className="text-xs text-green-500">En ligne</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Date Divider */}
        <div className="flex items-center justify-center">
          <div className="bg-white/10 px-4 py-1 rounded-full text-xs text-gray-400">
            Aujourd&apos;hui
          </div>
        </div>

        {/* Messages */}
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] sm:max-w-md ${
                message.isOwn
                  ? "bg-violet-600 text-white"
                  : "bg-white/10 text-white"
              } rounded-2xl px-4 py-3`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.isOwn ? "text-violet-200" : "text-gray-400"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-black/95 backdrop-blur-lg border-t border-white/10 px-4 py-4 pb-6">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Écrivez votre message..."
              rows={1}
              className="w-full px-4 py-3 pr-24 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none max-h-32"
            />

            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="flex items-center justify-center w-12 h-12 bg-violet-600 hover:bg-violet-700 disabled:bg-white/10 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
