import { Post } from "@/components/feed/PostCard";
import { Story } from "@/components/feed/StoryCarousel";

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

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

export const mockComments: { [postId: string]: Comment[] } = {
  p1: [
    {
      id: "c1-1",
      author: "Fatou Diallo",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      content: "Magnifique ! Ça a l'air délicieux 🔥",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c1-2",
      author: "Mamadou Sow",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      content: "Tu peux me faire le même ? Je suis intéressé !",
      timestamp: new Date(Date.now() - 1.2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c1-3",
      author: "Aïcha Kamara",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      content: "Tu es où à Abidjan ? Je veux commander",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: "c1-4",
      author: "Ibrahim Sy",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      content: "La présentation est top niveau 👌",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
  p2: [
    {
      id: "c2-1",
      author: "Sarah Mensah",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
      content: "Bravo ! C'est combien pour un site comme ça ?",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c2-2",
      author: "Jean Kouadio",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      content: "Le design est propre, félicitations 💪",
      timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c2-3",
      author: "Mariam Touré",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
      content: "Tu utilises quel framework ?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  p3: [
    {
      id: "c3-1",
      author: "Khadija Ndiaye",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
      content: "Trop beau ! Tu livres à Dakar ?",
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c3-2",
      author: "Ousmane Diop",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      content: "Ma femme va adorer ça ! Je te contacte en DM",
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c3-3",
      author: "Aminata Ba",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      content: "Les couleurs sont magnifiques 😍",
      timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c3-4",
      author: "Moussa Keita",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      content: "C'est combien la robe rouge ?",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c3-5",
      author: "Binta Sow",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
      content: "Je veux la même pour le mariage de ma sœur !",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
  ],
  p4: [
    {
      id: "c4-1",
      author: "Seydou Coulibaly",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      content: "La qualité est incroyable ! Quelle caméra tu utilises ?",
      timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c4-2",
      author: "Fatoumata Cissé",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      content: "J'ai besoin de photos pour mon book, tu es dispo quand ?",
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c4-3",
      author: "Abdoulaye Traoré",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      content: "Talent 📸🔥",
      timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    },
  ],
  p5: [
    {
      id: "c5-1",
      author: "Aissatou Diallo",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
      content: "Magnifique travail ! Tu es à Abidjan ?",
      timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c5-2",
      author: "Youssouf Sanogo",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      content: "Ma copine cherche quelqu'un comme toi, je lui partage !",
      timestamp: new Date(Date.now() - 55 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c5-3",
      author: "Mariam Koné",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      content: "Les tresses sont nickel ! Bravo 👏",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c5-4",
      author: "Lamine Diabaté",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      content: "4h seulement ? Tu es rapide en plus !",
      timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    },
  ],
};
