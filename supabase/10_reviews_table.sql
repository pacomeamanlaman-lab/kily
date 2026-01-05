-- =============================================
-- TABLE: reviews
-- Description: Avis et évaluations entre utilisateurs
-- =============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (from_user_id != to_user_id),
  UNIQUE(from_user_id, to_user_id) -- Un utilisateur ne peut laisser qu'un seul avis par utilisateur
);

-- Index pour améliorer les performances
CREATE INDEX idx_reviews_from_user_id ON reviews(from_user_id);
CREATE INDEX idx_reviews_to_user_id ON reviews(to_user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir tous les avis
CREATE POLICY "Les utilisateurs peuvent voir tous les avis"
  ON reviews FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs authentifiés peuvent laisser des avis
CREATE POLICY "Les utilisateurs peuvent laisser des avis"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Politique RLS: Les utilisateurs peuvent modifier leurs propres avis
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres avis"
  ON reviews FOR UPDATE
  USING (auth.uid() = from_user_id);

-- Politique RLS: Les utilisateurs peuvent supprimer leurs propres avis
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres avis"
  ON reviews FOR DELETE
  USING (auth.uid() = from_user_id);

-- Trigger pour mettre à jour automatiquement rating et review_count sur users
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  total_reviews INTEGER;
BEGIN
  -- Calculer la moyenne et le nombre total d'avis pour l'utilisateur concerné
  IF TG_OP = 'DELETE' THEN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, total_reviews
    FROM reviews
    WHERE to_user_id = OLD.to_user_id;

    UPDATE users
    SET
      rating = COALESCE(avg_rating, 0),
      review_count = total_reviews
    WHERE id = OLD.to_user_id;

    RETURN OLD;
  ELSE
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, total_reviews
    FROM reviews
    WHERE to_user_id = NEW.to_user_id;

    UPDATE users
    SET
      rating = avg_rating,
      review_count = total_reviews
    WHERE id = NEW.to_user_id;

    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Commentaires pour documentation
COMMENT ON TABLE reviews IS 'Avis et évaluations entre utilisateurs (système de réputation)';
COMMENT ON COLUMN reviews.rating IS 'Note de 1 à 5 étoiles';
COMMENT ON COLUMN reviews.comment IS 'Commentaire textuel accompagnant la note';
