-- =============================================
-- TABLE: video_comments
-- Description: Commentaires sur les vidéos
-- =============================================

CREATE TABLE video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX idx_video_comments_author_id ON video_comments(author_id);
CREATE INDEX idx_video_comments_created_at ON video_comments(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les commentaires de vidéos
CREATE POLICY "Les utilisateurs peuvent voir tous les commentaires de vidéos"
  ON video_comments FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs authentifiés peuvent commenter des vidéos
CREATE POLICY "Les utilisateurs authentifiés peuvent commenter des vidéos"
  ON video_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent modifier leurs propres commentaires de vidéos
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres commentaires de vidéos"
  ON video_comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs propres commentaires de vidéos
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres commentaires de vidéos"
  ON video_comments FOR DELETE
  USING (auth.uid() = author_id);

-- Trigger pour incrémenter/décrémenter comments_count sur videos
CREATE OR REPLACE FUNCTION update_video_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET comments_count = comments_count + 1 WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER video_comments_count_trigger
  AFTER INSERT OR DELETE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_video_comments_count();

-- Commentaires pour documentation
COMMENT ON TABLE video_comments IS 'Commentaires sur les vidéos du feed';

