// localStorage-based CRUD for messages and conversations

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of 2 user IDs
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  unreadBy: string; // User ID who has unread messages
}

const MESSAGES_KEY = "kily_messages";
const CONVERSATIONS_KEY = "kily_conversations";

// Initialize with default conversations/messages
const getDefaultConversations = (): Conversation[] => {
  return [
    {
      id: "conv_1",
      participants: ["current_user", "1"], // current_user with Amina
      lastMessage: "Merci pour votre intérêt !",
      lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      unreadCount: 2,
      unreadBy: "current_user",
    },
    {
      id: "conv_2",
      participants: ["current_user", "2"], // current_user with Kofi
      lastMessage: "Super, on peut discuter demain ?",
      lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
      unreadBy: "",
    },
    {
      id: "conv_3",
      participants: ["current_user", "3"], // current_user with Sarah
      lastMessage: "Je vous envoie mon portfolio",
      lastMessageAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      unreadCount: 1,
      unreadBy: "current_user",
    },
  ];
};

const getDefaultMessages = (): Message[] => {
  return [
    // Conversation 1 (Amina)
    {
      id: "msg_1",
      conversationId: "conv_1",
      senderId: "1",
      receiverId: "current_user",
      content: "Bonjour ! J'ai vu votre profil et je suis intéressée par votre proposition.",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "msg_2",
      conversationId: "conv_1",
      senderId: "current_user",
      receiverId: "1",
      content: "Bonjour Amina ! Ravi de vous lire. Pouvez-vous m'en dire plus sur votre expérience ?",
      timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "msg_3",
      conversationId: "conv_1",
      senderId: "1",
      receiverId: "current_user",
      content: "Bien sûr ! Je suis pâtissière depuis 5 ans et je me spécialise dans les desserts africains.",
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "msg_4",
      conversationId: "conv_1",
      senderId: "1",
      receiverId: "current_user",
      content: "Merci pour votre intérêt !",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
    },

    // Conversation 2 (Kofi)
    {
      id: "msg_5",
      conversationId: "conv_2",
      senderId: "current_user",
      receiverId: "2",
      content: "Salut Kofi ! J'ai besoin d'un développeur pour un projet mobile.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "msg_6",
      conversationId: "conv_2",
      senderId: "2",
      receiverId: "current_user",
      content: "Super, on peut discuter demain ?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
    },

    // Conversation 3 (Sarah)
    {
      id: "msg_7",
      conversationId: "conv_3",
      senderId: "3",
      receiverId: "current_user",
      content: "Je vous envoie mon portfolio",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
  ];
};

// Load conversations from localStorage
export const loadConversations = (userId: string): Conversation[] => {
  if (typeof window === "undefined") return getDefaultConversations();

  const stored = localStorage.getItem(CONVERSATIONS_KEY);

  if (!stored) {
    const defaultConvos = getDefaultConversations();
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(defaultConvos));
    return defaultConvos;
  }

  const allConvos: Conversation[] = JSON.parse(stored);

  // Filter conversations where user is a participant
  return allConvos.filter((c) => c.participants.includes(userId));
};

// Save conversations to localStorage
const saveConversations = (conversations: Conversation[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
};

// Load messages from localStorage
export const loadMessages = (conversationId?: string): Message[] => {
  if (typeof window === "undefined") return getDefaultMessages();

  const stored = localStorage.getItem(MESSAGES_KEY);

  if (!stored) {
    const defaultMsgs = getDefaultMessages();
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(defaultMsgs));
    return conversationId
      ? defaultMsgs.filter((m) => m.conversationId === conversationId)
      : defaultMsgs;
  }

  const allMessages: Message[] = JSON.parse(stored);

  if (conversationId) {
    return allMessages.filter((m) => m.conversationId === conversationId);
  }

  return allMessages;
};

// Save messages to localStorage
const saveMessages = (messages: Message[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
};

// Get or create conversation between two users
export const getOrCreateConversation = (userId1: string, userId2: string): Conversation => {
  const conversations = loadConversations(userId1);

  // Check if conversation already exists
  const existing = conversations.find((c) =>
    c.participants.includes(userId1) && c.participants.includes(userId2)
  );

  if (existing) return existing;

  // Create new conversation
  const newConvo: Conversation = {
    id: `conv_${Date.now()}`,
    participants: [userId1, userId2],
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
    unreadBy: "",
  };

  const allConvos = loadConversations("all"); // Load all conversations
  allConvos.push(newConvo);
  saveConversations(allConvos);

  return newConvo;
};

// Send message
export const sendMessage = (
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Message => {
  const allMessages = loadMessages();
  const allConvos = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  allMessages.push(newMessage);
  saveMessages(allMessages);

  // Update conversation
  const convo = allConvos.find((c: Conversation) => c.id === conversationId);
  if (convo) {
    convo.lastMessage = content;
    convo.lastMessageAt = newMessage.timestamp;
    convo.unreadCount = (convo.unreadBy === receiverId ? convo.unreadCount : 0) + 1;
    convo.unreadBy = receiverId;
    saveConversations(allConvos);
  }

  return newMessage;
};

// Mark messages as read
export const markMessagesAsRead = (conversationId: string, userId: string): void => {
  const allMessages = loadMessages();
  const allConvos = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");

  // Mark all messages in conversation as read
  allMessages.forEach((msg) => {
    if (msg.conversationId === conversationId && msg.receiverId === userId) {
      msg.read = true;
    }
  });

  saveMessages(allMessages);

  // Update conversation unread count
  const convo = allConvos.find((c: Conversation) => c.id === conversationId);
  if (convo && convo.unreadBy === userId) {
    convo.unreadCount = 0;
    convo.unreadBy = "";
    saveConversations(allConvos);
  }
};

// Get unread messages count for user
export const getUnreadCount = (userId: string): number => {
  const conversations = loadConversations(userId);
  return conversations.reduce((total, convo) => {
    return total + (convo.unreadBy === userId ? convo.unreadCount : 0);
  }, 0);
};

// Delete message
export const deleteMessage = (messageId: string): boolean => {
  const allMessages = loadMessages();
  const filtered = allMessages.filter((m) => m.id !== messageId);

  if (filtered.length === allMessages.length) return false;

  saveMessages(filtered);
  return true;
};

// Delete conversation
export const deleteConversation = (conversationId: string): boolean => {
  const allConvos = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
  const filtered = allConvos.filter((c: Conversation) => c.id !== conversationId);

  if (filtered.length === allConvos.length) return false;

  saveConversations(filtered);

  // Also delete all messages in conversation
  const allMessages = loadMessages();
  const filteredMessages = allMessages.filter((m) => m.conversationId !== conversationId);
  saveMessages(filteredMessages);

  return true;
};
