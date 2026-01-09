-- =============================================
-- FIX COMMENTS COUNT TRIGGERS
-- Description: Corriger les triggers pour ne compter que les commentaires principaux
-- (pas les réponses) dans comments_count
-- =============================================

-- =============================================
-- FIX: comments table trigger
-- =============================================

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS post_comments_count_trigger ON comments;

-- Recréer la fonction pour ne compter que les commentaires principaux
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Ne compter que les commentaires principaux (sans parent_comment_id)
    IF NEW.parent_comment_id IS NULL THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Ne décrémenter que si c'était un commentaire principal
    IF OLD.parent_comment_id IS NULL THEN
      UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Recalculer les compteurs existants pour être sûr qu'ils sont corrects
-- (compter seulement les commentaires principaux)
UPDATE posts
SET comments_count = (
  SELECT COUNT(*)
  FROM comments
  WHERE comments.post_id = posts.id
    AND comments.parent_comment_id IS NULL
);

-- =============================================
-- FIX: video_comments table trigger
-- =============================================

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS video_comments_count_trigger ON video_comments;

-- Recréer la fonction pour ne compter que les commentaires principaux
CREATE OR REPLACE FUNCTION update_video_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Ne compter que les commentaires principaux (sans parent_comment_id)
    IF NEW.parent_comment_id IS NULL THEN
      UPDATE videos SET comments_count = comments_count + 1 WHERE id = NEW.video_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Ne décrémenter que si c'était un commentaire principal
    IF OLD.parent_comment_id IS NULL THEN
      UPDATE videos SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.video_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER video_comments_count_trigger
  AFTER INSERT OR DELETE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_video_comments_count();

-- Recalculer les compteurs existants pour être sûr qu'ils sont corrects
-- (compter seulement les commentaires principaux)
UPDATE videos
SET comments_count = (
  SELECT COUNT(*)
  FROM video_comments
  WHERE video_comments.video_id = videos.id
    AND video_comments.parent_comment_id IS NULL
);

