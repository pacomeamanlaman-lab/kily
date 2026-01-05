// Service Supabase pour la gestion des administrateurs
import { supabase, handleSupabaseError } from '../supabase';
import { getCurrentUser } from './users.service';
import type { User } from './users.service';

// Vérifier si l'utilisateur actuel est un admin
export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return user?.is_admin === true;
  } catch (error) {
    console.error('Erreur isAdmin:', error);
    return false;
  }
};

// Vérifier si un utilisateur spécifique est admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return user?.is_admin === true;
  } catch (error) {
    console.error('Erreur isUserAdmin:', error);
    return false;
  }
};

// Obtenir tous les administrateurs
export const getAllAdmins = async (): Promise<User[]> => {
  try {
    const { data: admins, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return admins || [];
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Promouvoir un utilisateur en administrateur (nécessite d'être admin)
export const promoteToAdmin = async (userEmail: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Vérifier que l'utilisateur actuel est admin
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return { success: false, error: 'Vous devez être administrateur pour effectuer cette action' };
    }

    // Appeler la fonction SQL pour promouvoir l'utilisateur
    const { data, error } = await supabase.rpc('promote_to_admin', {
      user_email: userEmail
    });

    if (error) throw error;

    if (data === false) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

// Retirer les droits admin d'un utilisateur (nécessite d'être admin)
export const demoteFromAdmin = async (userEmail: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Vérifier que l'utilisateur actuel est admin
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return { success: false, error: 'Vous devez être administrateur pour effectuer cette action' };
    }

    // Appeler la fonction SQL pour retirer les droits admin
    const { data, error } = await supabase.rpc('demote_from_admin', {
      user_email: userEmail
    });

    if (error) throw error;

    if (data === false) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

// Obtenir les statistiques admin (nombre d'utilisateurs, posts, etc.)
export const getAdminStats = async (): Promise<{
  totalUsers: number;
  totalTalents: number;
  totalRecruiters: number;
  totalNeighbors: number;
  totalAdmins: number;
  verifiedUsers: number;
}> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('user_type, verified, is_admin');

    if (error) throw error;

    const stats = {
      totalUsers: users?.length || 0,
      totalTalents: users?.filter(u => u.user_type === 'talent').length || 0,
      totalRecruiters: users?.filter(u => u.user_type === 'recruiter').length || 0,
      totalNeighbors: users?.filter(u => u.user_type === 'neighbor').length || 0,
      totalAdmins: users?.filter(u => u.is_admin === true).length || 0,
      verifiedUsers: users?.filter(u => u.verified === true).length || 0,
    };

    return stats;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

