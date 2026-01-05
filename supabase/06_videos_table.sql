-- =============================================
-- TABLE: videos
-- Description: Vidéos partagées par les talents
-- =============================================

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail TEXT,
  duration TEXT DEFAULT '0:00',
  views_count TEXT DEFAULT '0', -- Stocké comme text pour compatibilité avec code existant (eg. "1.2k")
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_videos_author_id ON videos(author_id);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_likes_count ON videos(likes_count DESC);
CREATE INDEX idx_videos_is_premium ON videos(is_premium);

-- Activer Row Level Security (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les vidéos non-premium
CREATE POLICY "Les utilisateurs peuvent voir toutes les vidéos"
  ON videos FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs authentifiés peuvent créer des vidéos
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des vidéos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent modifier leurs propres vidéos
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres vidéos"
  ON videos FOR UPDATE
  USING (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs propres vidéos
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres vidéos"
  ON videos FOR DELETE
  USING (auth.uid() = author_id);

-- =============================================
-- TABLE: video_likes
-- Description: Likes sur les vidéos
-- =============================================

CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX idx_video_likes_user_id ON video_likes(user_id);

-- Activer Row Level Security (RLS)
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les likes
CREATE POLICY "Les utilisateurs peuvent voir tous les likes de vidéos"
  ON video_likes FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs peuvent liker
CREATE POLICY "Les utilisateurs peuvent liker des vidéos"
  ON video_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent unliker
CREATE POLICY "Les utilisateurs peuvent supprimer leurs likes de vidéos"
  ON video_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour incrémenter/décrémenter likes_count
CREATE OR REPLACE FUNCTION update_video_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET likes_count = likes_count + 1 WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER video_likes_count_trigger
  AFTER INSERT OR DELETE ON video_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_video_likes_count();

-- Commentaires pour documentation
COMMENT ON TABLE videos IS 'Vidéos partagées par les talents sur la plateforme';
COMMENT ON TABLE video_likes IS 'Likes sur les vidéos (relation many-to-many)';
COMMENT ON COLUMN videos.is_premium IS 'Vidéo premium (accès payant ou réservé)';
