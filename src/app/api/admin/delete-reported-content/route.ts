import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

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

    if (userError || !currentUser?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être administrateur pour effectuer cette action' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reportId, itemType, itemId } = body;

    if (!reportId || !itemType || !itemId) {
      return NextResponse.json(
        { success: false, error: 'Données incomplètes' },
        { status: 400 }
      );
    }

    // Supprimer le contenu selon son type
    let deleteError = null;
    let tableName = '';

    switch (itemType) {
      case 'post':
        tableName = 'posts';
        break;
      case 'video':
        tableName = 'videos';
        break;
      case 'story':
        tableName = 'stories';
        break;
      case 'user':
        tableName = 'users';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Type de contenu invalide' },
          { status: 400 }
        );
    }

    const { error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Erreur lors de la suppression:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Si c'est un utilisateur, supprimer aussi de auth.users
    if (itemType === 'user') {
      try {
        await supabaseAdmin.auth.admin.deleteUser(itemId);
      } catch (authError) {
        console.warn('Erreur lors de la suppression du compte auth:', authError);
        // On continue quand même car l'utilisateur a été supprimé de la table users
      }
    }

    // Mettre à jour tous les signalements liés à ce contenu
    await supabaseAdmin
      .from('reports')
      .update({ status: 'approved' })
      .eq('reported_item_type', itemType)
      .eq('reported_item_id', itemId);

    return NextResponse.json({
      success: true,
      message: 'Contenu supprimé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur dans delete-reported-content route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

