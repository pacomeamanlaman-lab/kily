-- =============================================
-- MIGRATION: Ajout réponses et likes aux commentaires
-- Description: Permet de répondre aux commentaires et de les liker
-- =============================================

-- ========== COMMENTS (Posts) ==========

-- Ajouter parent_comment_id pour permettre les réponses
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE comments 
    ADD COLUMN parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- ========== VIDEO_COMMENTS ==========

-- Ajouter parent_comment_id pour permettre les réponses
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'video_comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE video_comments 
    ADD COLUMN parent_comment_id UUID REFERENCES video_comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_video_comments_parent_id ON video_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- =============================================
-- TABLE: comment_likes
-- Description: Likes sur les commentaires de posts
-- =============================================

CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Activer Row Level Security (RLS)
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les likes de commentaires" ON comment_likes;
DROP POLICY IF EXISTS "Les utilisateurs peuvent liker des commentaires" ON comment_likes;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs likes de commentaires" ON comment_likes;

-- Politique RLS: Tout le monde peut voir les likes
CREATE POLICY "Les utilisateurs peuvent voir tous les likes de commentaires"
  ON comment_likes FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs peuvent liker
CREATE POLICY "Les utilisateurs peuvent liker des commentaires"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent unliker
CREATE POLICY "Les utilisateurs peuvent supprimer leurs likes de commentaires"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour incrémenter/décrémenter likes_count sur comments
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_likes_count_trigger ON comment_likes;
CREATE TRIGGER comment_likes_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- =============================================
-- TABLE: video_comment_likes
-- Description: Likes sur les commentaires de vidéos
-- =============================================

CREATE TABLE IF NOT EXISTS video_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES video_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_video_comment_likes_comment_id ON video_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_video_comment_likes_user_id ON video_comment_likes(user_id);

-- Activer Row Level Security (RLS)
ALTER TABLE video_comment_likes ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les likes de commentaires de vidéos" ON video_comment_likes;
DROP POLICY IF EXISTS "Les utilisateurs peuvent liker des commentaires de vidéos" ON video_comment_likes;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs likes de commentaires de vidéos" ON video_comment_likes;

-- Politique RLS: Tout le monde peut voir les likes
CREATE POLICY "Les utilisateurs peuvent voir tous les likes de commentaires de vidéos"
  ON video_comment_likes FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs peuvent liker
CREATE POLICY "Les utilisateurs peuvent liker des commentaires de vidéos"
  ON video_comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent unliker
CREATE POLICY "Les utilisateurs peuvent supprimer leurs likes de commentaires de vidéos"
  ON video_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour incrémenter/décrémenter likes_count sur video_comments
CREATE OR REPLACE FUNCTION update_video_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE video_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE video_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS video_comment_likes_count_trigger ON video_comment_likes;
CREATE TRIGGER video_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON video_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_video_comment_likes_count();

-- Commentaires pour documentation
COMMENT ON COLUMN comments.parent_comment_id IS 'ID du commentaire parent si c''est une réponse (1 niveau max)';
COMMENT ON COLUMN video_comments.parent_comment_id IS 'ID du commentaire parent si c''est une réponse (1 niveau max)';
COMMENT ON TABLE comment_likes IS 'Likes sur les commentaires de posts';
COMMENT ON TABLE video_comment_likes IS 'Likes sur les commentaires de vidéos';

