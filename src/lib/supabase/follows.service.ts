// Service Supabase pour les follows et saved talents
import { supabase, handleSupabaseError } from '../supabase';

// ========== FOLLOWS ==========

// Vérifier si un utilisateur suit un autre utilisateur
export const isFollowing = async (
  userId: string,
  targetUserId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('followed_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error: any) {
    console.error('Erreur isFollowing:', error);
    return false;
  }
};

// Toggle follow/unfollow
export const toggleFollow = async (
  userId: string,
  targetUserId: string
): Promise<{ following: boolean; followersCount: number }> => {
  try {
    // Vérifier si déjà follow
    const alreadyFollowing = await isFollowing(userId, targetUserId);

    if (alreadyFollowing) {
      // Unfollow
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('followed_id', targetUserId);

      if (deleteError) throw deleteError;
    } else {
      // Follow
      const { error: insertError } = await supabase
        .from('follows')
        .insert({
          follower_id: userId,
          followed_id: targetUserId,
        });

      if (insertError) throw insertError;
    }

    // Obtenir le nouveau count de followers
    const followersCount = await getFollowersCount(targetUserId);

    return {
      following: !alreadyFollowing,
      followersCount,
    };
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir le nombre de followers d'un utilisateur
export const getFollowersCount = async (targetUserId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('followed_id', targetUserId);

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error('Erreur getFollowersCount:', error);
    return 0;
  }
};

// Obtenir le nombre de following d'un utilisateur
export const getFollowingCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error('Erreur getFollowingCount:', error);
    return 0;
  }
};

// Obtenir la liste des utilisateurs que userId suit
export const getFollowing = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('followed_id')
      .eq('follower_id', userId);

    if (error) throw error;
    return data?.map(f => f.followed_id) || [];
  } catch (error: any) {
    console.error('Erreur getFollowing:', error);
    return [];
  }
};

// Obtenir la liste des followers d'un utilisateur
export const getFollowers = async (targetUserId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('followed_id', targetUserId);

    if (error) throw error;
    return data?.map(f => f.follower_id) || [];
  } catch (error: any) {
    console.error('Erreur getFollowers:', error);
    return [];
  }
};

// ========== SAVED TALENTS (pour recruteurs) ==========

// Vérifier si un talent est sauvegardé par un recruteur
export const isTalentSaved = async (
  recruiterId: string,
  talentId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('saved_talents')
      .select('id')
      .eq('recruiter_id', recruiterId)
      .eq('talent_id', talentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error: any) {
    console.error('Erreur isTalentSaved:', error);
    return false;
  }
};

// Toggle save/unsave talent
export const toggleSaveTalent = async (
  recruiterId: string,
  talentId: string
): Promise<{ saved: boolean }> => {
  try {
    const alreadySaved = await isTalentSaved(recruiterId, talentId);

    if (alreadySaved) {
      // Unsave
      const { error } = await supabase
        .from('saved_talents')
        .delete()
        .eq('recruiter_id', recruiterId)
        .eq('talent_id', talentId);

      if (error) throw error;
      return { saved: false };
    } else {
      // Save
      const { error } = await supabase
        .from('saved_talents')
        .insert({
          recruiter_id: recruiterId,
          talent_id: talentId,
          contacted: false,
        });

      if (error) throw error;
      return { saved: true };
    }
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Charger les talents sauvegardés d'un recruteur
export const loadSavedTalents = async (recruiterId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_talents')
      .select('talent_id')
      .eq('recruiter_id', recruiterId);

    if (error) throw error;
    return data?.map(s => s.talent_id) || [];
  } catch (error: any) {
    console.error('Erreur loadSavedTalents:', error);
    return [];
  }
};

// Vérifier si un talent a été contacté
export const isTalentContacted = async (
  recruiterId: string,
  talentId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('saved_talents')
      .select('contacted')
      .eq('recruiter_id', recruiterId)
      .eq('talent_id', talentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.contacted || false;
  } catch (error: any) {
    console.error('Erreur isTalentContacted:', error);
    return false;
  }
};

// Marquer un talent comme contacté
export const markTalentAsContacted = async (
  recruiterId: string,
  talentId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_talents')
      .update({ contacted: true })
      .eq('recruiter_id', recruiterId)
      .eq('talent_id', talentId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur markTalentAsContacted:', error);
    return false;
  }
};

// Charger les talents contactés d'un recruteur
export const loadContactedTalents = async (recruiterId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_talents')
      .select('talent_id')
      .eq('recruiter_id', recruiterId)
      .eq('contacted', true);

    if (error) throw error;
    return data?.map(s => s.talent_id) || [];
  } catch (error: any) {
    console.error('Erreur loadContactedTalents:', error);
    return [];
  }
};
