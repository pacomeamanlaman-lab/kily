// Gestion des likes de vidéos avec localStorage pour synchronisation

const LIKES_STORAGE_KEY = 'kily_video_likes';
const LIKES_COUNT_STORAGE_KEY = 'kily_video_likes_count';

export interface VideoLikesState {
  [videoId: string]: {
    liked: boolean;
    likesCount: number;
  };
}

// Charger tous les likes depuis localStorage
export const loadVideoLikes = (): VideoLikesState => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    const countsStored = localStorage.getItem(LIKES_COUNT_STORAGE_KEY);
    
    if (!stored || !countsStored) return {};
    
    const likedVideos = JSON.parse(stored) as string[];
    const likesCounts = JSON.parse(countsStored) as { [videoId: string]: number };
    
    const state: VideoLikesState = {};
    likedVideos.forEach((videoId) => {
      state[videoId] = {
        liked: true,
        likesCount: likesCounts[videoId] || 0,
      };
    });
    
    return state;
  } catch (error) {
    console.error('Error loading video likes:', error);
    return {};
  }
};

// Vérifier si une vidéo est likée
export const isVideoLiked = (videoId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    if (!stored) return false;
    
    const likedVideos = JSON.parse(stored) as string[];
    return likedVideos.includes(videoId);
  } catch (error) {
    return false;
  }
};

// Obtenir le nombre de likes pour une vidéo
export const getVideoLikesCount = (videoId: string, defaultCount: number): number => {
  if (typeof window === 'undefined') return defaultCount;
  
  try {
    const stored = localStorage.getItem(LIKES_COUNT_STORAGE_KEY);
    if (!stored) return defaultCount;
    
    const likesCounts = JSON.parse(stored) as { [videoId: string]: number };
    return likesCounts[videoId] ?? defaultCount;
  } catch (error) {
    return defaultCount;
  }
};

// Toggle le like d'une vidéo
export const toggleVideoLike = (videoId: string, currentLikesCount: number): { liked: boolean; likesCount: number } => {
  if (typeof window === 'undefined') {
    return { liked: false, likesCount: currentLikesCount };
  }
  
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    const countsStored = localStorage.getItem(LIKES_COUNT_STORAGE_KEY);
    
    let likedVideos: string[] = stored ? JSON.parse(stored) : [];
    let likesCounts: { [videoId: string]: number } = countsStored ? JSON.parse(countsStored) : {};
    
    const isLiked = likedVideos.includes(videoId);
    
    if (isLiked) {
      // Unlike
      likedVideos = likedVideos.filter((id) => id !== videoId);
      likesCounts[videoId] = Math.max(0, (likesCounts[videoId] || currentLikesCount) - 1);
    } else {
      // Like
      if (!likedVideos.includes(videoId)) {
        likedVideos.push(videoId);
      }
      likesCounts[videoId] = (likesCounts[videoId] || currentLikesCount) + 1;
    }
    
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likedVideos));
    localStorage.setItem(LIKES_COUNT_STORAGE_KEY, JSON.stringify(likesCounts));
    
    return {
      liked: !isLiked,
      likesCount: likesCounts[videoId] || currentLikesCount,
    };
  } catch (error) {
    console.error('Error toggling video like:', error);
    return { liked: false, likesCount: currentLikesCount };
  }
};

// Initialiser le nombre de likes pour une vidéo (si pas encore dans localStorage)
export const initVideoLikesCount = (videoId: string, defaultCount: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(LIKES_COUNT_STORAGE_KEY);
    const likesCounts: { [videoId: string]: number } = stored ? JSON.parse(stored) : {};
    
    if (!(videoId in likesCounts)) {
      likesCounts[videoId] = defaultCount;
      localStorage.setItem(LIKES_COUNT_STORAGE_KEY, JSON.stringify(likesCounts));
    }
  } catch (error) {
    console.error('Error initializing video likes count:', error);
  }
};



