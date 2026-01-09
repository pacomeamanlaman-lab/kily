// Service Mux pour gérer les vidéos
// Note: Les clés secrètes doivent être utilisées uniquement côté serveur

export interface MuxDirectUpload {
  id: string;
  url: string;
  status: string;
  playback_id?: string;
}

export interface MuxVideo {
  id: string;
  playback_id: string;
  status: string;
  duration?: number;
  aspect_ratio?: string;
  max_stored_frame_rate?: number;
  max_stored_resolution?: string;
}

// Créer un direct upload URL (appelé depuis l'API route)
export const createDirectUpload = async (): Promise<MuxDirectUpload> => {
  const response = await fetch('/api/videos/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du direct upload');
  }

  return response.json();
};

// Uploader une vidéo directement vers Mux
export const uploadVideoToMux = async (
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Suivre la progression
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

// Récupérer les informations d'une vidéo Mux par playback_id
export const getMuxVideoByPlaybackId = async (playbackId: string): Promise<MuxVideo | null> => {
  try {
    const response = await fetch(`/api/videos/mux/${playbackId}`);
    
    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Erreur getMuxVideoByPlaybackId:', error);
    return null;
  }
};

