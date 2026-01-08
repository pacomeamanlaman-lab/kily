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

// Bannir un utilisateur (nécessite d'être admin)
// Utilise une API route server-side pour mettre à jour le status avec la clé service
export const banUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return { success: false, error: 'Vous devez être administrateur pour effectuer cette action' };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Vous devez être connecté pour effectuer cette action' };
    }

    const response = await fetch('/api/admin/update-user-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId, status: 'banned' }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Erreur lors du bannissement de l\'utilisateur' };
    }

    return result;
  } catch (error: any) {
    console.error('Erreur lors du bannissement:', error);
    return { success: false, error: error.message || 'Une erreur inattendue est survenue' };
  }
};

// Suspendre un utilisateur (nécessite d'être admin)
// Utilise une API route server-side pour mettre à jour le status avec la clé service
export const suspendUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return { success: false, error: 'Vous devez être administrateur pour effectuer cette action' };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Vous devez être connecté pour effectuer cette action' };
    }

    const response = await fetch('/api/admin/update-user-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId, status: 'suspended' }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Erreur lors de la suspension de l\'utilisateur' };
    }

    return result;
  } catch (error: any) {
    console.error('Erreur lors de la suspension:', error);
    return { success: false, error: error.message || 'Une erreur inattendue est survenue' };
  }
};

// Réactiver un utilisateur (nécessite d'être admin)
// Utilise une API route server-side pour mettre à jour le status avec la clé service
export const activateUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return { success: false, error: 'Vous devez être administrateur pour effectuer cette action' };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Vous devez être connecté pour effectuer cette action' };
    }

    const response = await fetch('/api/admin/update-user-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId, status: 'active' }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Erreur lors de la réactivation de l\'utilisateur' };
    }

    return result;
  } catch (error: any) {
    console.error('Erreur lors de la réactivation:', error);
    return { success: false, error: error.message || 'Une erreur inattendue est survenue' };
  }
};

// Supprimer un utilisateur (nécessite d'être admin)
// Utilise une API route server-side pour supprimer l'utilisateur avec la clé service
export const deleteUserAdmin = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Vérifier que l'utilisateur actuel est admin
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return { success: false, error: 'Vous devez être administrateur pour effectuer cette action' };
    }

    // Obtenir le token de session actuel
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Vous devez être connecté pour effectuer cette action' };
    }

    // Appeler l'API route server-side
    const response = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Erreur lors de la suppression de l\'utilisateur' };
    }

    return result;
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return { success: false, error: error.message || 'Une erreur inattendue est survenue' };
  }
};

// Mettre à jour un utilisateur (nécessite d'être admin)
export const updateUserAdmin = async (
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
    user_type?: "talent" | "neighbor" | "recruiter";
    verified?: boolean;
    status?: "active" | "banned" | "suspended";
  }
): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return { success: false, error: 'Vous devez être administrateur pour effectuer cette action' };
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: user as User };
  } catch (error: any) {
    return { success: false, error: handleSupabaseError(error) };
  }
};

