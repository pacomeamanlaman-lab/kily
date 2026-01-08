// Service Supabase pour la gestion des utilisateurs
import { supabase, handleSupabaseError } from '../supabase';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  city: string;
  commune?: string;
  bio: string;
  user_type: "talent" | "neighbor" | "recruiter";
  avatar?: string;
  cover_image?: string;
  verified: boolean;
  rating: number;
  review_count: number;
  completed_projects: number;
  has_completed_onboarding?: boolean;
  is_admin?: boolean;
  status?: "active" | "banned" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  city: string;
  commune?: string;
  bio: string;
  user_type: "talent" | "neighbor" | "recruiter";
  selected_skills: Array<{ name: string; category: string }>;
}

// Créer un nouvel utilisateur
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    // Nettoyer l'email (trim et lowercase)
    const cleanEmail = userData.email.trim().toLowerCase();

    // Vérifier si l'utilisateur existe déjà dans public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', cleanEmail)
      .single();

    if (existingUser) {
      throw new Error("Un compte avec cet email existe déjà");
    }

    // 1. Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: userData.password,
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      console.error('Email sent:', cleanEmail);

      // Si l'erreur est "User already registered", vérifier s'il existe dans public.users
      if (authError.message.includes('already') || authError.message.includes('existe')) {
        const { data: userInDb } = await supabase
          .from('users')
          .select('id')
          .eq('email', cleanEmail)
          .single();

        if (!userInDb) {
          throw new Error("Un problème est survenu lors de l'inscription. Veuillez contacter le support ou essayer avec un autre email.");
        }
      }

      throw authError;
    }
    if (!authData.user) throw new Error("Échec de création de l'utilisateur");

    // 2. Mettre à jour le profil utilisateur dans la table users
    // (Le trigger on_auth_user_created a déjà créé le profil de base)
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        email: cleanEmail,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        country: userData.country,
        city: userData.city,
        commune: userData.commune,
        bio: userData.bio,
        user_type: userData.user_type,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.first_name}${userData.last_name}`,
        cover_image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
        verified: false,
        rating: 0,
        review_count: 0,
        completed_projects: 0,
        has_completed_onboarding: false,
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (userError) throw userError;

    // 3. Créer les compétences si user_type est talent
    if (userData.user_type === 'talent' && userData.selected_skills.length > 0) {
      const skillsData = userData.selected_skills.map(skill => ({
        user_id: authData.user!.id,
        name: skill.name,
        category: skill.category,
        level: 'beginner' as const,
        verified: false,
      }));

      const { error: skillsError } = await supabase
        .from('skills')
        .insert(skillsData);

      if (skillsError) {
        console.error('Erreur lors de la création des compétences:', skillsError);
      }
    }

    return user;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir l'utilisateur actuel
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;
    
    // Vérifier le status de l'utilisateur - bloquer les utilisateurs bannis/suspendus
    if (user.status === 'banned' || user.status === 'suspended') {
      // Déconnecter l'utilisateur immédiatement
      await supabase.auth.signOut();
      return null;
    }
    
    // Debug: vérifier si is_admin est bien récupéré
    if (user && 'is_admin' in user) {
      console.log('👤 getCurrentUser - is_admin:', user.is_admin, 'email:', user.email);
    } else {
      console.warn('⚠️ getCurrentUser - is_admin non présent dans la réponse');
    }
    
    return user;
  } catch (error: any) {
    console.error('Erreur getCurrentUser:', error);
    return null;
  }
};

// Obtenir un utilisateur par ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return user;
  } catch (error: any) {
    console.error('Erreur getUserById:', error);
    return null;
  }
};

// Obtenir un utilisateur par email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return user;
  } catch (error: any) {
    console.error('Erreur getUserByEmail:', error);
    return null;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (
  userId: string,
  updates: Partial<User>
): Promise<User | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return user;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Supprimer un utilisateur
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur deleteUser:', error);
    return false;
  }
};

// Obtenir le nom complet d'un utilisateur
export const getUserFullName = (user: User | null): string => {
  if (!user) return "Utilisateur";
  return `${user.first_name} ${user.last_name}`.trim();
};

// Obtenir le nom d'affichage d'un utilisateur
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return "Vous";
  return getUserFullName(user);
};

// Obtenir le chemin de redirection selon le type d'utilisateur
export const getRedirectPath = (user?: User | null): string => {
  if (!user) return "/feed";

  // Les admins vont toujours au dashboard admin (priorité la plus haute)
  if (user.is_admin === true) {
    console.log('🔐 Admin détecté, redirection vers /admin/dashboard');
    return "/admin/dashboard";
  }

  // Les recruteurs vont à leur dashboard
  if (user.user_type === "recruiter") {
    return "/recruiter/dashboard";
  }

  // Les autres utilisateurs vont au feed
  return "/feed";
};

// Obtenir tous les utilisateurs (pour admin/discover)
export const getAllUsers = async (filters?: {
  user_type?: string;
  city?: string;
  verified?: boolean;
  limit?: number;
}): Promise<User[]> => {
  try {
    let query = supabase.from('users').select('*');

    if (filters?.user_type) {
      query = query.eq('user_type', filters.user_type);
    }
    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    if (filters?.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data: users, error } = await query;

    if (error) throw error;
    return users || [];
  } catch (error: any) {
    console.error('Erreur getAllUsers:', error);
    return [];
  }
};
