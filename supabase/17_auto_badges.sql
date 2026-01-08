-- =============================================
-- AUTOMATISATION DE L'ATTRIBUTION DES BADGES
-- Description: Système automatique d'attribution des badges selon les critères
-- =============================================

-- Étape 1: Ajouter une colonne pour distinguer les badges automatiques des manuels
ALTER TABLE public.badges 
ADD COLUMN IF NOT EXISTS is_automatic BOOLEAN DEFAULT FALSE;

-- Étape 2: Marquer les badges automatiques (basé sur leur nom)
UPDATE public.badges 
SET is_automatic = TRUE 
WHERE name IN (
  'Top Talent',
  'Expert',
  'Professionnel',
  'Rising Star',
  'Excellence',
  'Fiable',
  'Communication Parfaite',
  'Talent Confirmé',
  'Membre Actif',
  'Spécialiste',
  'Talent Multidisciplinaire'
);

-- Étape 3: Fonction pour vérifier et attribuer automatiquement les badges à un utilisateur
CREATE OR REPLACE FUNCTION public.check_and_assign_badges(p_user_id UUID)
RETURNS TABLE(badge_id UUID, badge_name TEXT, action TEXT) AS $$
DECLARE
  v_user RECORD;
  v_badge RECORD;
  v_has_badge BOOLEAN;
  v_months_since_creation INTEGER;
  v_should_have_badge BOOLEAN;