// Créer un nouvel utilisateur (nécessite d'être admin)
// Utilise une API route server-side pour créer l'utilisateur avec la clé service
export const createUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: "talent" | "recruiter" | "neighbor";
  city?: string;
  is_admin?: boolean;
}): Promise<{ success: boolean; error?: string; userId?: string }> => {
  try {
    // Vérifier que l'utilisateur actuel est admin
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return { success: false, error: 'Vous devez être administrateur pour effectuer cette action' };
    }

    // Obtenir le token de session actuel
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Vous devez être connecté pour effectuer cette action' };
    }

    // Appeler l'API route server-side
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Erreur lors de la création de l\'utilisateur' };
    }

    return result;
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return { success: false, error: error.message || 'Une erreur inattendue est survenue' };
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
  totalPosts: number;
  totalVideos: number;
  totalStories: number;
  totalEngagement: number;
}> => {
  try {
    // Récupérer les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_type, verified, is_admin');

    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      // Continuer avec des valeurs par défaut
    }

    // Récupérer les posts
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (postsError) {
      console.error('Erreur lors de la récupération des posts:', postsError);
    }

    // Récupérer les vidéos
    const { count: videosCount, error: videosError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });

    if (videosError) {
      console.error('Erreur lors de la récupération des vidéos:', videosError);
    }

    // Récupérer les stories actives
    let storiesCount = 0;
    try {
      const now = new Date().toISOString();
      const { count, error: storiesError } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .gt('expires_at', now);

      if (storiesError) {
        console.error('Erreur lors de la récupération des stories:', storiesError);
      } else {
        storiesCount = count || 0;
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des stories:', err);
    }

    // Calculer l'engagement total (likes + comments)
    // Utiliser limit pour éviter de charger trop de données
    const { data: postsData, error: postsDataError } = await supabase
      .from('posts')
      .select('likes_count, comments_count')
      .limit(1000); // Limiter pour éviter les problèmes de performance

    const { data: videosData, error: videosDataError } = await supabase
      .from('videos')
      .select('likes_count, comments_count')
      .limit(1000); // Limiter pour éviter les problèmes de performance

    let totalEngagement = 0;
    if (!postsDataError && postsData) {
      totalEngagement += postsData.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0);
    }
    if (!videosDataError && videosData) {
      totalEngagement += videosData.reduce((sum, v) => sum + (v.likes_count || 0) + (v.comments_count || 0), 0);
    }

    const stats = {
      totalUsers: users?.length || 0,
      totalTalents: users?.filter(u => u.user_type === 'talent').length || 0,
      totalRecruiters: users?.filter(u => u.user_type === 'recruiter').length || 0,
      totalNeighbors: users?.filter(u => u.user_type === 'neighbor').length || 0,
      totalAdmins: users?.filter(u => u.is_admin === true).length || 0,
      verifiedUsers: users?.filter(u => u.verified === true).length || 0,
      totalPosts: postsCount || 0,
      totalVideos: videosCount || 0,
      totalStories: storiesCount || 0,
      totalEngagement: totalEngagement,
    };

    console.log('📊 Statistiques calculées:', stats);
    return stats;
  } catch (error: any) {
    console.error('❌ Erreur dans getAdminStats:', error);
    // Retourner des valeurs par défaut au lieu de throw pour éviter de bloquer
    return {
      totalUsers: 0,
      totalTalents: 0,
      totalRecruiters: 0,
      totalNeighbors: 0,
      totalAdmins: 0,
      verifiedUsers: 0,
      totalPosts: 0,
      totalVideos: 0,
      totalStories: 0,
      totalEngagement: 0,
    };
  }
};

