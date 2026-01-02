// localStorage-based User management system

export interface User {
  id: string;
  email: string;
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

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Create new user from registration data
export const createUser = (userData: {
  email: string;
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
    createdAt: now,
    updatedAt: now,
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // Set as current user
  setCurrentUserId(userId);
  
  return newUser;
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

