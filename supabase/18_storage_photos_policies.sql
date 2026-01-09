-- =============================================
-- STORAGE BUCKET: photos
-- Description: Politiques RLS pour le bucket de stockage des photos
-- =============================================

-- IMPORTANT: Ce script doit être exécuté avec les permissions admin
-- Si vous obtenez une erreur de permissions, utilisez le dashboard Supabase :
-- Storage > photos > Policies > New Policy
-- Voir SETUP_STORAGE_POLICIES.md pour les instructions détaillées

-- Note: Le bucket "photos" doit être créé manuellement dans le dashboard Supabase
-- avec les paramètres suivants:
-- - Public bucket: ON
-- - Restrict file size: ON (5 MB)
-- - Restrict MIME types: ON (image/jpeg, image/png, image/webp, image/gif)

-- Supprimer les politiques existantes si elles existent (pour éviter les doublons)
-- Note: Ces commandes peuvent échouer si vous n'avez pas les permissions
-- Dans ce cas, supprimez-les manuellement via le dashboard
DO $$
BEGIN
  DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent uploader leurs propres photos" ON storage.objects;
  DROP POLICY IF EXISTS "Tout le monde peut lire les photos publiques" ON storage.objects;
  DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent supprimer leurs propres photos" ON storage.objects;
  DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent mettre à jour leurs propres photos" ON storage.objects;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Permissions insuffisantes pour supprimer les politiques. Supprimez-les manuellement via le dashboard.';
END $$;

-- Politique 1: Lecture publique (car le bucket est public)
-- Permet à tout le monde de lire les fichiers du bucket "photos"
CREATE POLICY "Tout le monde peut lire les photos publiques"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

-- Politique 2: Upload pour les utilisateurs authentifiés
-- Les utilisateurs peuvent uploader uniquement dans leur propre dossier
-- Structure: photos/{type}/{userId}/...
-- Exemple: photos/avatar/{userId}/timestamp-random.jpg
CREATE POLICY "Les utilisateurs authentifiés peuvent uploader leurs propres photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' 
  AND (
    -- Vérifier que le chemin commence par avatar/{userId}/, cover/{userId}/, ou portfolio/{userId}/
    (string_to_array(name, '/'))[1] = 'avatar' AND (string_to_array(name, '/'))[2] = auth.uid()::text
    OR
    (string_to_array(name, '/'))[1] = 'cover' AND (string_to_array(name, '/'))[2] = auth.uid()::text
    OR
    (string_to_array(name, '/'))[1] = 'portfolio' AND (string_to_array(name, '/'))[2] = auth.uid()::text
  )
);

-- Politique 3: Mise à jour pour les utilisateurs authentifiés
-- Les utilisateurs peuvent mettre à jour uniquement leurs propres fichiers
CREATE POLICY "Les utilisateurs authentifiés peuvent mettre à jour leurs propres photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos' 
  AND (
    (string_to_array(name, '/'))[1] = 'avatar' AND (string_to_array(name, '/'))[2] = auth.uid()::text
    OR
    (string_to_array(name, '/'))[1] = 'cover' AND (string_to_array(name, '/'))[2] = auth.uid()::text
    OR
    (string_to_array(name, '/'))[1] = 'portfolio' AND (string_to_array(name, '/'))[2] = auth.uid()::text
  )
);

-- Politique 4: Suppression pour les utilisateurs authentifiés
-- Les utilisateurs peuvent supprimer uniquement leurs propres fichiers
CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer leurs propres photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' 
  AND (
    (string_to_array(name, '/'))[1] = 'avatar' AND (string_to_array(name, '/'))[2] = auth.uid()::text
    OR
    (string_to_array(name, '/'))[1] = 'cover' AND (string_to_array(name, '/'))[2] = auth.uid()::text
    OR
    (string_to_array(name, '/'))[1] = 'portfolio' AND (string_to_array(name, '/'))[2] = auth.uid()::text
  )
);

-- Commentaires pour documentation
COMMENT ON POLICY "Tout le monde peut lire les photos publiques" ON storage.objects IS 
'Permet la lecture publique de toutes les photos du bucket photos (bucket public)';

COMMENT ON POLICY "Les utilisateurs authentifiés peuvent uploader leurs propres photos" ON storage.objects IS 
'Permet aux utilisateurs authentifiés d''uploader des photos uniquement dans leur propre dossier (avatar/{userId}/, cover/{userId}/, portfolio/{userId}/)';

COMMENT ON POLICY "Les utilisateurs authentifiés peuvent mettre à jour leurs propres photos" ON storage.objects IS 
'Permet aux utilisateurs authentifiés de mettre à jour leurs propres photos';

COMMENT ON POLICY "Les utilisateurs authentifiés peuvent supprimer leurs propres photos" ON storage.objects IS 
'Permet aux utilisateurs authentifiés de supprimer leurs propres photos';