// Obtenir les statistiques de croissance des utilisateurs (par mois)
export const getUserGrowthData = async (months: number = 7): Promise<Array<{ name: string; users: number }>> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Grouper par mois
    const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data: Record<string, number> = {};

    // Initialiser les derniers N mois avec 0
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[date.getMonth()]}`;
      data[key] = 0;
    }

    // Compter les utilisateurs par mois
    users?.forEach(user => {
      const date = new Date(user.created_at);
      const key = `${monthNames[date.getMonth()]}`;
      if (data[key] !== undefined) {
        data[key]++;
      }
    });

    // Convertir en tableau et calculer les totaux cumulatifs
    let cumulative = 0;
    return Object.entries(data).map(([name, count]) => {
      cumulative += count;
      return { name, users: cumulative };
    });
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir les statistiques de contenu publié (7 derniers jours)
export const getContentData = async (): Promise<Array<{ name: string; posts: number; videos: number; stories: number }>> => {
  try {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const data: Array<{ name: string; posts: number; videos: number; stories: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();

      // Compter les posts
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      // Compter les vidéos
      const { count: videosCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      // Compter les stories
      const { count: storiesCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      data.push({
        name: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        posts: postsCount || 0,
        videos: videosCount || 0,
        stories: storiesCount || 0,
      });
    }

    return data;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir la répartition des types d'utilisateurs
export const getUserTypeData = async (): Promise<Array<{ name: string; value: number; color: string }>> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('user_type')
      .eq('is_admin', false); // Exclure les admins

    if (error) throw error;

    const talents = users?.filter(u => u.user_type === 'talent').length || 0;
    const recruiters = users?.filter(u => u.user_type === 'recruiter').length || 0;
    const neighbors = users?.filter(u => u.user_type === 'neighbor').length || 0;

    return [
      { name: 'Talents', value: talents, color: '#8b5cf6' },
      { name: 'Recruteurs', value: recruiters, color: '#ec4899' },
      { name: 'Voisins', value: neighbors, color: '#f59e0b' },
    ];
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir le top 5 des villes actives
export const getTopCitiesData = async (): Promise<Array<{ name: string; users: number }>> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('city')
      .not('city', 'is', null);

    if (error) throw error;

    // Compter les utilisateurs par ville
    const cityCounts: Record<string, number> = {};
    users?.forEach(user => {
      if (user.city) {
        cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
      }
    });

    // Trier et prendre le top 5
    const sorted = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, users]) => ({ name, users }));

    return sorted;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir toutes les conversations (pour admin)
export const getAllConversations = async (): Promise<Array<{
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message: string;
  last_message_at: string;
  participant_1?: { id: string; first_name: string; last_name: string; avatar: string };
  participant_2?: { id: string; first_name: string; last_name: string; avatar: string };
}>> => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:users!participant_1_id (
          id,
          first_name,
          last_name,
          avatar
        ),
        participant_2:users!participant_2_id (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return conversations || [];
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir les statistiques de messages (7 derniers jours)
export const getMessagesData = async (): Promise<Array<{ name: string; messages: number }>> => {
  try {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const data: Array<{ name: string; messages: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      data.push({
        name: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        messages: count || 0,
      });
    }

    return data;
  } catch (error: any) {
    console.error('Erreur dans getMessagesData:', error);
    return [];
  }
};

// Calculer la croissance des messages (comparaison semaine actuelle vs semaine précédente)
export const getMessagesGrowth = async (): Promise<number> => {
  try {
    const now = new Date();
    
    // Semaine actuelle (7 derniers jours)
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    const currentWeekEnd = new Date(now);
    
    // Semaine précédente (jours 8-14)
    const previousWeekStart = new Date(now);
    previousWeekStart.setDate(previousWeekStart.getDate() - 14);
    const previousWeekEnd = new Date(now);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    const [
      { count: currentCount },
      { count: previousCount }
    ] = await Promise.all([
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', currentWeekStart.toISOString())
        .lte('created_at', currentWeekEnd.toISOString()),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousWeekStart.toISOString())
        .lt('created_at', previousWeekEnd.toISOString()),
    ]);

    const current = currentCount || 0;
    const previous = previousCount || 0;

    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    const growth = ((current - previous) / previous) * 100;
    return Math.round(growth);
  } catch (error: any) {
    console.error('Erreur dans getMessagesGrowth:', error);
    return 0;
  }
};

// Obtenir les statistiques de messages par heure
export const getMessagesHourlyData = async (): Promise<Array<{ hour: string; count: number }>> => {
  try {
    const hours = ['00h', '04h', '08h', '12h', '16h', '20h'];
    const data: Array<{ hour: string; count: number }> = [];

    for (const hourStr of hours) {
      const hour = parseInt(hourStr.replace('h', ''));
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0] + `T${hour.toString().padStart(2, '0')}:00:00`)
        .lt('created_at', new Date().toISOString().split('T')[0] + `T${(hour + 4).toString().padStart(2, '0')}:00:00`);

      data.push({
        hour: hourStr,
        count: count || 0,
      });
    }

    return data;
  } catch (error: any) {
    console.error('Erreur dans getMessagesHourlyData:', error);
    return [];
  }
};

// Obtenir tous les signalements (pour admin)
export const getAllReports = async (): Promise<Array<{
  id: string;
  reporter_id: string;
  reported_item_type: string;
  reported_item_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter?: { id: string; first_name: string; last_name: string; avatar: string };
}>> => {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:users!reporter_id (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    // Si la table reports n'existe pas, retourner un tableau vide
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.warn('⚠️ Table reports n\'existe pas encore. Aucun signalement à afficher.');
        return [];
      }
      throw error;
    }
    return reports || [];
  } catch (error: any) {
    console.error('Erreur dans getAllReports:', error);
    // Retourner un tableau vide au lieu de throw pour éviter de bloquer
    return [];
  }
};

// Compter les signalements multiples pour le même contenu
export const getReportsCountByItem = async (): Promise<Record<string, number>> => {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('reported_item_type, reported_item_id');

    // Si la table reports n'existe pas, retourner un objet vide
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('⚠️ Table reports n\'existe pas encore. Tous les compteurs de signalements seront à 0.');
        return {};
      }
      throw error;
    }

    // Grouper par contenu (type + id)
    const counts: Record<string, number> = {};
    reports?.forEach(report => {
      const key = `${report.reported_item_type}_${report.reported_item_id}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  } catch (error: any) {
    console.error('Erreur lors du comptage des signalements:', error);
    return {};
  }
};

