// localStorage-based User management system

export interface User {
  id: string;
  email: string;
  password?: string; // Password hash (optional for backward compatibility)
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  commune?: string;
  bio: string;
  userType: "talent" | "neighbor" | "recruiter";
  selectedSkills: Array<{ name: string; category: string }>;
  avatar?: string;
  coverImage?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  portfolio: Array<{ id: string; title: string; description: string; imageUrl: string }>;
  joinedDate: string;
  hasCompletedOnboarding?: boolean; // Flag for onboarding completion
  createdAt: string;
  updatedAt: string;
}

const USERS_KEY = "kily_users";
const CURRENT_USER_KEY = "kily_current_user_id";

// Generate user ID
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Load all users from localStorage
const loadUsers = (): User[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) return [];
  
  return JSON.parse(stored);
};

// Save users to localStorage with quota management
const saveUsers = (users: User[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Cleaning up old data...');

      // Strategy: Keep only essential user data, remove heavy fields like portfolio images
      const lightUsers = users.map(user => ({
        ...user,
        portfolio: user.portfolio.map(p => ({
          ...p,
          imageUrl: p.imageUrl.startsWith('data:') ? '' : p.imageUrl, // Remove base64 images
        })),
        avatar: user.avatar?.startsWith('data:') ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}${user.lastName}` : user.avatar,
        coverImage: user.coverImage?.startsWith('data:') ? "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200" : user.coverImage,
      }));

      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(lightUsers));
        console.warn('Saved lightweight user data (images removed)');
      } catch (secondError) {
        console.error('Failed to save even after cleanup:', secondError);
        // Keep only the current user if still failing
        const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
        if (currentUserId) {
          const currentUser = lightUsers.find(u => u.id === currentUserId);
          if (currentUser) {
            localStorage.setItem(USERS_KEY, JSON.stringify([currentUser]));
            console.warn('Saved only current user to stay within quota');
          }
        }
      }
    } else {
      throw error;
    }
  }
};

// Create new user from registration data
export const createUser = (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  commune?: string;
  bio: string;
  userType: "talent" | "neighbor" | "recruiter";
  selectedSkills: Array<{ name: string; category: string }>;
}): User => {
  const users = loadUsers();
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error("Un compte avec cet email existe déjà");
  }
  
  const now = new Date().toISOString();
  const userId = generateUserId();
  
  const newUser: User = {
    id: userId,
    email: userData.email,
    password: userData.password, // Store password (in production, this should be hashed)
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    country: userData.country,
    city: userData.city,
    commune: userData.commune,
    bio: userData.bio,
    userType: userData.userType,
    selectedSkills: userData.selectedSkills,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.firstName}${userData.lastName}`,
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
    verified: false,
    rating: 0,
    reviewCount: 0,
    completedProjects: 0,
    portfolio: [],
    joinedDate: now,
    hasCompletedOnboarding: false, // New users need to complete onboarding
    createdAt: now,
    updatedAt: now,
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // Set as current user
  setCurrentUserId(userId);
  
  return newUser;
};

// Get redirect path based on user type
export const getRedirectPath = (user?: User | null): string => {
  if (!user) return "/feed";
  
  // Recruiters go to their dashboard
  if (user.userType === "recruiter") {
    return "/recruiter/dashboard";
  }
  
  // Other users go to feed
  return "/feed";
};

// Get redirect path for current user
export const getCurrentUserRedirectPath = (): string => {
  const user = getCurrentUser();
  return getRedirectPath(user);
};

// Get current user ID
export const getCurrentUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_USER_KEY);
};

// Set current user ID
export const setCurrentUserId = (userId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_USER_KEY, userId);
};

// Get current user
export const getCurrentUser = (): User | null => {
  const userId = getCurrentUserId();
  if (!userId) return null;
  
  return getUserById(userId);
};

// Get user by ID
export const getUserById = (userId: string): User | null => {
  const users = loadUsers();
  return users.find(u => u.id === userId) || null;
};

// Get user by email
export const getUserByEmail = (email: string): User | null => {
  const users = loadUsers();
  return users.find(u => u.email === email) || null;
};

// Update user
export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const users = loadUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveUsers(users);
  return users[userIndex];
};

// Delete user
export const deleteUser = (userId: string): boolean => {
  const users = loadUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  
  if (filteredUsers.length === users.length) return false;
  
  saveUsers(filteredUsers);
  
  // If deleted user is current user, clear current user
  if (getCurrentUserId() === userId) {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
  
  return true;
};

// Get user full name
export const getUserFullName = (user: User | null): string => {
  if (!user) return "Utilisateur";
  return `${user.firstName} ${user.lastName}`.trim();
};

// Get user display name (for posts, etc.)
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return "Vous";
  return getUserFullName(user);
};

// Clear current user (logout)
export const clearCurrentUser = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
};


