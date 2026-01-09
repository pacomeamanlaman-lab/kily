// Route API pour récupérer les infos d'une vidéo Mux
import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux(
  process.env.MUX_TOKEN_ID || '',
  process.env.MUX_TOKEN_SECRET || ''
);

export async function GET(
  request: NextRequest,
  { params }: { params: { playbackId: string } }
) {
  try {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: 'Mux credentials not configured' },
        { status: 500 }
      );
    }

    const { playbackId } = params;

    // Récupérer l'asset par playback_id
    const assets = await mux.video.assets.list({
      playback_ids: [playbackId],
    });

    if (!assets.data || assets.data.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const asset = assets.data[0];

    return NextResponse.json({
      id: asset.id,
      playback_id: asset.playback_ids?.[0]?.id || playbackId,
      status: asset.status,
      duration: asset.duration,
      aspect_ratio: asset.aspect_ratio,
      max_stored_frame_rate: asset.max_stored_frame_rate,
      max_stored_resolution: asset.max_stored_resolution,
    });
  } catch (error: any) {
    console.error('Erreur récupération vidéo Mux:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la récupération de la vidéo' },
      { status: 500 }
    );
  }
}

