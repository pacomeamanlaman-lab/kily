import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
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
    const { contentId, contentType } = body;

    // Validation
    if (!contentId || !contentType) {
      return NextResponse.json(
        { success: false, error: 'ID et type de contenu requis' },
        { status: 400 }
      );
    }

    // Supprimer selon le type
    let error = null;

    switch (contentType) {
      case 'post':
        const { error: postError } = await supabaseAdmin
          .from('posts')
          .delete()
          .eq('id', contentId);
        error = postError;
        break;

      case 'video':
        const { error: videoError } = await supabaseAdmin
          .from('videos')
          .delete()
          .eq('id', contentId);
        error = videoError;
        break;

      case 'story':
        const { error: storyError } = await supabaseAdmin
          .from('stories')
          .delete()
          .eq('id', contentId);
        error = storyError;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Type de contenu invalide' },
          { status: 400 }
        );
    }

    if (error) {
      console.error('Erreur lors de la suppression:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${contentType} supprimé avec succès`
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du contenu:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
