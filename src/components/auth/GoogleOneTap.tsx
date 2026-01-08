'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getRedirectPath } from '@/lib/supabase/users.service';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
          }) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoSelect?: boolean;
}

export default function GoogleOneTap({ onSuccess, onError, autoSelect = true }: GoogleOneTapProps) {
  const router = useRouter();
  const isInitialized = useRef(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'your-google-client-id-here.apps.googleusercontent.com') {
      console.warn('Google Client ID not configured');
      return;
    }

    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Utilisateur déjà connecté, ne pas afficher One Tap
        return true;
      }
      return false;
    };

    // Charger le script Google Identity Services
    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi-script')) {
        initializeGoogleOneTap();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleOneTap();
      };
      document.body.appendChild(script);
    };

    const initializeGoogleOneTap = async () => {
      if (isInitialized.current) return;

      const isLoggedIn = await checkAuth();
      if (isLoggedIn) return;

      if (!window.google) {
        console.warn('Google Identity Services not loaded');
        return;
      }

      isInitialized.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: autoSelect,
        cancel_on_tap_outside: false,
        context: 'signin',
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap not displayed:', notification);
        }
      });
    };

    const handleCredentialResponse = async (response: { credential: string }) => {
      try {
        // Décoder le JWT pour obtenir l'email (optionnel, pour debug)
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        console.log('Google One Tap user:', payload.email);

        // Pour l'instant, on redirige vers le flow OAuth standard
        // car signInWithIdToken nécessite une configuration spéciale
        // Déclencher le flow OAuth classique
        const origin = window.location.origin;
        const redirectUrl = `${origin}/auth/callback`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
              login_hint: payload.email, // Pré-remplir l'email
            },
          },
        });

        if (error) throw error;
      } catch (error: any) {
        console.error('Google One Tap error:', error);
        onError?.(error.message || 'Erreur de connexion avec Google');
      }
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [router, onSuccess, onError, autoSelect]);

  return null; // Ce composant ne rend rien visuellement
}
