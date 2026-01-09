// Route API pour récupérer les infos d'un direct upload Mux
import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
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

    const { uploadId } = await params;

    // Récupérer le direct upload (utiliser uploads au lieu de directUploads)
    const uploadResponse = await mux.video.uploads.retrieve(uploadId);
    
    // La réponse Mux est directement l'objet upload
    const upload = uploadResponse as any;

    // Si l'upload est terminé et a un asset_id, récupérer l'asset
    if (upload.asset_id) {
      const assetResponse = await mux.video.assets.retrieve(upload.asset_id);
      const asset = assetResponse as any;
      
      // Récupérer le playback_id depuis l'asset
      const playbackId = asset.playback_ids?.[0]?.id || null;
      
      return NextResponse.json({
        id: upload.id,
        status: upload.status,
        asset_id: upload.asset_id,
        playback_id: playbackId,
        asset_status: asset.status || null,
      });
    }

    return NextResponse.json({
      id: upload.id || uploadId,
      status: upload.status || 'waiting',
      asset_id: upload.asset_id || null,
      playback_id: null,
      asset_status: null,
    });
  } catch (error: any) {
    console.error('Erreur récupération direct upload Mux:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la récupération du direct upload' },
      { status: 500 }
    );
  }
}