// Récupérer les détails du contenu signalé
export const getReportedItemDetails = async (
  itemType: string,
  itemId: string
): Promise<{
  id: string;
  title?: string;
  content?: string;
  author?: { id: string; name: string; avatar: string };
  thumbnail?: string;
} | null> => {
  try {
    switch (itemType) {
      case 'post': {
        const { getPostById } = await import('./posts.service');
        const post = await getPostById(itemId);
        if (!post) return null;
        return {
          id: post.id,
          title: post.content?.substring(0, 100) || 'Post',
          content: post.content,
          author: post.author ? {
            id: post.author.id,
            name: `${post.author.first_name} ${post.author.last_name}`,
            avatar: post.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
          } : undefined,
          thumbnail: post.images?.[0]
        };
      }
      case 'video': {
        const { getVideoById } = await import('./videos.service');
        const video = await getVideoById(itemId);
        if (!video) return null;
        return {
          id: video.id,
          title: video.title,
          content: video.description,
          author: video.author ? {
            id: video.author.id,
            name: `${video.author.first_name} ${video.author.last_name}`,
            avatar: video.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
          } : undefined,
          thumbnail: video.thumbnail
        };
      }
      case 'story': {
        const { data: story, error } = await supabase
          .from('stories')
          .select(`
            *,
            author:users!author_id (
              id,
              first_name,
              last_name,
              avatar
            )
          `)
          .eq('id', itemId)
          .single();
        if (error || !story) return null;
        return {
          id: story.id,
          title: 'Story',
          author: story.author ? {
            id: story.author.id,
            name: `${story.author.first_name} ${story.author.last_name}`,
            avatar: story.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
          } : undefined,
          thumbnail: story.thumbnail
        };
      }
      case 'user': {
        const { getUserById } = await import('./users.service');
        const user = await getUserById(itemId);
        if (!user) return null;
        return {
          id: user.id,
          title: `${user.first_name} ${user.last_name}`,
          author: {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
          },
          thumbnail: user.avatar
        };
      }
      default:
        return null;
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération du contenu signalé:', error);
    return null;
  }
};

// Compter les signalements par contenu (post, video, story)
export const getReportsCountByContent = async (): Promise<Record<string, number>> => {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('reported_item_type, reported_item_id')
      .in('reported_item_type', ['post', 'video', 'story']);

    if (error) throw error;

    // Grouper par contenu
    const counts: Record<string, number> = {};
    reports?.forEach(report => {
      const key = `${report.reported_item_type}_${report.reported_item_id}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  } catch (error: any) {
    console.error('Erreur lors du comptage des signalements:', error);
    return {};
  }
};

// Compter les messages par conversation
export const getMessagesCountByConversation = async (): Promise<Record<string, number>> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('conversation_id');

    if (error) throw error;

    // Compter par conversation
    const counts: Record<string, number> = {};
    messages?.forEach(message => {
      if (message.conversation_id) {
        counts[message.conversation_id] = (counts[message.conversation_id] || 0) + 1;
      }
    });

    return counts;
  } catch (error: any) {
    console.error('Erreur lors du comptage des messages:', error);
    return {};
  }
};

// Vérifier si une conversation est signalée
export const getReportedConversations = async (): Promise<Set<string>> => {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('reported_item_id')
      .eq('reported_item_type', 'conversation');

    if (error) throw error;

    return new Set(reports?.map(r => r.reported_item_id) || []);
  } catch (error: any) {
    console.error('Erreur lors de la vérification des conversations signalées:', error);
    return new Set();
  }
};

// Obtenir les statistiques par ville
export const getCitiesStats = async (): Promise<Array<{
  name: string;
  country: string;
  flag: string;
  usersCount: number;
  talentsCount: number;
  postsCount: number;
  growth: number;
}>> => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, city, country, user_type')
      .not('city', 'is', null);

    if (usersError) throw usersError;

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('author_id')
      .limit(10000);

    if (postsError) throw postsError;

    // Grouper par ville
    const cityStats: Record<string, {
      name: string;
      country: string;
      flag: string;
      usersCount: number;
      talentsCount: number;
      postsCount: number;
    }> = {};

    // Compter les utilisateurs par ville
    users?.forEach(user => {
      if (user.city) {
        if (!cityStats[user.city]) {
          cityStats[user.city] = {
            name: user.city,
            country: user.country || "Non spécifié",
            flag: "🌍", // TODO: Mapper les drapeaux par pays
            usersCount: 0,
            talentsCount: 0,
            postsCount: 0,
          };
        }
        cityStats[user.city].usersCount++;
        if (user.user_type === 'talent') {
          cityStats[user.city].talentsCount++;
        }
      }
    });

    // Compter les posts par ville (via l'auteur)
    // Récupérer les utilisateurs avec leurs posts
    if (posts && users) {
      const userMap = new Map(users.map(u => [u.id, u]));
      posts.forEach(post => {
        const user = userMap.get(post.author_id);
        if (user?.city && cityStats[user.city]) {
          cityStats[user.city].postsCount++;
        }
      });
    }

    // Convertir en tableau et calculer la croissance (mock pour l'instant)
    return Object.values(cityStats).map(city => ({
      ...city,
      growth: Math.floor(Math.random() * 20) + 5, // TODO: Calculer la vraie croissance
    })).sort((a, b) => b.usersCount - a.usersCount);
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir les statistiques par catégorie
export const getCategoriesStats = async (): Promise<Array<{
  name: string;
  icon: string;
  color: string;
  talentsCount: number;
  postsCount: number;
}>> => {
  try {
    // Récupérer les compétences depuis la table skills
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('category, user_id')
      .limit(10000);

    if (skillsError) {
      console.error('Erreur lors de la récupération des skills:', skillsError);
      // Continuer sans les skills si la table n'existe pas
    }

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('category')
      .limit(10000);

    if (postsError) {
      console.error('Erreur lors de la récupération des posts:', postsError);
    }

    // Catégories par défaut avec couleurs
    const categoryColors: Record<string, { icon: string; color: string }> = {
      "Tech & Code": { icon: "Code", color: "#8b5cf6" },
      "Design & Créa": { icon: "Palette", color: "#ec4899" },
      "Marketing": { icon: "Briefcase", color: "#f59e0b" },
      "Musique": { icon: "Music", color: "#10b981" },
      "Art": { icon: "Sparkles", color: "#06b6d4" },
      "Sport": { icon: "Dumbbell", color: "#ef4444" },
      "Cuisine": { icon: "ChefHat", color: "#f97316" },
      "Bricolage": { icon: "Wrench", color: "#6366f1" },
    };

    const categoryStats: Record<string, {
      name: string;
      icon: string;
      color: string;
      talentsCount: number;
      postsCount: number;
    }> = {};

    // Compter les talents par catégorie (via la table skills)
    if (skills) {
      // Compter les utilisateurs uniques par catégorie
      const talentsByCategory: Record<string, Set<string>> = {};
      
      skills.forEach(skill => {
        const category = skill.category as string;
        if (!talentsByCategory[category]) {
          talentsByCategory[category] = new Set();
        }
        talentsByCategory[category].add(skill.user_id);
      });

      // Initialiser les stats pour chaque catégorie trouvée
      Object.keys(talentsByCategory).forEach(category => {
        if (!categoryStats[category]) {
          categoryStats[category] = {
            name: category,
            icon: categoryColors[category]?.icon || "Tag",
            color: categoryColors[category]?.color || "#8b5cf6",
            talentsCount: 0,
            postsCount: 0,
          };
        }
        categoryStats[category].talentsCount = talentsByCategory[category].size;
      });
    }

    // Mapper les catégories de l'enum aux noms affichés
    const categoryNameMap: Record<string, string> = {
      'cuisine': 'Cuisine',
      'tech': 'Tech & Code',
      'artisanat': 'Art',
      'bricolage': 'Bricolage',
      'mecanique': 'Mécanique',
      'photographie': 'Photographie',
      'couture': 'Couture',
      'coiffure': 'Coiffure',
      'education': 'Éducation',
      'autre': 'Autre'
    };

    // Compter les posts par catégorie
    if (posts) {
      posts.forEach(post => {
        if (post.category) {
          const categoryName = post.category;
          if (!categoryStats[categoryName]) {
            categoryStats[categoryName] = {
              name: categoryName,
              icon: categoryColors[categoryName]?.icon || "Tag",
              color: categoryColors[categoryName]?.color || "#8b5cf6",
              talentsCount: 0,
              postsCount: 0,
            };
          }
          categoryStats[categoryName].postsCount++;
        }
      });
    }

    // Mapper les noms de catégories pour l'affichage
    const result = Object.values(categoryStats).map(stat => ({
      ...stat,
      name: categoryNameMap[stat.name.toLowerCase()] || stat.name
    }));

    return result.sort((a, b) => (b.talentsCount + b.postsCount) - (a.talentsCount + a.postsCount));
  } catch (error: any) {
    console.error('Erreur dans getCategoriesStats:', error);
    // Retourner un tableau vide au lieu de throw pour éviter de bloquer
    return [];
  }
};

// Obtenir les top talents (par rating)
export const getTopTalents = async (limit: number = 10): Promise<Array<{
  id: string;
  name: string;
  avatar: string;
  email: string;
  rating: number;
  reviewsCount: number;
  category: string;
  badges: string[];
}>> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar, email, rating, review_count, verified')
      .eq('user_type', 'talent')
      .not('rating', 'is', null)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

    if (!users || users.length === 0) {
      return [];
    }

    const userIds = users.map(u => u.id);

    // Récupérer les compétences de tous les utilisateurs depuis la table skills
    const { data: skills } = await supabase
      .from('skills')
      .select('user_id, category')
      .in('user_id', userIds);

    // Créer un map user_id -> première catégorie de compétence
    const categoryMap = new Map<string, string>();
    skills?.forEach(skill => {
      if (!categoryMap.has(skill.user_id) && skill.category) {
        categoryMap.set(skill.user_id, skill.category);
      }
    });

    // Récupérer les badges de tous les utilisateurs
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('user_id, badge_id')
      .in('user_id', userIds);

    // Créer un map user_id -> badge_ids
    const badgesMap = new Map<string, string[]>();
    userBadges?.forEach(ub => {
      if (!badgesMap.has(ub.user_id)) {
        badgesMap.set(ub.user_id, []);
      }
      badgesMap.get(ub.user_id)!.push(ub.badge_id);
    });

    return users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}${user.last_name}`,
      email: user.email || '',
      rating: user.rating || 0,
      reviewsCount: user.review_count || 0,
      category: categoryMap.get(user.id) || "Général",
      badges: badgesMap.get(user.id) || [],
    }));
  } catch (error: any) {
    // Gérer l'erreur si la table skills n'existe pas
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      console.warn('Table skills ou user_badges n\'existe pas, retour de données sans compétences/badges');
      // Retourner les utilisateurs sans compétences/badges
      try {
        const { data: users } = await supabase
          .from('users')
          .select('id, first_name, last_name, avatar, email, rating, review_count')
          .eq('user_type', 'talent')
          .not('rating', 'is', null)
          .order('rating', { ascending: false })
          .limit(limit);

        return users?.map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}${user.last_name}`,
          email: user.email || '',
          rating: user.rating || 0,
          reviewsCount: user.review_count || 0,
          category: "Général",
          badges: [],
        })) || [];
      } catch (fallbackError) {
        console.error('Erreur dans getTopTalents (fallback):', fallbackError);
        return [];
      }
    }
    console.error('Erreur dans getTopTalents:', error);
    return [];
  }
};

// Obtenir tous les badges
export const getAllBadges = async (): Promise<Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
  usersCount: number;
}>> => {
  try {
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: false });

    // Si la table badges n'existe pas, retourner un tableau vide
    if (badgesError) {
      if (badgesError.code === '42P01' || badgesError.message.includes('does not exist')) {
        console.warn('⚠️ Table badges n\'existe pas encore. Exécutez le fichier SQL 14_badges_tables.sql');
        return [];
      }
      throw badgesError;
    }

    if (!badges || badges.length === 0) {
      return [];
    }

    // Compter le nombre d'utilisateurs par badge
    const badgeIds = badges.map(b => b.id);
    
    // Vérifier si la table user_badges existe
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .in('badge_id', badgeIds);

    // Si la table user_badges n'existe pas, tous les compteurs sont à 0
    if (userBadgesError) {
      if (userBadgesError.code === '42P01' || userBadgesError.message.includes('does not exist')) {
        console.warn('⚠️ Table user_badges n\'existe pas encore. Tous les compteurs seront à 0.');
        // Retourner les badges avec usersCount = 0
        return badges.map(badge => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          criteria: badge.criteria,
          usersCount: 0,
        }));
      }
      console.error('Erreur lors du comptage des badges:', userBadgesError);
    }

    // Compter par badge
    const counts: Record<string, number> = {};
    userBadges?.forEach(ub => {
      counts[ub.badge_id] = (counts[ub.badge_id] || 0) + 1;
    });

    return badges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
      criteria: badge.criteria,
      usersCount: counts[badge.id] || 0,
    }));
  } catch (error: any) {
    console.error('Erreur dans getAllBadges:', error);
    // En cas d'erreur, retourner un tableau vide au lieu de throw
    return [];
  }
};

// Calculer la note moyenne globale de tous les talents
export const getAverageRating = async (): Promise<number> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('rating')
      .eq('user_type', 'talent')
      .not('rating', 'is', null);

    if (error) throw error;

    if (!users || users.length === 0) return 0;

    const sum = users.reduce((acc, user) => acc + (user.rating || 0), 0);
    return parseFloat((sum / users.length).toFixed(1));
  } catch (error: any) {
    console.error('Erreur dans getAverageRating:', error);
    return 0;
  }
};

