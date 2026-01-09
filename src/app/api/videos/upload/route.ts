// Route API pour créer un direct upload vers Mux
import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

// Initialiser Mux avec les clés d'environnement
const mux = new Mux(
  process.env.MUX_TOKEN_ID || '',
  process.env.MUX_TOKEN_SECRET || ''
);

export async function POST(request: NextRequest) {
  try {
    // Vérifier que les clés Mux sont configurées
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: 'Mux credentials not configured' },
        { status: 500 }
      );
    }

    // Créer un direct upload
    const upload = await mux.video.directUploads.create({
      // Options de configuration
      new_asset_settings: {
        playback_policy: ['public'], // Vidéo accessible publiquement
        // Autres options possibles :
        // mp4_support: 'standard',
        // normalize_audio: true,
      },
      // CORS settings pour permettre l'upload depuis le navigateur
      cors_origin: '*',
    });

    return NextResponse.json({
      id: upload.id,
      url: upload.url,
      status: upload.status,
    });
  } catch (error: any) {
    console.error('Erreur création direct upload Mux:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la création du direct upload' },
      { status: 500 }
    );
  }
}

