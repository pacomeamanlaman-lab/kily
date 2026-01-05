// Service Supabase pour les stories
import { supabase, handleSupabaseError } from '../supabase';

export interface Story {
  id: string;
  author_id: string;
  thumbnail: string;
  expires_at: string;
  created_at: string;
  // Relations
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

// Charger toutes les stories actives (non expirées)
export const loadStories = async (): Promise<Story[]> => {
  try {
    const now = new Date().toISOString();

    const { data: stories, error } = await supabase
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
      .gt('expires_at', now) // Seulement les stories non expirées
      .order('created_at', { ascending: false });

    if (error) throw error;
    return stories || [];
  } catch (error: any) {
    console.error('Erreur loadStories:', error);
    return [];
  }
};

// Créer une nouvelle story
export const createStory = async (storyData: {
  image: string;
  author_id: string;
}): Promise<Story | null> => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        author_id: storyData.author_id,
        thumbnail: storyData.image,
        expires_at: expiresAt.toISOString(),
      })
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .single();

    if (error) throw error;
    return story;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Marquer une story comme vue par un utilisateur
export const markStoryAsViewed = async (
  storyId: string,
  userId: string
): Promise<void> => {
  try {
    // Utiliser upsert pour éviter les doublons
    const { error } = await supabase
      .from('story_views')
      .upsert(
        {
          story_id: storyId,
          user_id: userId,
        },
        { onConflict: 'story_id,user_id' }
      );

    if (error && error.code !== '23505') throw error; // Ignorer l'erreur de contrainte unique
  } catch (error: any) {
    console.error('Erreur markStoryAsViewed:', error);
  }
};

// Vérifier si une story a été vue par un utilisateur
export const isStoryViewed = async (
  storyId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error: any) {
    console.error('Erreur isStoryViewed:', error);
    return false;
  }
};

// Obtenir les IDs des stories vues par un utilisateur
export const getViewedStories = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('story_views')
      .select('story_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(v => v.story_id) || [];
  } catch (error: any) {
    console.error('Erreur getViewedStories:', error);
    return [];
  }
};

// Supprimer une story
export const deleteStory = async (storyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur deleteStory:', error);
    return false;
  }
};

// Obtenir le nombre de stories actives
export const getStoriesCount = async (): Promise<number> => {
  try {
    const now = new Date().toISOString();

    const { count, error } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', now);

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error('Erreur getStoriesCount:', error);
    return 0;
  }
};
