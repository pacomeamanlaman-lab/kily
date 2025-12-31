// Mock data pour les vidéos de talents
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: string;
  likes: number;
  comments: number;
  shares: number;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  category: string;
  createdAt: string;
  isPremium: boolean;
}

export const mockVideos: Video[] = [
  {
    id: "1",
    title: "Pâtisserie traditionnelle ivoirienne",
    description: "Découvrez comment faire le parfait gâteau de patate douce 🍠✨",
    thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=700&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "0:45",
    views: "125K",
    likes: 8500,
    comments: 234,
    shares: 89,
    author: {
      id: "1",
      name: "Amina Koné",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      verified: true,
    },
    category: "cuisine",
    createdAt: "2024-01-15",
    isPremium: false,
  },
  {
    id: "2",
    title: "Coiffure africaine en 2 minutes",
    description: "Tressage rapide et élégant pour toutes occasions 💇🏾‍♀️",
    thumbnail: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=700&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "1:32",
    views: "89K",
    likes: 5600,
    comments: 178,
    shares: 67,
    author: {
      id: "3",
      name: "Fatoumata Diallo",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      verified: true,
    },
    category: "beaute",
    createdAt: "2024-01-14",
    isPremium: false,
  },
  {
    id: "3",
    title: "Réparation iPhone - Écran cassé",
    description: "Tutoriel complet pour remplacer l'écran de votre iPhone 📱",
    thumbnail: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=700&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: "2:15",
    views: "210K",
    likes: 12000,
    comments: 456,
    shares: 234,
    author: {
      id: "5",
      name: "Kouassi Tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      verified: true,
    },
    category: "tech",
    createdAt: "2024-01-13",
    isPremium: false,
  },
  {
    id: "4",
    title: "Cours de danse Coupé-Décalé",
    description: "Les pas de base pour danser comme un pro 🕺🏾",
    thumbnail: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=700&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    duration: "1:48",
    views: "156K",
    likes: 9800,
    comments: 321,
    shares: 156,
    author: {
      id: "2",
      name: "Kofi Mensah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      verified: false,
    },
    category: "entertainment",
    createdAt: "2024-01-12",
    isPremium: false,
  },
  {
    id: "5",
    title: "Installation électrique maison",
    description: "Sécurité et bonnes pratiques pour votre maison 💡",
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=700&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    duration: "3:20",
    views: "78K",
    likes: 4200,
    comments: 145,
    shares: 78,
    author: {
      id: "5",
      name: "Kouassi Tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      verified: true,
    },
    category: "bricolage",
    createdAt: "2024-01-11",
    isPremium: false,
  },
  {
    id: "6",
    title: "Poulet DG - La vraie recette",
    description: "Le célèbre Poulet Directeur Général camerounais 🍗",
    thumbnail: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=700&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "2:45",
    views: "234K",
    likes: 15600,
    comments: 567,
    shares: 289,
    author: {
      id: "1",
      name: "Amina Koné",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      verified: true,
    },
    category: "cuisine",
    createdAt: "2024-01-10",
    isPremium: false,
  },
  {
    id: "7",
    title: "Création site web - Partie 1",
    description: "Apprends à créer ton premier site web from scratch 💻",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=700&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "4:12",
    views: "98K",
    likes: 6700,
    comments: 234,
    shares: 123,
    author: {
      id: "5",
      name: "Kouassi Tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      verified: true,
    },
    category: "tech",
    createdAt: "2024-01-09",
    isPremium: false,
  },
  {
    id: "8",
    title: "Tailleur - Boubou traditionnel",
    description: "Tutoriel couture d'un boubou homme élégant 👔",
    thumbnail: "https://images.unsplash.com/photo-1558769132-cb1aea3c0ee1?w=400&h=700&fit=crop",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "3:56",
    views: "67K",
    likes: 4100,
    comments: 167,
    shares: 89,
    author: {
      id: "3",
      name: "Fatoumata Diallo",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      verified: true,
    },
    category: "artisanat",
    createdAt: "2024-01-08",
    isPremium: false,
  },
];
