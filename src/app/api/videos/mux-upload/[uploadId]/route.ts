// Route API pour récupérer les infos d'un direct upload Mux
import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux(
  process.env.MUX_TOKEN_ID || '',
  process.env.MUX_TOKEN_SECRET || ''
);

export async function GET(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  try {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: 'Mux credentials not configured' },
        { status: 500 }
      );
    }

    const { uploadId } = params;

    // Récupérer le direct upload
    const upload = await mux.video.directUploads.retrieve(uploadId);

    // Si l'upload est terminé et a un asset_id, récupérer l'asset
    if (upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id);
      
      return NextResponse.json({
        id: upload.id,
        status: upload.status,
        asset_id: upload.asset_id,
        playback_id: asset.playback_ids?.[0]?.id || null,
        asset_status: asset.status,
      });
    }

    return NextResponse.json({
      id: upload.id,
      status: upload.status,
      asset_id: null,
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

