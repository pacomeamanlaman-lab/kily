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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  loadMessages,
  sendMessage as sendMessageSupabase,
  markMessagesAsRead,
  subscribeToMessages,
  getOrCreateConversation,
  type Message as SupabaseMessage,
  type Conversation,
} from "@/lib/supabase/messages.service";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isOwn: boolean;
}

function ConversationPageContent() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id || null;
  const conversationIdParam = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<{
    id: string;
    name: string;
    avatar: string;
  } | null>(null);

  // Charger ou créer la conversation et les messages
  useEffect(() => {
    if (!currentUserId || !conversationIdParam) return;

    const loadConversationAndMessages = async () => {
      try {
        setLoading(true);
        let conv: Conversation | null = null;

        // Essayer de charger la conversation avec l'ID fourni
        // Si l'ID ressemble à un UUID, c'est probablement un ID de conversation
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationIdParam);
        
        if (isUUID) {
          // C'est probablement un ID de conversation - essayer de le charger directement
          const { loadConversations } = await import("@/lib/supabase/messages.service");
          const conversations = await loadConversations(currentUserId);
          conv = conversations.find(c => c.id === conversationIdParam) || null;
        }

        // Si pas de conversation trouvée, créer une nouvelle avec l'ID comme participant
        // (l'ID peut être soit un ID de conversation, soit un ID de participant)
        if (!conv) {
          try {
            conv = await getOrCreateConversation(currentUserId, conversationIdParam);
          } catch (error) {
            console.error('Erreur lors de la création de la conversation:', error);
            // Si l'erreur est due à une contrainte unique, essayer de recharger
            const { loadConversations } = await import("@/lib/supabase/messages.service");
            const conversations = await loadConversations(currentUserId);
            conv = conversations.find(c => 
              c.participant_1_id === conversationIdParam || 
              c.participant_2_id === conversationIdParam
            ) || null;
          }
        }

        if (!conv) {
          console.error('Impossible de charger ou créer la conversation');
          setLoading(false);
          return;
        }

        setConversation(conv);

        // Déterminer l'autre participant
        const other = conv.participant_1_id === currentUserId 
          ? conv.participant_2 
          : conv.participant_1;
        
        const otherId = conv.participant_1_id === currentUserId 
          ? conv.participant_2_id 
          : conv.participant_1_id;

        setOtherParticipant({
          id: otherId,
          name: other 
            ? `${other.first_name} ${other.last_name}`.trim()
            : "Utilisateur",
          avatar: other?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
        });

        // Charger les messages
        const loadedMessages = await loadMessages(conv.id);
        const formattedMessages: Message[] = loadedMessages.map((msg: SupabaseMessage) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.sender_id,
          timestamp: msg.created_at,
          isOwn: msg.sender_id === currentUserId,
        }));

        setMessages(formattedMessages);

        // Marquer les messages comme lus
        await markMessagesAsRead(conv.id, currentUserId);

        // S'abonner aux nouveaux messages
        const subscription = subscribeToMessages(conv.id, (newMessage: SupabaseMessage) => {
          setMessages(prev => {
            // Éviter les doublons
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, {
              id: newMessage.id,
              content: newMessage.content,
              senderId: newMessage.sender_id,
              timestamp: newMessage.created_at,
              isOwn: newMessage.sender_id === currentUserId,
            }];
          });
          
          // Marquer comme lu si c'est pour l'utilisateur actuel
          if (newMessage.receiver_id === currentUserId) {
            markMessagesAsRead(conv!.id, currentUserId);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erreur lors du chargement de la conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversationAndMessages();
  }, [currentUserId, conversationIdParam]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !currentUserId || !conversation || !otherParticipant) return;

    try {
      // Envoyer le message via Supabase
      const newMessage = await sendMessageSupabase(
        conversation.id,
        currentUserId,
        otherParticipant.id,
        messageInput.trim()
      );

      if (!newMessage) {
        throw new Error('Le message n\'a pas pu être envoyé');
      }

      // Ajouter le message à la liste localement
      const formattedMessage: Message = {
        id: newMessage.id,
        content: newMessage.content,
        senderId: newMessage.sender_id,
        timestamp: newMessage.created_at,
        isOwn: true,
      };

      setMessages(prev => [...prev, formattedMessage]);
      setMessageInput("");
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation || !otherParticipant) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Conversation introuvable</p>
          <button
            onClick={() => router.push('/messages')}
            className="text-violet-500 hover:text-violet-400"
          >
            Retour aux messages
          </button>
        </div>
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
              onClick={() => router.push(`/profile/${otherParticipant.id}`)}
            >
              <div className="relative">
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
              </div>
              <div>
                <h2 className="font-bold">{otherParticipant.name}</h2>
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
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Aucun message pour le moment</p>
              <p className="text-sm text-gray-500">Commencez la conversation !</p>
            </div>
          </div>
        ) : (
          <>
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

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
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

export default function ConversationPage() {
  return (
    <ProtectedRoute>
      <ConversationPageContent />
    </ProtectedRoute>
  );
}
