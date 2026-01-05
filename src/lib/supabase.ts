// Client Supabase pour Kily
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises'
  );
}

// Client Supabase singleton
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Types d'erreur Supabase
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Traductions des erreurs Supabase communes
const ERROR_TRANSLATIONS: Record<string, string> = {
  // Auth errors
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed': 'Veuillez confirmer votre email',
  'User already registered': 'Un compte avec cet email existe déjà',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
  'Unable to validate email address: invalid format': 'Format d\'email invalide',
  'Signup requires a valid password': 'Un mot de passe valide est requis',
  'Email address is invalid': 'Adresse email invalide',

  // Database errors
  'duplicate key value violates unique constraint': 'Cette valeur existe déjà',
  'permission denied': 'Permission refusée',
  'violates foreign key constraint': 'Référence invalide',
};

// Helper pour gérer les erreurs Supabase et les traduire
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Une erreur est survenue';

  const errorMessage = error?.message || '';

  // Vérifier si le message contient "invalid" et "email"
  if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('invalid')) {
    return 'Format d\'email invalide (ex: exemple@email.com)';
  }

  // Chercher une traduction exacte
  if (ERROR_TRANSLATIONS[errorMessage]) {
    return ERROR_TRANSLATIONS[errorMessage];
  }

  // Chercher une traduction partielle
  for (const [englishMsg, frenchMsg] of Object.entries(ERROR_TRANSLATIONS)) {
    if (errorMessage.includes(englishMsg)) {
      return frenchMsg;
    }
  }

  // Si pas de traduction, retourner le message original ou un message générique
  return errorMessage || 'Une erreur est survenue';
};
