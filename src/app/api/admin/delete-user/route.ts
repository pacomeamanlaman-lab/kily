import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase avec service role key (bypass RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier que l'utilisateur est admin
    const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin (avec service role pour bypass RLS)
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !currentUser?.is_admin) {
      return NextResponse.json(
        { error: 'Vous devez être administrateur pour effectuer cette action' },
        { status: 403 }
      );
    }

    // Récupérer l'ID de l'utilisateur à supprimer depuis le body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur cible n'est pas un admin
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (targetError) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (targetUser?.is_admin) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un administrateur' },
        { status: 403 }
      );
    }

    // Supprimer l'utilisateur de la table users (avec service role key, bypass RLS)
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'utilisateur' },
        { status: 500 }
      );
    }

    // Optionnel: Supprimer aussi de auth.users (compte d'authentification)
    // Attention: cela supprimera complètement le compte
    try {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authDeleteError) {
        console.warn('Erreur lors de la suppression du compte auth:', authDeleteError);
        // On continue quand même car l'utilisateur a été supprimé de la table users
      }
    } catch (authError) {
      console.warn('Erreur lors de la suppression du compte auth:', authError);
      // On continue quand même
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur dans delete-user route:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

