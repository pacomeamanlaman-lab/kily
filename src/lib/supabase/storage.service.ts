// Service Supabase Storage pour gérer les uploads d'images
import { supabase, handleSupabaseError } from '../supabase';

const BUCKET_NAME = 'photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Interface pour les résultats d'upload
export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

// Valider le fichier avant l'upload
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Vérifier le type MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
};

// Générer un nom de fichier unique
const generateFileName = (userId: string, type: 'avatar' | 'cover' | 'portfolio', originalName?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName?.split('.').pop() || 'jpg';
  
  return `${type}/${userId}/${timestamp}-${random}.${extension}`;
};

// Uploader un avatar
export const uploadAvatar = async (userId: string, file: File): Promise<UploadResult> => {
  try {
    // Valider le fichier
    const validation = validateFile(file);
    if (!validation.valid) {
      return { url: '', path: '', error: validation.error };
    }

    // Générer le nom de fichier
    const fileName = generateFileName(userId, 'avatar', file.name);

    // Uploader vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false, // Ne pas écraser les fichiers existants
      });

    if (error) {
      console.error('Erreur upload avatar:', error);
      return { url: '', path: '', error: handleSupabaseError(error) };
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error: any) {
    console.error('Erreur uploadAvatar:', error);
    return {
      url: '',
      path: '',
      error: error?.message || 'Erreur lors de l\'upload de l\'avatar',
    };
  }
};

// Uploader une photo de couverture
export const uploadCoverImage = async (userId: string, file: File): Promise<UploadResult> => {
  try {
    // Valider le fichier
    const validation = validateFile(file);
    if (!validation.valid) {
      return { url: '', path: '', error: validation.error };
    }

    // Générer le nom de fichier
    const fileName = generateFileName(userId, 'cover', file.name);

    // Uploader vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erreur upload cover:', error);
      return { url: '', path: '', error: handleSupabaseError(error) };
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error: any) {
    console.error('Erreur uploadCoverImage:', error);
    return {
      url: '',
      path: '',
      error: error?.message || 'Erreur lors de l\'upload de la photo de couverture',
    };
  }
};

// Uploader une image de portfolio
export const uploadPortfolioImage = async (userId: string, file: File): Promise<UploadResult> => {
  try {
    // Valider le fichier
    const validation = validateFile(file);
    if (!validation.valid) {
      return { url: '', path: '', error: validation.error };
    }

    // Générer le nom de fichier
    const fileName = generateFileName(userId, 'portfolio', file.name);

    // Uploader vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erreur upload portfolio:', error);
      return { url: '', path: '', error: handleSupabaseError(error) };
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error: any) {
    console.error('Erreur uploadPortfolioImage:', error);
    return {
      url: '',
      path: '',
      error: error?.message || 'Erreur lors de l\'upload de l\'image du portfolio',
    };
  }
};

// Supprimer un fichier
export const deleteFile = async (path: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Erreur suppression fichier:', error);
      return { success: false, error: handleSupabaseError(error) };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erreur deleteFile:', error);
    return {
      success: false,
      error: error?.message || 'Erreur lors de la suppression du fichier',
    };
  }
};

// Obtenir l'URL publique d'un fichier
export const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
};

