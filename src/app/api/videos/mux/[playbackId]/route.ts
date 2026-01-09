// Route API pour récupérer les infos d'une vidéo Mux
import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playbackId: string }> }
) {
  try {
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

    const { playbackId } = await params;

    // Cette route n'est pas utilisée actuellement
    // L'API Mux ne permet pas de filtrer directement par playback_id dans list()
    // On utilise /api/videos/mux-upload/[uploadId] à la place
    return NextResponse.json(
      { error: 'This endpoint is not implemented. Use /api/videos/mux-upload/[uploadId] instead.' },
      { status: 501 }
    );
  } catch (error: any) {
    console.error('Erreur récupération vidéo Mux:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la récupération de la vidéo' },
      { status: 500 }
    );
  }
}

