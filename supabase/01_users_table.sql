-- =============================================
-- TABLE: users
-- Description: Table principale des utilisateurs (talents, voisins, recruteurs)
-- =============================================

-- Créer le type enum pour user_type
CREATE TYPE user_type AS ENUM ('talent', 'neighbor', 'recruiter');

-- Créer la table users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Nullable pour compatibilité avec anciens comptes
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  city TEXT,
  commune TEXT,
  bio TEXT DEFAULT '',
  user_type user_type NOT NULL DEFAULT 'talent',
  avatar TEXT,
  cover_image TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  completed_projects INTEGER DEFAULT 0 CHECK (completed_projects >= 0),
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_verified ON users(verified);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at sur users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les utilisateurs peuvent lire tous les profils publics
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
  ON users FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Politique RLS: Permettre l'insertion lors de l'inscription
CREATE POLICY "Permettre l'inscription des nouveaux utilisateurs"
  ON users FOR INSERT
  WITH CHECK (true);

-- Politique RLS: Les utilisateurs peuvent supprimer leur propre compte
CREATE POLICY "Les utilisateurs peuvent supprimer leur propre compte"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- Commentaires pour documentation
COMMENT ON TABLE users IS 'Table principale des utilisateurs de la plateforme Kily';
COMMENT ON COLUMN users.user_type IS 'Type d''utilisateur: talent (freelance), neighbor (voisin), ou recruiter (recruteur)';
COMMENT ON COLUMN users.rating IS 'Note moyenne de l''utilisateur (0-5)';
COMMENT ON COLUMN users.verified IS 'Compte vérifié par l''équipe Kily';
COMMENT ON COLUMN users.has_completed_onboarding IS 'Indique si l''utilisateur a terminé le processus d''onboarding';
