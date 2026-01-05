-- =============================================
-- TABLE: posts
-- Description: Publications dans le feed social
-- =============================================

-- Créer la table posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[], -- Array d'URLs d'images (max 5)
  category TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_likes_count ON posts(likes_count DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les posts
CREATE POLICY "Les utilisateurs peuvent voir tous les posts"
  ON posts FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs authentifiés peuvent créer des posts
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent modifier leurs propres posts
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs propres posts
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- =============================================
-- TABLE: post_likes
-- Description: Likes sur les posts
-- =============================================

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- Activer Row Level Security (RLS)
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les likes
CREATE POLICY "Les utilisateurs peuvent voir tous les likes"
  ON post_likes FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs peuvent liker
CREATE POLICY "Les utilisateurs peuvent liker des posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent unliker
CREATE POLICY "Les utilisateurs peuvent supprimer leurs likes"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour incrémenter/décrémenter likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Commentaires pour documentation
COMMENT ON TABLE posts IS 'Publications dans le feed social';
COMMENT ON TABLE post_likes IS 'Likes sur les posts (relation many-to-many)';
