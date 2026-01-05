-- =============================================
-- TABLE: skills
-- Description: Compétences des utilisateurs (talents principalement)
-- =============================================

-- Créer les types enum
CREATE TYPE skill_category AS ENUM (
  'cuisine',
  'tech',
  'artisanat',
  'bricolage',
  'mecanique',
  'photographie',
  'couture',
  'coiffure',
  'education',
  'autre'
);

CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'expert');

-- Créer la table skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category skill_category NOT NULL,
  level skill_level NOT NULL DEFAULT 'beginner',
  years_experience INTEGER CHECK (years_experience >= 0),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_level ON skills(level);
CREATE INDEX idx_skills_verified ON skills(verified);

-- Activer Row Level Security (RLS)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les compétences
CREATE POLICY "Les utilisateurs peuvent voir toutes les compétences"
  ON skills FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs peuvent ajouter leurs propres compétences
CREATE POLICY "Les utilisateurs peuvent ajouter leurs propres compétences"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent modifier leurs propres compétences
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres compétences"
  ON skills FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs propres compétences
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres compétences"
  ON skills FOR DELETE
  USING (auth.uid() = user_id);

-- Commentaires pour documentation
COMMENT ON TABLE skills IS 'Compétences des utilisateurs talents';
COMMENT ON COLUMN skills.category IS 'Catégorie de la compétence';
COMMENT ON COLUMN skills.level IS 'Niveau de maîtrise: beginner, intermediate, expert';
COMMENT ON COLUMN skills.verified IS 'Compétence vérifiée par l''équipe ou par d''autres utilisateurs';
