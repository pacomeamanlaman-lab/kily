// Service Supabase pour les posts
import { supabase, handleSupabaseError } from '../supabase';

export interface Post {
  id: string;
  author_id: string;
  content: string;
  images?: string[];
  category: string;
  likes_count: number;
  comments_count: number;
  views_count?: number;
  created_at: string;
  // Relations
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  parent_comment_id?: string | null;
  // Relations
  author?: {
    first_name: string;
    last_name: string;
    avatar: string;
  };
  replies?: Comment[];
}

// Charger tous les posts avec les infos de l'auteur
export const loadPosts = async (limit: number = 50): Promise<Post[]> => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
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
    return posts || [];
  } catch (error: any) {
    console.error('Erreur loadPosts:', error);
    return [];
  }
};

// Créer un nouveau post
export const createPost = async (postData: {
  content: string;
  images?: string[];
  category: string;
  author_id: string;
}): Promise<Post | null> => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: postData.author_id,
        content: postData.content,
        images: postData.images,
        category: postData.category,
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
    return post;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Obtenir un post par ID
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!author_id (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return post;
  } catch (error: any) {
    console.error('Erreur getPostById:', error);
    return null;
  }
};

// Mettre à jour un post
export const updatePost = async (
  postId: string,
  updates: {
    content?: string;
    images?: string[];
    category?: string;
  }
): Promise<Post | null> => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
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
    return post;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Supprimer un post
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur deletePost:', error);
    return false;
  }
};

// ========== LIKES ==========

// Toggle like sur un post
export const togglePostLike = async (
  postId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  try {
    // Vérifier si déjà liké
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Récupérer le nouveau count
      const post = await getPostById(postId);
      return { liked: false, likesCount: post?.likes_count || 0 };
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });

      if (insertError) throw insertError;

      // Récupérer le nouveau count
      const post = await getPostById(postId);
      return { liked: true, likesCount: post?.likes_count || 0 };
    }
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Vérifier si un post est liké par un utilisateur
export const isPostLiked = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error: any) {
    console.error('Erreur isPostLiked:', error);
    return false;
  }
};

// ========== COMMENTAIRES ==========

// Charger les commentaires d'un post avec pagination
export const loadComments = async (
  postId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ comments: Comment[]; hasMore: boolean }> => {
  try {
    // Charger les commentaires principaux (sans parent)
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!author_id (
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Charger les réponses pour chaque commentaire
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            author:users!author_id (
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
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .is('parent_comment_id', null);

    const hasMore = (count || 0) > offset + limit;

    return {
      comments: commentsWithReplies as any,
      hasMore,
    };
  } catch (error: any) {
    console.error('Erreur loadComments:', error);
    return { comments: [], hasMore: false };
  }
};

// Ajouter un commentaire
export const addComment = async (
  postId: string,
  content: string,
  authorId: string,
  parentCommentId?: string
): Promise<Comment | null> => {
  try {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: authorId,
        content,
        parent_comment_id: parentCommentId || null,
      })
      .select(`
        *,
        author:users!author_id (
          first_name,
          last_name,
          avatar
        )
      `)
      .single();

    if (error) throw error;
    return comment;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Toggle like sur un commentaire
export const toggleCommentLike = async (
  commentId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  try {
    // Vérifier si déjà liké
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Récupérer le nouveau count
      const { data: comment } = await supabase
        .from('comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      return { liked: false, likesCount: comment?.likes_count || 0 };
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({ comment_id: commentId, user_id: userId });

      if (insertError) throw insertError;

      // Récupérer le nouveau count
      const { data: comment } = await supabase
        .from('comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      return { liked: true, likesCount: comment?.likes_count || 0 };
    }
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Vérifier si un commentaire est liké par un utilisateur
export const isCommentLiked = async (commentId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error: any) {
    console.error('Erreur isCommentLiked:', error);
    return false;
  }
};

// Supprimer un commentaire
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur deleteComment:', error);
    return false;
  }
};

// Obtenir le nombre de commentaires d'un post
export const getCommentsCount = async (postId: string): Promise<number> => {
  try {
    // Compter seulement les commentaires principaux (sans parent_comment_id)
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .is('parent_comment_id', null);

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error('Erreur getCommentsCount:', error);
    return 0;
  }
};
