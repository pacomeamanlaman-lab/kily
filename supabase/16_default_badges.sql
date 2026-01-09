-- =============================================
-- BADGES PRÉDÉFINIS
-- Description: Script pour insérer des badges par défaut dans la table badges
-- =============================================

-- Vérifier que la table badges existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'badges') THEN
    RAISE EXCEPTION 'La table badges n''existe pas. Veuillez d''abord exécuter le script 14_badges_tables.sql';
  END IF;
END $$;

-- Insérer les badges prédéfinis
-- ON CONFLICT permet d'exécuter le script plusieurs fois sans erreur
INSERT INTO public.badges (name, description, icon, color, criteria) VALUES
  -- Badges de vérification et statut
  (
    'Talent Vérifié',
    'Identité et compétences vérifiées par l''équipe Kily',
    'CheckCircle',
    '#10b981',
    'Vérification manuelle par un administrateur'
  ),
  (
    'Compte Premium',
    'Talent avec compte premium actif',
    'Crown',
    '#f59e0b',
    'Abonnement premium actif'
  ),

  -- Badges de performance
  (
    'Top Talent',
    'Dans le top 10% des talents les mieux notés de la plateforme',
    'Crown',
    '#fbbf24',
    'Note moyenne ≥ 4.8/5 avec minimum 30 avis'
  ),
  (
    'Expert',
    'Expertise reconnue et expérience avérée dans son domaine',
    'Award',
    '#8b5cf6',
    '50+ projets complétés avec note moyenne ≥ 4.5/5'
  ),
  (
    'Professionnel',
    'Service professionnel, fiable et de qualité',
    'Shield',
    '#06b6d4',
    'Note moyenne ≥ 4.5/5 avec minimum 20 avis'
  ),
  (
    'Talent de l''Année',
    'Meilleur talent de l''année sélectionné par l''équipe',
    'Star',
    '#fbbf24',
    'Attribution manuelle par l''équipe Kily'
  ),

  -- Badges de progression
  (
    'Rising Star',
    'Nouveau talent prometteur avec un excellent départ',
    'Zap',
    '#ec4899',
    'Inscrit < 3 mois + note moyenne ≥ 4.5/5 + 10+ avis'
  ),
  (
    'Talent Confirmé',
    'Talent expérimenté avec une solide réputation',
    'Award',
    '#3b82f6',
    '100+ projets complétés ou 50+ avis positifs'
  ),
  (
    'Membre Actif',
    'Talent très actif sur la plateforme',
    'Zap',
    '#10b981',
    '20+ projets complétés dans les 6 derniers mois'
  ),

  -- Badges spécialisés
  (
    'Spécialiste',
    'Spécialiste reconnu dans une catégorie spécifique',
    'Award',
    '#8b5cf6',
    '80%+ des projets dans une même catégorie avec note ≥ 4.5'
  ),
  (
    'Talent Multidisciplinaire',
    'Talent compétent dans plusieurs domaines',
    'Star',
    '#06b6d4',
    'Projets réussis dans 5+ catégories différentes'
  ),

  -- Badges de qualité
  (
    'Excellence',
    'Talent reconnu pour son excellence constante',
    'Star',
    '#f59e0b',
    'Note moyenne ≥ 4.9/5 avec minimum 50 avis'
  ),
  (
    'Fiable',
    'Talent fiable et ponctuel',
    'Shield',
    '#10b981',
    '95%+ de projets livrés à temps'
  ),
  (
    'Communication Parfaite',
    'Excellente communication avec les clients',
    'CheckCircle',
    '#3b82f6',
    'Note communication ≥ 4.8/5 sur 20+ projets'
  )
ON CONFLICT DO NOTHING;

-- Afficher un message de confirmation
DO $$
DECLARE
  badge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO badge_count FROM public.badges;
  RAISE NOTICE '✅ % badges prédéfinis insérés avec succès!', badge_count;
END $$;

-- Vérifier les badges créés
SELECT 
  name as "Nom du Badge",
  description as "Description",
  icon as "Icône",
  color as "Couleur",
  criteria as "Critères"
FROM public.badges
ORDER BY name;


