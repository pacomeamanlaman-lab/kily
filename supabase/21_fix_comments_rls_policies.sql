-- =============================================
-- FIX RLS POLICIES FOR COMMENTS
-- Description: Corriger les politiques RLS pour permettre à tous les utilisateurs authentifiés
-- de commenter n'importe quel post ou vidéo (pas seulement les leurs)
-- ET s'assurer que tous les utilisateurs peuvent voir TOUS les commentaires
-- =============================================

-- =============================================
-- FIX: comments table
-- =============================================

-- 1. Politique SELECT : Tout le monde peut voir tous les commentaires
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les commentaires" ON comments;
CREATE POLICY "Les utilisateurs peuvent voir tous les commentaires"
  ON comments FOR SELECT
  USING (true);

-- 2. Politique INSERT : Tout utilisateur authentifié peut commenter n'importe quel post
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent commenter" ON comments;
CREATE POLICY "Les utilisateurs authentifiés peuvent commenter"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
  );

-- =============================================
-- FIX: video_comments table
-- =============================================

-- 1. Politique SELECT : Tout le monde peut voir tous les commentaires de vidéos
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les commentaires de vidéos" ON video_comments;
CREATE POLICY "Les utilisateurs peuvent voir tous les commentaires de vidéos"
  ON video_comments FOR SELECT
  USING (true);

-- 2. Politique INSERT : Tout utilisateur authentifié peut commenter n'importe quelle vidéo
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent commenter des vidéos" ON video_comments;
CREATE POLICY "Les utilisateurs authentifiés peuvent commenter des vidéos"
  ON video_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id
  );

