-- Créer la table badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Nom de l'icône (ex: "CheckCircle", "Crown", etc.)
  color TEXT NOT NULL, -- Code couleur hex (ex: "#10b981")
  criteria TEXT NOT NULL, -- Critères d'attribution
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table user_badges pour lier les badges aux utilisateurs
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  awarded_by UUID REFERENCES public.users(id), -- Admin qui a attribué le badge (optionnel)
  UNIQUE(user_id, badge_id) -- Un utilisateur ne peut avoir qu'un seul exemplaire de chaque badge
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- RLS Policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Les badges sont lisibles par tous
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

-- Seuls les admins peuvent créer/modifier/supprimer des badges
CREATE POLICY "Only admins can manage badges"
  ON public.badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Les user_badges sont lisibles par tous
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

-- Seuls les admins peuvent attribuer/retirer des badges
CREATE POLICY "Only admins can manage user badges"
  ON public.user_badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Insérer les badges par défaut
INSERT INTO public.badges (name, description, icon, color, criteria) VALUES
  ('Talent Vérifié', 'Identité vérifiée par l''équipe Kily', 'CheckCircle', '#10b981', 'Vérification manuelle admin'),
  ('Top Talent', 'Dans le top 10% des talents les mieux notés', 'Crown', '#f59e0b', 'Note moyenne ≥ 4.8/5'),
  ('Expert', 'Expertise reconnue dans son domaine', 'Award', '#8b5cf6', '50+ projets complétés'),
  ('Professionnel', 'Service professionnel et fiable', 'Shield', '#06b6d4', 'Note moyenne ≥ 4.5/5 + 20+ avis'),
  ('Rising Star', 'Nouveau talent prometteur', 'Zap', '#ec4899', 'Inscrit < 3 mois + note ≥ 4.5'),
  ('Talent de l''Année', 'Meilleur talent de l''année', 'Star', '#fbbf24', 'Attribution manuelle')
ON CONFLICT DO NOTHING;


