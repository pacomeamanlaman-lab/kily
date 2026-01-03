// localStorage-based system for hiding posts/videos

const HIDDEN_CONTENT_KEY = "kily_hidden_content";

interface HiddenContent {
  posts: string[]; // Array of post IDs
  videos: string[]; // Array of video IDs
}

// Load hidden content from localStorage
const loadHiddenContent = (): HiddenContent => {
  if (typeof window === "undefined") return { posts: [], videos: [] };

  const stored = localStorage.getItem(HIDDEN_CONTENT_KEY);
  return stored ? JSON.parse(stored) : { posts: [], videos: [] };
};

// Save hidden content to localStorage
const saveHiddenContent = (hidden: HiddenContent): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(HIDDEN_CONTENT_KEY, JSON.stringify(hidden));
};

// Hide a post
export const hidePost = (postId: string): boolean => {
  const hidden = loadHiddenContent();
  
  if (!hidden.posts.includes(postId)) {
    hidden.posts.push(postId);
    saveHiddenContent(hidden);
    return true;
  }
  
  return false;
};

// Hide a video
export const hideVideo = (videoId: string): boolean => {
  const hidden = loadHiddenContent();
  
  if (!hidden.videos.includes(videoId)) {
    hidden.videos.push(videoId);
    saveHiddenContent(hidden);
    return true;
  }
  
  return false;
};

// Check if post is hidden
export const isPostHidden = (postId: string): boolean => {
  const hidden = loadHiddenContent();
  return hidden.posts.includes(postId);
};

// Check if video is hidden
export const isVideoHidden = (videoId: string): boolean => {
  const hidden = loadHiddenContent();
  return hidden.videos.includes(videoId);
};

// Unhide a post (for admin purposes)
export const unhidePost = (postId: string): boolean => {
  const hidden = loadHiddenContent();
  const index = hidden.posts.indexOf(postId);
  
  if (index > -1) {
    hidden.posts.splice(index, 1);
    saveHiddenContent(hidden);
    return true;
  }
  
  return false;
};

// Unhide a video (for admin purposes)
export const unhideVideo = (videoId: string): boolean => {
  const hidden = loadHiddenContent();
  const index = hidden.videos.indexOf(videoId);
  
  if (index > -1) {
    hidden.videos.splice(index, 1);
    saveHiddenContent(hidden);
    return true;
  }
  
  return false;
};

// Get all hidden post IDs
export const getHiddenPosts = (): string[] => {
  const hidden = loadHiddenContent();
  return hidden.posts;
};

// Get all hidden video IDs
export const getHiddenVideos = (): string[] => {
  const hidden = loadHiddenContent();
  return hidden.videos;
};

