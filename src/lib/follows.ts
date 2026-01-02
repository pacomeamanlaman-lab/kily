// localStorage-based Follow/Unfollow system

const FOLLOWS_KEY = "kily_follows";

interface FollowsState {
  [userId: string]: string[]; // userId -> array of followedUserIds
}

// Load follows from localStorage
const loadFollows = (): FollowsState => {
  if (typeof window === "undefined") return {};

  const stored = localStorage.getItem(FOLLOWS_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Save follows to localStorage
const saveFollows = (follows: FollowsState): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
};

// Check if user is following another user
export const isFollowing = (userId: string, targetUserId: string): boolean => {
  const follows = loadFollows();
  const userFollows = follows[userId] || [];
  return userFollows.includes(targetUserId);
};

// Toggle follow/unfollow
export const toggleFollow = (
  userId: string,
  targetUserId: string
): { following: boolean; followersCount: number } => {
  const follows = loadFollows();

  if (!follows[userId]) {
    follows[userId] = [];
  }

  const alreadyFollowing = follows[userId].includes(targetUserId);

  if (alreadyFollowing) {
    // Unfollow
    follows[userId] = follows[userId].filter((id) => id !== targetUserId);
  } else {
    // Follow
    follows[userId].push(targetUserId);
  }

  saveFollows(follows);

  // Count followers for target user
  const followersCount = getFollowersCount(targetUserId);

  return {
    following: !alreadyFollowing,
    followersCount,
  };
};

// Get followers count for a user
export const getFollowersCount = (targetUserId: string): number => {
  const follows = loadFollows();
  let count = 0;

  Object.values(follows).forEach((followsList) => {
    if (followsList.includes(targetUserId)) {
      count++;
    }
  });

  return count;
};

// Get following count for a user
export const getFollowingCount = (userId: string): number => {
  const follows = loadFollows();
  return (follows[userId] || []).length;
};

// Get list of users that userId follows
export const getFollowing = (userId: string): string[] => {
  const follows = loadFollows();
  return follows[userId] || [];
};

// Get list of users following targetUserId
export const getFollowers = (targetUserId: string): string[] => {
  const follows = loadFollows();
  const followers: string[] = [];

  Object.entries(follows).forEach(([userId, followsList]) => {
    if (followsList.includes(targetUserId)) {
      followers.push(userId);
    }
  });

  return followers;
};

// Remove all follows for a user (e.g., when account is deleted)
export const removeAllFollows = (userId: string): void => {
  const follows = loadFollows();

  // Remove user's following list
  delete follows[userId];

  // Remove user from all followers lists
  Object.keys(follows).forEach((key) => {
    follows[key] = follows[key].filter((id) => id !== userId);
  });

  saveFollows(follows);
};
