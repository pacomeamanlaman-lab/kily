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
  // Return empty array - conversations will be created dynamically
  // This prevents hardcoding "current_user"
  return [];
};

const getDefaultMessages = (): Message[] => {
  // Return empty array - messages will be created dynamically
  // This prevents hardcoding "current_user"
  return [];
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
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(MESSAGES_KEY);

  if (!stored) {
    return [];
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

  // Load all conversations (we need to get all, not just for one user)
  const stored = localStorage.getItem(CONVERSATIONS_KEY);
  const allConvos: Conversation[] = stored ? JSON.parse(stored) : [];
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
