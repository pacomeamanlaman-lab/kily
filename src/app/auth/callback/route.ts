// Route callback OAuth pour Google/Facebook/etc.
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase/users.service';
import { getRedirectPath } from '@/lib/supabase/users.service';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Échanger le code OAuth contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      // Attendre un peu pour que le trigger SQL crée le profil
      // (le trigger s'exécute de manière asynchrone)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer le profil utilisateur pour déterminer la redirection
      try {
        let user = await getCurrentUser();
        
        // Si le profil n'existe pas encore (le trigger n'a pas encore fonctionné),
        // on attend un peu plus et on réessaye
        if (!user) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          user = await getCurrentUser();
        }
        
        // Si toujours pas de profil, rediriger vers onboarding pour compléter le profil
        if (!user) {
          console.warn('Profil utilisateur non trouvé après OAuth, redirection vers onboarding');
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
        
        const redirectPath = getRedirectPath(user);
        
        // Si l'utilisateur n'a pas complété l'onboarding, rediriger vers onboarding
        if (!user.has_completed_onboarding) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
        
        return NextResponse.redirect(new URL(redirectPath, request.url));
      } catch (error) {
        console.error('Error getting user for redirect:', error);
        // En cas d'erreur, rediriger vers onboarding pour compléter le profil
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  // Redirection par défaut vers le feed
  return NextResponse.redirect(new URL('/feed', request.url));
}
