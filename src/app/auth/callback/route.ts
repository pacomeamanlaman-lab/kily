// Route callback OAuth pour Google/Facebook/etc.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRedirectPath } from '@/lib/supabase/users.service';
import type { User } from '@/lib/supabase/users.service';

export async function GET(request: NextRequest) {
  console.log('🔥 ========== CALLBACK OAuth APPELÉ ==========');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  console.log('📍 Code OAuth reçu:', code ? 'OUI' : 'NON');

  // Utiliser l'origine de la requête pour construire les URLs de redirection
  const origin = requestUrl.origin;
  console.log('🌍 Origin:', origin);

  if (code) {
    // Créer un client Supabase pour cette requête
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Échanger le code OAuth contre une session
    console.log('🔄 Échange du code OAuth...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ Erreur lors de l\'échange du code:', error);
    } else {
      console.log('✅ Session créée, user ID:', data?.user?.id);
      console.log('📧 Email:', data?.user?.email);
    }

    if (!error && data?.user) {
      // Attendre un peu pour que le trigger SQL crée le profil
      // (le trigger s'exécute de manière asynchrone)
      console.log('⏳ Attente du trigger SQL (500ms)...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Récupérer le profil utilisateur pour déterminer la redirection
      try {
        // Récupérer directement depuis la table users avec l'ID
        console.log('🔍 Recherche du profil utilisateur...');
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('⚠️ Erreur lors de la récupération du profil:', userError);
        }

        console.log('👤 Profil trouvé:', user ? 'OUI' : 'NON');
        if (user) {
          console.log('📊 has_completed_onboarding:', user.has_completed_onboarding);
          console.log('📊 user_type:', user.user_type);
          console.log('📊 phone:', user.phone);
        }
        
        // Si le profil n'existe pas encore (le trigger n'a pas encore fonctionné),
        // on attend un peu plus et on réessaye
        if (!user || userError) {
          console.warn('Premier essai - Profil non trouvé, nouvelle tentative...');
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { data: retryUser, error: retryError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!retryUser || retryError) {
            console.error('Profil utilisateur non trouvé après OAuth:', retryError);
            return NextResponse.redirect(new URL('/onboarding', origin));
          }

          // Utiliser le résultat du retry
          const finalUser = retryUser as User;

          // Vérifier le status de l'utilisateur - bloquer les utilisateurs bannis/suspendus
          if (finalUser.status === 'banned') {
            await supabase.auth.signOut();
            return NextResponse.redirect(new URL('/login?error=banned', origin));
          }

          if (finalUser.status === 'suspended') {
            await supabase.auth.signOut();
            return NextResponse.redirect(new URL('/login?error=suspended', origin));
          }

          // Si l'utilisateur n'a pas complété l'onboarding, rediriger vers onboarding
          if (!finalUser.has_completed_onboarding) {
            console.log('🔄 Nouvel utilisateur OAuth détecté, redirection vers onboarding');
            return NextResponse.redirect(new URL('/onboarding', origin));
          }

          const redirectPath = getRedirectPath(finalUser);
          return NextResponse.redirect(new URL(redirectPath, origin));
        }

        const finalUser = user as User;

        // Vérifier le status de l'utilisateur - bloquer les utilisateurs bannis/suspendus
        if (finalUser.status === 'banned') {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL('/login?error=banned', origin));
        }

        if (finalUser.status === 'suspended') {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL('/login?error=suspended', origin));
        }

        // Si l'utilisateur n'a pas complété l'onboarding, rediriger vers onboarding
        if (!finalUser.has_completed_onboarding) {
          console.log('🔄 Nouvel utilisateur OAuth détecté, redirection vers onboarding');
          return NextResponse.redirect(new URL('/onboarding', origin));
        }

        const redirectPath = getRedirectPath(finalUser);
        return NextResponse.redirect(new URL(redirectPath, origin));
      } catch (error) {
        console.error('Error getting user for redirect:', error);
        // En cas d'erreur, rediriger vers onboarding pour compléter le profil
        return NextResponse.redirect(new URL('/onboarding', origin));
      }
    }
  }

  // Redirection par défaut vers le feed
  return NextResponse.redirect(new URL('/feed', origin));
}
