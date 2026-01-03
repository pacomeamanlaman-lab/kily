// localStorage-based CRUD for videos

import { Video, mockVideos } from "./videoData";

// Re-export Video type
export type { Video };

const VIDEOS_KEY = "kily_videos";

// Initialize with default videos if empty
const getDefaultVideos = (): Video[] => {
  return mockVideos;
};

// Load videos from localStorage
export const loadVideos = (): Video[] => {
  if (typeof window === "undefined") return getDefaultVideos();

  const stored = localStorage.getItem(VIDEOS_KEY);
  if (!stored) {
    // Initialize with default videos
    const defaultVideos = getDefaultVideos();
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(defaultVideos));
    return defaultVideos;
  }

  const videos: Video[] = JSON.parse(stored);
  
  // Limit to 100 most recent videos and save back if needed
  if (videos.length > 100) {
    const sortedVideos = [...videos].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });
    const limitedVideos = sortedVideos.slice(0, 100);
    try {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(limitedVideos));
      return limitedVideos;
    } catch (error) {
      // If still fails, return what we have
      console.warn('Failed to save limited videos to localStorage', error);
      return videos;
    }
  }

  return videos;
};

// Save videos to localStorage with limit to prevent quota exceeded
const saveVideos = (videos: Video[]): void => {
  if (typeof window === "undefined") return;
  
  // Limit to 100 most recent videos to prevent localStorage quota exceeded
  // Sort by createdAt (newest first) and keep only the first 100
  const sortedVideos = [...videos].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Newest first
  });
  
  const limitedVideos = sortedVideos.slice(0, 100);
  
  try {
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(limitedVideos));
  } catch (error) {
    // If still fails, try with even fewer videos
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, reducing to 50 videos');
      const reducedVideos = sortedVideos.slice(0, 50);
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(reducedVideos));
    } else {
      throw error;
    }
  }
};

// Map category from form to video category format
const mapCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    "Tech & Code": "tech",
    "Design & Créa": "design",
    "Marketing": "marketing",
    "Musique": "musique",
    "Art": "art",
    "Sport": "sport",
    "Cuisine": "cuisine",
    "Autre": "autre",
  };
  return categoryMap[category] || category.toLowerCase();
};

// Create new video
export const createVideo = (videoData: {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: string;
  author: Video["author"];
}): Video => {
  const videos = loadVideos();

  const newVideo: Video = {
    id: Date.now().toString(),
    title: videoData.title,
    description: videoData.description,
    category: mapCategory(videoData.category),
    videoUrl: videoData.videoUrl,
    thumbnail: videoData.thumbnail || videoData.videoUrl, // Use videoUrl as thumbnail if no thumbnail provided
    duration: videoData.duration || "0:00", // Use provided duration or default
    views: "0",
    likes: 0,
    comments: 0,
    shares: 0,
    author: videoData.author,
    createdAt: new Date().toISOString(),
    isPremium: false,
  };

  videos.unshift(newVideo); // Add to beginning
  saveVideos(videos);

  return newVideo;
};

// Get video by ID
export const getVideoById = (videoId: string): Video | null => {
  const videos = loadVideos();
  return videos.find((v) => v.id === videoId) || null;
};

// Update video
export const updateVideo = (
  videoId: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
  }
): Video | null => {
  const videos = loadVideos();
  const videoIndex = videos.findIndex((v) => v.id === videoId);

  if (videoIndex === -1) return null;

  const updatedVideo: Video = {
    ...videos[videoIndex],
    ...updates,
  };

  videos[videoIndex] = updatedVideo;
  saveVideos(videos);

  return updatedVideo;
};

// Delete video
export const deleteVideo = (videoId: string): boolean => {
  const videos = loadVideos();
  const filteredVideos = videos.filter((v) => v.id !== videoId);

  if (filteredVideos.length === videos.length) return false;

  saveVideos(filteredVideos);
  return true;
};

