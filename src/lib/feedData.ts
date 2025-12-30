import { Post } from "@/components/feed/PostCard";
import { Story } from "@/components/feed/StoryCarousel";

export const mockStories: Story[] = [
  {
    id: "s1",
    author: {
      id: "1",
      name: "Amina Koné",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    },
    thumbnail: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400",
    viewed: false,
  },
  {
    id: "s2",
    author: {
      id: "2",
      name: "Kofi Mensah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400",
    viewed: false,
  },
  {
    id: "s3",
    author: {
      id: "3",
      name: "Fatoumata Diallo",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    },
    thumbnail: "https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400",
    viewed: true,
  },
  {
    id: "s4",
    author: {
      id: "4",
      name: "Jean-Pierre",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    },
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
    viewed: false,
  },
];

export const mockPosts: Post[] = [
  {
    id: "p1",
    author: {
      id: "1",
      name: "Amina Koné",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
      verified: true,
      skill: "Cuisinière professionnelle",
    },
    type: "portfolio",
    content: "Nouveau plat traditionnel que je viens de créer ! Attiéké poisson avec sauce spéciale maison 🍴✨",
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800",
    likes: 234,
    comments: 45,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  },
  {
    id: "p2",
    author: {
      id: "2",
      name: "Kofi Mensah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      verified: true,
      skill: "Développeur Web",
    },
    type: "achievement",
    content: "Fier d'avoir terminé ce site e-commerce pour une PME locale ! 🚀 Nouveau projet en approche.",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    likes: 189,
    comments: 32,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
  },
  {
    id: "p3",
    author: {
      id: "3",
      name: "Fatoumata Diallo",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
      verified: true,
      skill: "Couturière",
    },
    type: "service",
    content: "Nouvelle collection de robes traditionnelles disponibles ! DM pour commander 💜",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=800",
    likes: 412,
    comments: 78,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "p4",
    author: {
      id: "5",
      name: "Yao Kouassi",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      verified: false,
      skill: "Photographe",
    },
    type: "portfolio",
    content: "Session photo portrait à Abidjan. Contactez-moi pour vos projets ! 📸",
    image: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800",
    likes: 156,
    comments: 23,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "p5",
    author: {
      id: "6",
      name: "Aminata Traoré",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
      verified: true,
      skill: "Coiffeuse",
    },
    type: "achievement",
    content: "Merci à ma cliente pour sa confiance ! 😍 Tresses box braids réalisées en 4h.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
    likes: 298,
    comments: 56,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];
