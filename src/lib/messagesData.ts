export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isOwn: boolean;
    unread: boolean;
  };
}

export const mockConversations: Conversation[] = [
  {
    id: "1",
    participant: {
      id: "1",
      name: "Amina Koné",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
      online: true,
    },
    lastMessage: {
      content: "Super ! Je serais ravi de discuter de votre projet. Quels sont vos besoins précis ?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isOwn: false,
      unread: true,
    },
  },
  {
    id: "2",
    participant: {
      id: "2",
      name: "Kofi Mensah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      online: false,
    },
    lastMessage: {
      content: "Merci pour votre message ! Je peux commencer dès la semaine prochaine.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isOwn: false,
      unread: false,
    },
  },
  {
    id: "3",
    participant: {
      id: "3",
      name: "Fatoumata Diallo",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
      online: true,
    },
    lastMessage: {
      content: "D'accord, je vous envoie les photos dans la journée 📸",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isOwn: true,
      unread: false,
    },
  },
  {
    id: "4",
    participant: {
      id: "4",
      name: "Jean-Pierre Kamga",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      online: false,
    },
    lastMessage: {
      content: "Parfait ! À demain alors 👍",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isOwn: true,
      unread: false,
    },
  },
  {
    id: "5",
    participant: {
      id: "5",
      name: "Yao Kouassi",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      online: true,
    },
    lastMessage: {
      content: "Je vous remercie pour cette opportunité !",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isOwn: false,
      unread: false,
    },
  },
];
