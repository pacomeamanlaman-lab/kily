// Service Supabase pour la messagerie
import { supabase, handleSupabaseError } from '../supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
  // Relations
  participant_1?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
  participant_2?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

// Charger les conversations d'un utilisateur
export const loadConversations = async (userId: string): Promise<Conversation[]> => {
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
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return conversations || [];
  } catch (error: any) {
    console.error('Erreur loadConversations:', error);
    return [];
  }
};

// Obtenir ou créer une conversation entre deux utilisateurs
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string
): Promise<Conversation | null> => {
  try {
    // Vérifier si la conversation existe déjà (dans les deux sens)
    const { data: existing, error: searchError } = await supabase
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
      .or(`and(participant_1_id.eq.${userId1},participant_2_id.eq.${userId2}),and(participant_1_id.eq.${userId2},participant_2_id.eq.${userId1})`)
      .single();

    if (searchError && searchError.code !== 'PGRST116') throw searchError;
    if (existing) return existing;

    // Créer une nouvelle conversation
    const { data: newConvo, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: userId1,
        participant_2_id: userId2,
        last_message: '',
      })
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
      .single();

    if (createError) throw createError;
    return newConvo;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Charger les messages d'une conversation
export const loadMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return messages || [];
  } catch (error: any) {
    console.error('Erreur loadMessages:', error);
    return [];
  }
};

// Envoyer un message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message | null> => {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return message;
  } catch (error: any) {
    throw new Error(handleSupabaseError(error));
  }
};

// Marquer les messages d'une conversation comme lus
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erreur markMessagesAsRead:', error);
  }
};

// Obtenir le nombre de messages non lus pour un utilisateur
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error('Erreur getUnreadCount:', error);
    return 0;
  }
};

// Supprimer un message
export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur deleteMessage:', error);
    return false;
  }
};

// Supprimer une conversation
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur deleteConversation:', error);
    return false;
  }
};

// S'abonner aux nouveaux messages d'une conversation (temps réel)
export const subscribeToMessages = (
  conversationId: string,
  callback: (message: Message) => void
) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
};
