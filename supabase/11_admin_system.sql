-- =============================================
-- ADMIN SYSTEM
-- Description: Ajout du système d'administration pour Kily
-- =============================================

-- Ajouter la colonne is_admin à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Créer un index pour améliorer les performances des requêtes admin
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Politique RLS: Les admins peuvent voir tous les utilisateurs
CREATE POLICY "Les admins peuvent voir tous les utilisateurs"
  ON users FOR SELECT
  USING (
    is_admin = TRUE OR 
    auth.uid() = id
  );

-- Politique RLS: Les admins peuvent modifier tous les profils
CREATE POLICY "Les admins peuvent modifier tous les profils"
  ON users FOR UPDATE
  USING (
    is_admin = TRUE OR 
    auth.uid() = id
  );

-- Politique RLS: Les admins peuvent supprimer tous les comptes
CREATE POLICY "Les admins peuvent supprimer tous les comptes"
  ON users FOR DELETE
  USING (
    is_admin = TRUE OR 
    auth.uid() = id
  );

-- Fonction pour promouvoir un utilisateur en admin (à utiliser avec prudence)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Trouver l'ID de l'utilisateur par email
  SELECT id INTO user_id FROM users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Promouvoir en admin
  UPDATE users SET is_admin = TRUE WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour retirer les droits admin (à utiliser avec prudence)
CREATE OR REPLACE FUNCTION demote_from_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Trouver l'ID de l'utilisateur par email
  SELECT id INTO user_id FROM users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Retirer les droits admin
  UPDATE users SET is_admin = FALSE WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour documentation
COMMENT ON COLUMN users.is_admin IS 'Indique si l''utilisateur est un administrateur de la plateforme';
COMMENT ON FUNCTION promote_to_admin IS 'Fonction pour promouvoir un utilisateur en administrateur (nécessite les droits appropriés)';
COMMENT ON FUNCTION demote_from_admin IS 'Fonction pour retirer les droits administrateur d''un utilisateur (nécessite les droits appropriés)';





