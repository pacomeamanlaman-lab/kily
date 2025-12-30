// Simple auth helper for localStorage-based authentication

export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('kily_logged_in') === 'true';
};

export const getUserEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kily_user_email');
};

export const login = (email: string): void => {
  localStorage.setItem('kily_logged_in', 'true');
  localStorage.setItem('kily_user_email', email);
};

export const logout = (): void => {
  localStorage.removeItem('kily_logged_in');
  localStorage.removeItem('kily_user_email');
  localStorage.removeItem('kily_user_data');
};
