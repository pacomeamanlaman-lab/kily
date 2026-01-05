-- =============================================
-- TABLE: stories
-- Description: Stories éphémères (24h) type Instagram
-- =============================================

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thumbnail TEXT NOT NULL, -- URL de l'image/vidéo de la story
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Expiration après 24h
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_stories_author_id ON stories(author_id);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les stories non-expirées
CREATE POLICY "Les utilisateurs peuvent voir les stories actives"
  ON stories FOR SELECT
  USING (expires_at > NOW());

-- Politique RLS: Les utilisateurs authentifiés peuvent créer des stories
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs propres stories
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres stories"
  ON stories FOR DELETE
  USING (auth.uid() = author_id);

-- =============================================
-- TABLE: story_views
-- Description: Tracking des vues de stories par utilisateur
-- =============================================

CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_views_user_id ON story_views(user_id);

-- Activer Row Level Security (RLS)
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Les utilisateurs peuvent voir qui a vu leurs stories
CREATE POLICY "Les auteurs peuvent voir qui a vu leurs stories"
  ON story_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_views.story_id
      AND stories.author_id = auth.uid()
    )
  );

-- Politique RLS: Les utilisateurs peuvent marquer les stories comme vues
CREATE POLICY "Les utilisateurs peuvent marquer les stories comme vues"
  ON story_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour supprimer automatiquement les stories expirées (à exécuter via cron job)
CREATE OR REPLACE FUNCTION delete_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON TABLE stories IS 'Stories éphémères (durée de vie: 24h)';
COMMENT ON TABLE story_views IS 'Tracking des vues de stories par utilisateur';
COMMENT ON COLUMN stories.expires_at IS 'Date d''expiration de la story (24h après création)';