BEGIN
  -- Récupérer les données de l'utilisateur
  SELECT 
    id,
    rating,
    review_count,
    completed_projects,
    created_at,
    user_type
  INTO v_user
  FROM public.users
  WHERE id = p_user_id;

  -- Si l'utilisateur n'existe pas ou n'est pas un talent, retourner
  IF v_user IS NULL OR v_user.user_type != 'talent' THEN
    RETURN;
  END IF;

  -- Calculer le nombre de mois depuis la création
  v_months_since_creation := EXTRACT(EPOCH FROM (NOW() - v_user.created_at)) / 2592000;

  -- Parcourir tous les badges automatiques
  FOR v_badge IN 
    SELECT id, name, criteria, is_automatic
    FROM public.badges
    WHERE is_automatic = TRUE
  LOOP
    -- Vérifier si l'utilisateur a déjà ce badge
    SELECT EXISTS(
      SELECT 1 FROM public.user_badges ub
      WHERE ub.user_id = p_user_id AND ub.badge_id = v_badge.id
    ) INTO v_has_badge;

    -- Déterminer si l'utilisateur devrait avoir ce badge selon les critères
    v_should_have_badge := FALSE;

    -- Top Talent: rating >= 4.8 AND review_count >= 30
    IF v_badge.name = 'Top Talent' THEN
      v_should_have_badge := (v_user.rating >= 4.8 AND v_user.review_count >= 30);
    
    -- Expert: completed_projects >= 50 AND rating >= 4.5
    ELSIF v_badge.name = 'Expert' THEN
      v_should_have_badge := (v_user.completed_projects >= 50 AND v_user.rating >= 4.5);
    
    -- Professionnel: rating >= 4.5 AND review_count >= 20
    ELSIF v_badge.name = 'Professionnel' THEN
      v_should_have_badge := (v_user.rating >= 4.5 AND v_user.review_count >= 20);
    
    -- Rising Star: inscrit < 3 mois AND rating >= 4.5 AND review_count >= 10
    ELSIF v_badge.name = 'Rising Star' THEN
      v_should_have_badge := (v_months_since_creation < 3 AND v_user.rating >= 4.5 AND v_user.review_count >= 10);
    
    -- Excellence: rating >= 4.9 AND review_count >= 50
    ELSIF v_badge.name = 'Excellence' THEN
      v_should_have_badge := (v_user.rating >= 4.9 AND v_user.review_count >= 50);
    
    -- Fiable: 95%+ projets livrés à temps (pour l'instant, on utilise completed_projects >= 20 comme proxy)
    ELSIF v_badge.name = 'Fiable' THEN
      v_should_have_badge := (v_user.completed_projects >= 20 AND v_user.rating >= 4.5);
    
    -- Communication Parfaite: rating >= 4.8 AND review_count >= 20 (proxy, car pas de note communication séparée)
    ELSIF v_badge.name = 'Communication Parfaite' THEN
      v_should_have_badge := (v_user.rating >= 4.8 AND v_user.review_count >= 20);
    
    -- Talent Confirmé: 100+ projets OU 50+ avis
    ELSIF v_badge.name = 'Talent Confirmé' THEN
      v_should_have_badge := (v_user.completed_projects >= 100 OR v_user.review_count >= 50);
    
    -- Membre Actif: 20+ projets dans les 6 derniers mois (pour l'instant, on utilise completed_projects >= 20)
    ELSIF v_badge.name = 'Membre Actif' THEN
      v_should_have_badge := (v_user.completed_projects >= 20);
    
    -- Spécialiste: 80%+ projets dans une catégorie (nécessiterait une table de projets, pour l'instant on utilise completed_projects >= 30)
    ELSIF v_badge.name = 'Spécialiste' THEN
      v_should_have_badge := (v_user.completed_projects >= 30 AND v_user.rating >= 4.5);
    
    -- Talent Multidisciplinaire: projets dans 5+ catégories (nécessiterait une table de projets, pour l'instant on utilise completed_projects >= 50)
    ELSIF v_badge.name = 'Talent Multidisciplinaire' THEN
      v_should_have_badge := (v_user.completed_projects >= 50);
    END IF;

    -- Attribuer ou retirer le badge selon le cas
    IF v_should_have_badge AND NOT v_has_badge THEN
      -- Attribuer le badge
      INSERT INTO public.user_badges (user_id, badge_id, awarded_at)
      VALUES (p_user_id, v_badge.id, NOW())
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
      RETURN QUERY SELECT v_badge.id, v_badge.name, 'attributed'::TEXT;
    
    ELSIF NOT v_should_have_badge AND v_has_badge THEN
      -- Retirer le badge (si les critères ne sont plus remplis)
      DELETE FROM public.user_badges ub
      WHERE ub.user_id = p_user_id AND ub.badge_id = v_badge.id;
      
      RETURN QUERY SELECT v_badge.id, v_badge.name, 'removed'::TEXT;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Étape 4: Fonction pour vérifier tous les talents (pour exécution manuelle ou cron)
CREATE OR REPLACE FUNCTION public.check_all_talents_badges()
RETURNS TABLE(user_id UUID, badges_updated INTEGER) AS $$
DECLARE
  v_talent RECORD;
  v_updated_count INTEGER;
BEGIN
  -- Parcourir tous les talents
  FOR v_talent IN 
    SELECT id FROM public.users WHERE user_type = 'talent'
  LOOP
    -- Vérifier et attribuer les badges pour ce talent
    PERFORM public.check_and_assign_badges(v_talent.id);
    
    -- Compter les badges attribués/modifiés (simplifié)
    SELECT COUNT(*) INTO v_updated_count
    FROM public.user_badges
    WHERE user_id = v_talent.id;
    
    RETURN QUERY SELECT v_talent.id, v_updated_count;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Étape 5: Trigger pour vérifier automatiquement les badges après mise à jour de rating/review_count
CREATE OR REPLACE FUNCTION public.trigger_check_badges_after_rating_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier et attribuer les badges automatiquement
  PERFORM public.check_and_assign_badges(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS check_badges_after_rating_update ON public.users;
CREATE TRIGGER check_badges_after_rating_update
  AFTER UPDATE OF rating, review_count, completed_projects ON public.users
  FOR EACH ROW
  WHEN (NEW.user_type = 'talent')
  EXECUTE FUNCTION public.trigger_check_badges_after_rating_update();

-- Étape 6: Fonction RPC pour exécution manuelle depuis le frontend/backend
CREATE OR REPLACE FUNCTION public.assign_badges_to_user(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result RECORD;
  v_results JSON[] := '{}';
BEGIN
  -- Vérifier et attribuer les badges
  FOR v_result IN 
    SELECT * FROM public.check_and_assign_badges(p_user_id)
  LOOP
    v_results := array_append(v_results, json_build_object(
      'badge_id', v_result.badge_id,
      'badge_name', v_result.badge_name,
      'action', v_result.action
    ));
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'badges_updated', array_length(v_results, 1),
    'details', v_results
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Étape 7: Mettre à jour les RLS policies pour permettre l'attribution automatique
-- Les fonctions SECURITY DEFINER contournent RLS, mais on doit s'assurer que les policies permettent l'insertion
-- La policy existante devrait déjà fonctionner, mais on la vérifie

-- Étape 8: Commentaires pour documentation
COMMENT ON FUNCTION public.check_and_assign_badges IS 'Vérifie les critères et attribue/retire automatiquement les badges à un utilisateur';
COMMENT ON FUNCTION public.check_all_talents_badges IS 'Vérifie et attribue les badges pour tous les talents (pour exécution manuelle ou cron)';
COMMENT ON FUNCTION public.assign_badges_to_user IS 'Fonction RPC pour attribuer les badges à un utilisateur depuis le frontend/backend';
COMMENT ON COLUMN public.badges.is_automatic IS 'Indique si le badge est attribué automatiquement (TRUE) ou manuellement (FALSE)';

-- Étape 9: Initialiser les badges pour tous les talents existants (optionnel)
-- Décommenter la ligne suivante pour exécuter immédiatement après la création des fonctions
-- SELECT public.check_all_talents_badges();

