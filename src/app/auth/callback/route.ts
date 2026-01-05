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
      // Récupérer le profil utilisateur pour déterminer la redirection
      try {
        const user = await getCurrentUser();
        const redirectPath = getRedirectPath(user);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      } catch (error) {
        console.error('Error getting user for redirect:', error);
      }
    }
  }

  // Redirection par défaut vers le feed
  return NextResponse.redirect(new URL('/feed', request.url));
}
