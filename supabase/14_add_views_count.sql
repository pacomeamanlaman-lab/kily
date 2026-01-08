-- =============================================
-- ADD views_count TO CONTENT TABLES
-- Description: Ajouter le compteur de vues aux posts, vidéos et stories
-- =============================================

-- Ajouter views_count à la table posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 CHECK (views_count >= 0);

-- Index pour améliorer les performances des requêtes triées par vues
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count DESC);

-- Ajouter views_count à la table videos
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 CHECK (views_count >= 0);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_videos_views_count ON videos(views_count DESC);

-- Ajouter views_count à la table stories
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 CHECK (views_count >= 0);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_stories_views_count ON stories(views_count DESC);

-- Fonction pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_views(content_type TEXT, content_id UUID)
RETURNS VOID AS $$
BEGIN
  IF content_type = 'post' THEN
    UPDATE posts SET views_count = views_count + 1 WHERE id = content_id;
  ELSIF content_type = 'video' THEN
    UPDATE videos SET views_count = views_count + 1 WHERE id = content_id;
  ELSIF content_type = 'story' THEN
    UPDATE stories SET views_count = views_count + 1 WHERE id = content_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON COLUMN posts.views_count IS 'Nombre de fois que le post a été vu';
COMMENT ON COLUMN videos.views_count IS 'Nombre de fois que la vidéo a été vue';
COMMENT ON COLUMN stories.views_count IS 'Nombre de fois que la story a été vue';
COMMENT ON FUNCTION increment_views IS 'Fonction pour incrémenter le compteur de vues d''un contenu';
