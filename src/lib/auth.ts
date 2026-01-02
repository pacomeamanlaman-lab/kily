// Simple auth helper for localStorage-based authentication

import { getUserByEmail, setCurrentUserId, clearCurrentUser, getCurrentUser } from './users';

export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  const currentUser = getCurrentUser();
  return currentUser !== null;
};

export const getUserEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  const currentUser = getCurrentUser();
  return currentUser?.email || null;
};

export const login = (email: string): boolean => {
  const user = getUserByEmail(email);
  if (!user) {
    return false; // User not found
  }
  
  setCurrentUserId(user.id);
  localStorage.setItem('kily_logged_in', 'true');
  localStorage.setItem('kily_user_email', email);
  return true;
};

export const logout = (): void => {
  clearCurrentUser();
  localStorage.removeItem('kily_logged_in');
  localStorage.removeItem('kily_user_email');
  localStorage.removeItem('kily_user_data');
};
