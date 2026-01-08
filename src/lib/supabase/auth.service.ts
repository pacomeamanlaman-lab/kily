// Service Supabase pour l'authentification
import { supabase, handleSupabaseError } from '../supabase';
import type { User } from './users.service';

// Vérifier si l'utilisateur est connecté
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
};

// Obtenir l'email de l'utilisateur connecté
export const getUserEmail = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email || null;
  } catch (error) {
    return null;
  }
};

// Connexion avec email et mot de passe
export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Échec de connexion");

    // Récupérer le profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    // Vérifier le status de l'utilisateur
    if (userProfile.status === 'banned') {
      // Déconnecter l'utilisateur immédiatement
      await supabase.auth.signOut();
      return { success: false, error: 'Votre compte a été banni. Veuillez contacter le support pour plus d\'informations.' };
    }

    if (userProfile.status === 'suspended') {
      // Déconnecter l'utilisateur immédiatement
      await supabase.auth.signOut();
      return { success: false, error: 'Votre compte a été suspendu. Veuillez contacter le support pour plus d\'informations.' };
    }

    return { success: true, user: userProfile };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

// Déconnexion
export const logout = async (): Promise<void> => {
  try {
    // Déconnexion de Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur Supabase lors de la déconnexion:', error);
      throw error;
    }
    
    // Nettoyer le localStorage au cas où
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kily_logged_in');
      localStorage.removeItem('kily_user_email');
      localStorage.removeItem('kily_user_data');
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

// Inscription (wrapper pour createUser du service users)
export const register = async (userData: {
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
}): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Import dynamique pour éviter les dépendances circulaires
    const { createUser } = await import('./users.service');

    const user = await createUser({
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      country: userData.country,
      city: userData.city,
      commune: userData.commune,
      bio: userData.bio,
      user_type: userData.userType,
      selected_skills: userData.selectedSkills,
    });

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Réinitialisation du mot de passe (envoyer email)
export const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

// Mettre à jour le mot de passe
export const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

// Obtenir la session actuelle
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Erreur getSession:', error);
    return null;
  }
};

// Écouter les changements d'état d'authentification
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
