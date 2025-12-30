export interface Talent {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  skills: Skill[];
  location: {
    city: string;
    country: string;
  };
  rating: number;
  reviewCount: number;
  verified: boolean;
  portfolio: PortfolioItem[];
  joinedDate: string;
  userType: "talent" | "neighbor" | "recruiter";
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: "beginner" | "intermediate" | "expert";
  yearsExperience?: number;
  verified: boolean;
}

export type SkillCategory =
  | "cuisine"
  | "tech"
  | "artisanat"
  | "bricolage"
  | "mecanique"
  | "photographie"
  | "couture"
  | "coiffure"
  | "education"
  | "autre";

export interface PortfolioItem {
  id: string;
  type: "image" | "video";
  url: string;
  title: string;
  description?: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ReputationBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
}
