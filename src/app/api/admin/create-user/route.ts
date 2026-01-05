import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cette route utilise la clé service pour créer un utilisateur
// Elle doit être appelée uniquement par un admin authentifié

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    // Créer un client Supabase avec la clé service
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Vérifier l'authentification de l'utilisateur qui fait la requête
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Extraire le token
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !currentUser || !currentUser.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être administrateur pour effectuer cette action' },
        { status: 403 }
      );
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { email, password, first_name, last_name, user_type, city, is_admin } = body;

    // Validation
    if (!email || !password || !first_name || !last_name || !user_type) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur dans Auth avec la clé service
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmer l'email automatiquement
      user_metadata: {
        first_name,
        last_name,
      }
    });

    if (authCreateError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authCreateError?.message || 'Erreur lors de la création de l\'utilisateur' },
        { status: 500 }
      );
    }

    // Créer le profil dans la table users
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name,
        last_name,
        user_type,
        city: city || null,
        is_admin: is_admin || false,
        verified: true,
        has_completed_onboarding: false,
      });

    if (profileError) {
      // Essayer de supprimer l'utilisateur Auth créé
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Erreur lors de la suppression de l\'utilisateur Auth:', deleteError);
      }
      return NextResponse.json(
        { success: false, error: profileError.message || 'Erreur lors de la création du profil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}

