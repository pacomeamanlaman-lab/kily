// localStorage-based CRUD for stories

export interface Story {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  thumbnail: string;
  viewed: boolean;
  timestamp: string;
  expiresAt: string; // Stories expire after 24h
}

const STORIES_KEY = "kily_stories";
const VIEWED_STORIES_KEY = "kily_viewed_stories";

// Initialize with default stories
const getDefaultStories = (): Story[] => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "1",
      author: {
        id: "1",
        name: "Amina Koné",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      },
      thumbnail: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400",
      viewed: false,
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      expiresAt,
    },
    {
      id: "2",
      author: {
        id: "2",
        name: "Kofi Mensah",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      },
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
      viewed: false,
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      expiresAt,
    },
    {
      id: "3",
      author: {
        id: "3",
        name: "Sarah Mensah",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      },
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
      viewed: false,
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      expiresAt,
    },
    {
      id: "4",
      author: {
        id: "4",
        name: "Ibrahim Diallo",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      },
      thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
      viewed: false,
      timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      expiresAt,
    },
  ];
};

// Load stories from localStorage and filter expired
export const loadStories = (): Story[] => {
  if (typeof window === "undefined") return getDefaultStories();

  const stored = localStorage.getItem(STORIES_KEY);
  const now = new Date();

  if (!stored) {
    // Initialize with default stories
    const defaultStories = getDefaultStories();
    localStorage.setItem(STORIES_KEY, JSON.stringify(defaultStories));
    return defaultStories;
  }

  const allStories: Story[] = JSON.parse(stored);

  // Filter out expired stories (older than 24h)
  const activeStories = allStories.filter((story) => {
    const expiresAt = new Date(story.expiresAt);
    return expiresAt > now;
  });

  // Save filtered stories back
  if (activeStories.length !== allStories.length) {
    localStorage.setItem(STORIES_KEY, JSON.stringify(activeStories));
  }

  return activeStories;
};

// Save stories to localStorage
const saveStories = (stories: Story[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
};

// Create new story
export const createStory = (storyData: {
  image: string;
  author: Story["author"];
}): Story => {
  const stories = loadStories();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now

  const newStory: Story = {
    id: Date.now().toString(),
    author: storyData.author,
    thumbnail: storyData.image,
    viewed: false,
    timestamp: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  stories.unshift(newStory); // Add to beginning
  saveStories(stories);

  return newStory;
};

// Mark story as viewed
export const markStoryAsViewed = (storyId: string, userId: string): void => {
  if (typeof window === "undefined") return;

  const viewedKey = `${VIEWED_STORIES_KEY}_${userId}`;
  const stored = localStorage.getItem(viewedKey);
  const viewedStories: string[] = stored ? JSON.parse(stored) : [];

  if (!viewedStories.includes(storyId)) {
    viewedStories.push(storyId);
    localStorage.setItem(viewedKey, JSON.stringify(viewedStories));
  }
};

// Check if story is viewed by user
export const isStoryViewed = (storyId: string, userId: string): boolean => {
  if (typeof window === "undefined") return false;

  const viewedKey = `${VIEWED_STORIES_KEY}_${userId}`;
  const stored = localStorage.getItem(viewedKey);
  const viewedStories: string[] = stored ? JSON.parse(stored) : [];

  return viewedStories.includes(storyId);
};

// Get viewed stories for user
export const getViewedStories = (userId: string): string[] => {
  if (typeof window === "undefined") return [];

  const viewedKey = `${VIEWED_STORIES_KEY}_${userId}`;
  const stored = localStorage.getItem(viewedKey);
  return stored ? JSON.parse(stored) : [];
};

// Delete story
export const deleteStory = (storyId: string): boolean => {
  const stories = loadStories();
  const filteredStories = stories.filter((s) => s.id !== storyId);

  if (filteredStories.length === stories.length) return false;

  saveStories(filteredStories);
  return true;
};

// Get stories count
export const getStoriesCount = (): number => {
  return loadStories().length;
};
