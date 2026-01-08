-- =============================================
-- REPORTS TABLE
-- Description: Table pour gérer les signalements de contenu, utilisateurs, commentaires, etc.
-- =============================================

-- Créer le type enum pour le statut des signalements
CREATE TYPE report_status AS ENUM ('pending', 'approved', 'rejected');

-- Créer le type enum pour le type d'élément signalé
CREATE TYPE reported_item_type AS ENUM ('post', 'video', 'story', 'user', 'comment', 'conversation');

-- Créer la table reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_item_type reported_item_type NOT NULL,
  reported_item_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_item_type_id ON public.reports(reported_item_type, reported_item_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- RLS Policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Les signalements sont lisibles par tous les utilisateurs authentifiés
CREATE POLICY "Reports are viewable by authenticated users"
  ON public.reports FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Les utilisateurs peuvent créer leurs propres signalements
CREATE POLICY "Users can create their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Seuls les admins peuvent modifier les signalements (changer le statut)
CREATE POLICY "Only admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Seuls les admins peuvent supprimer les signalements
CREATE POLICY "Only admins can delete reports"
  ON public.reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE public.reports IS 'Table pour gérer les signalements de contenu, utilisateurs, commentaires, etc.';
COMMENT ON COLUMN public.reports.reporter_id IS 'ID de l''utilisateur qui a fait le signalement';
COMMENT ON COLUMN public.reports.reported_item_type IS 'Type d''élément signalé (post, video, story, user, comment, conversation)';
COMMENT ON COLUMN public.reports.reported_item_id IS 'ID de l''élément signalé';
COMMENT ON COLUMN public.reports.reason IS 'Raison du signalement';
COMMENT ON COLUMN public.reports.description IS 'Description détaillée du signalement';
COMMENT ON COLUMN public.reports.status IS 'Statut du signalement: pending (en attente), approved (approuvé), rejected (rejeté)';

