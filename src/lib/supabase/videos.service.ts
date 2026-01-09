// Service Supabase pour les vidéos
import { supabase, handleSupabaseError } from '../supabase';

export interface Video {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: string;
  video_url: string;
  thumbnail: string;
  duration: string;
  views_count: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_premium: boolean;
  created_at: string;
  // Relations
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

// Charger toutes les vidéos avec les infos de l'auteur
export const loadVideos = async (limit: number = 100): Promise<Video[]> => {
  try {
    const { data: videos, error } = await supabase
      .from('videos')
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return videos || [];
  } catch (error: any) {
    console.error('Erreur loadVideos:', error);
    return [];
  }
};

// Créer une nouvelle vidéo
export const createVideo = async (videoData: {
  title: string;
  description: string;
  category: string;
  video_url: string;
  thumbnail?: string;
  duration?: string;
  author_id: string;
}): Promise<Video | null> => {
  try {
    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        author_id: videoData.author_id,
        title: videoData.title,
        description: videoData.description,
        category: videoData.category.toLowerCase(),
        video_url: videoData.video_url,
        thumbnail: videoData.thumbnail || videoData.video_url,
        duration: videoData.duration || '0:00',
        views_count: '0',
        is_premium: false,
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
    return video;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir une vidéo par ID
export const getVideoById = async (videoId: string): Promise<Video | null> => {
  try {
    const { data: video, error } = await supabase
      .from('videos')
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('id', videoId)
      .single();

    if (error) throw error;
    return video;
  } catch (error: any) {
    console.error('Erreur getVideoById:', error);
    return null;
  }
};

// Mettre à jour une vidéo
export const updateVideo = async (
  videoId: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
  }
): Promise<Video | null> => {
  try {
    const { data: video, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', videoId)
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
    return video;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Supprimer une vidéo
export const deleteVideo = async (videoId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur deleteVideo:', error);
    return false;
  }
};

// ========== LIKES ==========

// Toggle like sur une vidéo
export const toggleVideoLike = async (
  videoId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  try {
    // Vérifier si déjà liké
    const { data: existingLike } = await supabase
      .from('video_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('video_likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Récupérer le nouveau count
      const video = await getVideoById(videoId);
      return { liked: false, likesCount: video?.likes_count || 0 };
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('video_likes')
        .insert({ video_id: videoId, user_id: userId });

      if (insertError) throw insertError;

      // Récupérer le nouveau count
      const video = await getVideoById(videoId);
      return { liked: true, likesCount: video?.likes_count || 0 };
    }
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Vérifier si une vidéo est likée par un utilisateur
export const isVideoLiked = async (videoId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('video_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error: any) {
    console.error('Erreur isVideoLiked:', error);
    return false;
  }
};

// ========== COMMENTAIRES ==========

export interface VideoComment {
  id: string;
  video_id: string;
  author_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  parent_comment_id?: string | null;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
  replies?: VideoComment[];
}

// Charger les commentaires d'une vidéo avec pagination
export const loadVideoComments = async (
  videoId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ comments: VideoComment[]; hasMore: boolean }> => {
  try {
    // Charger les commentaires principaux (sans parent)
    const { data: comments, error } = await supabase
      .from('video_comments')
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('video_id', videoId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Charger les réponses pour chaque commentaire
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('video_comments')
          .select(`
            *,
            author:users!author_id (
              id,
              first_name,
              last_name,
              avatar
            )
          `)
          .eq('parent_comment_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || [],
        };
      })
    );

    // Vérifier s'il y a plus de commentaires
    const { count } = await supabase
      .from('video_comments')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', videoId)
      .is('parent_comment_id', null);

    const hasMore = (count || 0) > offset + limit;

    return {
      comments: commentsWithReplies as any,
      hasMore,
    };
  } catch (error: any) {
    console.error('Erreur loadVideoComments:', error);
    return { comments: [], hasMore: false };
  }
};

// Ajouter un commentaire à une vidéo
export const addVideoComment = async (
  videoId: string,
  content: string,
  authorId: string,
  parentCommentId?: string
): Promise<VideoComment | null> => {
  try {
    const { data: comment, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: videoId,
        author_id: authorId,
        content: content.trim(),
        parent_comment_id: parentCommentId || null,
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
    return comment;
  } catch (error: any) {
    console.error('Erreur addVideoComment:', error);
    throw new Error(handleSupabaseError(error));
  }
};

// Toggle like sur un commentaire de vidéo
export const toggleVideoCommentLike = async (
  commentId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  try {
    // Vérifier si déjà liké
    const { data: existingLike } = await supabase
      .from('video_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('video_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Récupérer le nouveau count
      const { data: comment } = await supabase
        .from('video_comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      return { liked: false, likesCount: comment?.likes_count || 0 };
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('video_comment_likes')
        .insert({ comment_id: commentId, user_id: userId });

      if (insertError) throw insertError;

      // Récupérer le nouveau count
      const { data: comment } = await supabase
        .from('video_comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      return { liked: true, likesCount: comment?.likes_count || 0 };
    }
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Vérifier si un commentaire de vidéo est liké par un utilisateur
export const isVideoCommentLiked = async (commentId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('video_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error: any) {
    console.error('Erreur isVideoCommentLiked:', error);
    return false;
  }
};