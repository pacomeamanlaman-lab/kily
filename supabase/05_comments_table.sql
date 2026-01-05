-- =============================================
-- TABLE: comments
-- Description: Commentaires sur les posts
-- =============================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les commentaires
CREATE POLICY "Les utilisateurs peuvent voir tous les commentaires"
  ON comments FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs authentifiés peuvent commenter
CREATE POLICY "Les utilisateurs authentifiés peuvent commenter"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent modifier leurs propres commentaires
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres commentaires"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs propres commentaires
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres commentaires"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);

-- Trigger pour incrémenter/décrémenter comments_count sur posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Commentaires pour documentation
COMMENT ON TABLE comments IS 'Commentaires sur les posts du feed';
