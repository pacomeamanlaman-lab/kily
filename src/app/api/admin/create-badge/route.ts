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

export async function POST(request: NextRequest) {
  try {
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

    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !currentUser?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être administrateur' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, icon, color, criteria } = body;

    if (!name || !description || !icon || !color || !criteria) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const { data: badge, error: insertError } = await supabaseAdmin
      .from('badges')
      .insert({
        name,
        description,
        icon,
        color,
        criteria,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erreur lors de la création:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      badge
    });
  } catch (error: any) {
    console.error('Erreur dans create-badge route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

