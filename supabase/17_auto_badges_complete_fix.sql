-- =============================================
-- CORRECTION COMPLÈTE - Automatisation des Badges
-- Description: Corrige toutes les erreurs d'ambiguïté dans les fonctions
-- =============================================

-- 1. Corriger la fonction check_and_assign_badges
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
    -- Vérifier si l'utilisateur a déjà ce badge (avec alias de table pour éviter l'ambiguïté)
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

-- 2. Corriger la fonction check_all_talents_badges
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
    
    -- Compter les badges attribués/modifiés (avec alias de table pour éviter l'ambiguïté)
    SELECT COUNT(*) INTO v_updated_count
    FROM public.user_badges ub
    WHERE ub.user_id = v_talent.id;
    
    RETURN QUERY SELECT v_talent.id, v_updated_count;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Vérifier que les fonctions sont bien créées
SELECT 
  routine_name as "Fonction",
  routine_type as "Type"
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'check_and_assign_badges',
  'check_all_talents_badges',
  'assign_badges_to_user'
)
ORDER BY routine_name;

