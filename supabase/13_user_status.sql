-- =============================================
-- USER STATUS COLUMN
-- Description: Ajout de la colonne status pour gérer les statuts des utilisateurs (active, banned, suspended)
-- =============================================

-- Créer le type enum pour user_status
CREATE TYPE user_status AS ENUM ('active', 'banned', 'suspended');

-- Ajouter la colonne status à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active';

-- Mettre à jour les utilisateurs existants pour qu'ils soient tous 'active'
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Commentaire pour documentation
COMMENT ON COLUMN users.status IS 'Statut de l''utilisateur: active (actif), banned (banni), suspended (suspendu)';
