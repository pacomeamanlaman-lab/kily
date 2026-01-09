// Route API pour créer un direct upload vers Mux
import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

export async function POST(request: NextRequest) {
  try {
    // Vérifier que les clés Mux sont configurées
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: 'Mux credentials not configured' },
        { status: 500 }
      );
    }

    // Initialiser Mux avec les clés d'environnement
    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    });

    // Vérifier que mux.video.uploads existe
    if (!mux.video || !mux.video.uploads) {
      console.error('Mux API structure error:', {
        hasVideo: !!mux.video,
        hasUploads: !!(mux.video?.uploads),
      });
      return NextResponse.json(
        { error: 'Mux API structure error' },
        { status: 500 }
      );
    }

    // Créer un direct upload (utiliser uploads au lieu de directUploads)
    const uploadResponse = await mux.video.uploads.create({
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

    // La réponse Mux est directement l'objet upload
    const upload = uploadResponse as any;

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

