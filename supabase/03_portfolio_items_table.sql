-- =============================================
-- TABLE: portfolio_items
-- Description: Éléments du portfolio des talents (images/vidéos)
-- =============================================

-- Créer le type enum pour le type de média
CREATE TYPE portfolio_media_type AS ENUM ('image', 'video');

-- Créer la table portfolio_items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type portfolio_media_type NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_portfolio_user_id ON portfolio_items(user_id);
CREATE INDEX idx_portfolio_type ON portfolio_items(type);
CREATE INDEX idx_portfolio_created_at ON portfolio_items(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut voir les portfolios
CREATE POLICY "Les utilisateurs peuvent voir tous les portfolios"
  ON portfolio_items FOR SELECT
  USING (true);

-- Politique RLS: Les utilisateurs peuvent ajouter à leur propre portfolio
CREATE POLICY "Les utilisateurs peuvent ajouter à leur propre portfolio"
  ON portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent modifier leur propre portfolio
CREATE POLICY "Les utilisateurs peuvent modifier leur propre portfolio"
  ON portfolio_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique RLS: Les utilisateurs peuvent supprimer de leur propre portfolio
CREATE POLICY "Les utilisateurs peuvent supprimer de leur propre portfolio"
  ON portfolio_items FOR DELETE
  USING (auth.uid() = user_id);

-- Commentaires pour documentation
COMMENT ON TABLE portfolio_items IS 'Éléments du portfolio des talents (images et vidéos de travaux réalisés)';
COMMENT ON COLUMN portfolio_items.type IS 'Type de média: image ou video';
