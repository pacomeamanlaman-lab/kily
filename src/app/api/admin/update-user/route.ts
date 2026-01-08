import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase avec service role key (bypass RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
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
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }

    // Validation des champs
    const allowedFields = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'country',
      'city',
      'commune',
      'bio',
      'user_type',
      'verified',
    ];

    const filteredUpdates: any = {};
    for (const key of allowedFields) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (filteredUpdates.email) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', filteredUpdates.email)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé par un autre utilisateur' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'utilisateur (avec service role key, bypass RLS)
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Erreur dans update-user route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

