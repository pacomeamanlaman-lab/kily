-- =============================================
-- TABLE: follows
-- Description: Relations de suivi entre utilisateurs (followers/following)
-- =============================================

CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (follower_id != followed_id),
  UNIQUE(follower_id, followed_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_followed_id ON follows(followed_id);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les relations de suivi
CREATE POLICY "Les utilisateurs peuvent voir toutes les relations de suivi"
  ON follows FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs peuvent suivre d'autres utilisateurs
CREATE POLICY "Les utilisateurs peuvent suivre d'autres utilisateurs"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Politique RLS: Les utilisateurs peuvent se désabonner
CREATE POLICY "Les utilisateurs peuvent se désabonner"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- =============================================
-- TABLE: saved_talents
-- Description: Talents sauvegardés par les recruteurs
-- =============================================

CREATE TABLE saved_talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contacted BOOLEAN DEFAULT FALSE,
  notes TEXT, -- Notes privées du recruteur sur ce talent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (recruiter_id != talent_id),
  UNIQUE(recruiter_id, talent_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_saved_talents_recruiter_id ON saved_talents(recruiter_id);
CREATE INDEX idx_saved_talents_talent_id ON saved_talents(talent_id);
CREATE INDEX idx_saved_talents_contacted ON saved_talents(contacted);
CREATE INDEX idx_saved_talents_created_at ON saved_talents(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE saved_talents ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les recruteurs peuvent voir leurs talents sauvegardés
CREATE POLICY "Les recruteurs peuvent voir leurs talents sauvegardés"
  ON saved_talents FOR SELECT
  USING (auth.uid() = recruiter_id);

-- Politique RLS: Les recruteurs peuvent sauvegarder des talents
CREATE POLICY "Les recruteurs peuvent sauvegarder des talents"
  ON saved_talents FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

-- Politique RLS: Les recruteurs peuvent modifier leurs sauvegardes
CREATE POLICY "Les recruteurs peuvent modifier leurs sauvegardes"
  ON saved_talents FOR UPDATE
  USING (auth.uid() = recruiter_id);

-- Politique RLS: Les recruteurs peuvent supprimer leurs sauvegardes
CREATE POLICY "Les recruteurs peuvent supprimer leurs sauvegardes"
  ON saved_talents FOR DELETE
  USING (auth.uid() = recruiter_id);

-- Commentaires pour documentation
COMMENT ON TABLE follows IS 'Relations de suivi entre utilisateurs (système de followers/following)';
COMMENT ON TABLE saved_talents IS 'Talents sauvegardés par les recruteurs pour consultation ultérieure';
COMMENT ON COLUMN saved_talents.contacted IS 'Indique si le recruteur a déjà contacté ce talent';
COMMENT ON COLUMN saved_talents.notes IS 'Notes privées du recruteur sur ce talent';
