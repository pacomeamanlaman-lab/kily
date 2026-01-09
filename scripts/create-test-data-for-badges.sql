-- =============================================
-- CRÉER DES DONNÉES DE TEST POUR LES BADGES
-- Description: Crée des données de test pour tester l'attribution automatique des badges
-- =============================================

-- ⚠️ ATTENTION : Ce script modifie les données des talents existants
-- Il est destiné uniquement aux tests, pas à la production

-- 1. Voir les talents existants
SELECT 
  id,
  first_name || ' ' || last_name as name,
  rating,
  review_count,
  completed_projects
FROM public.users
WHERE user_type = 'talent'
ORDER BY created_at
LIMIT 13;

-- 2. Créer des données de test variées pour tester différents badges
-- Talent 1: Top Talent (rating 4.9, 35 avis, 60 projets)
-- Talent 2: Expert (rating 4.6, 15 avis, 55 projets)
-- Talent 3: Professionnel (rating 4.7, 25 avis, 30 projets)
-- Talent 4: Rising Star (inscrit récemment, rating 4.6, 12 avis)
-- Talent 5: Excellence (rating 4.95, 60 avis, 40 projets)
-- Talent 6: Fiable (rating 4.5, 10 avis, 25 projets)
-- Talent 7: Communication Parfaite (rating 4.85, 22 avis, 15 projets)
-- Talent 8: Talent Confirmé (100 projets, rating 4.4)
-- Talent 9: Membre Actif (25 projets, rating 4.3)
-- Talent 10: Spécialiste (35 projets, rating 4.6)
-- Talent 11: Talent Multidisciplinaire (55 projets, rating 4.5)
-- Talent 12: Aucun badge (rating 3.5, 5 avis, 10 projets)
-- Talent 13: Aucun badge (rating 4.2, 8 avis, 5 projets)

DO $$
DECLARE
  v_talents UUID[];
  v_talent_id UUID;
  v_index INTEGER := 0;
BEGIN
  -- Récupérer les IDs des talents
  SELECT array_agg(id ORDER BY created_at) INTO v_talents
  FROM public.users
  WHERE user_type = 'talent'
  LIMIT 13;

  -- Talent 1: Top Talent
  IF array_length(v_talents, 1) >= 1 THEN
    UPDATE public.users
    SET rating = 4.9, review_count = 35, completed_projects = 60
    WHERE id = v_talents[1];
    RAISE NOTICE 'Talent 1 mis à jour: Top Talent (4.9/5, 35 avis, 60 projets)';
  END IF;

  -- Talent 2: Expert
  IF array_length(v_talents, 1) >= 2 THEN
    UPDATE public.users
    SET rating = 4.6, review_count = 15, completed_projects = 55
    WHERE id = v_talents[2];
    RAISE NOTICE 'Talent 2 mis à jour: Expert (4.6/5, 15 avis, 55 projets)';
  END IF;

  -- Talent 3: Professionnel
  IF array_length(v_talents, 1) >= 3 THEN
    UPDATE public.users
    SET rating = 4.7, review_count = 25, completed_projects = 30
    WHERE id = v_talents[3];
    RAISE NOTICE 'Talent 3 mis à jour: Professionnel (4.7/5, 25 avis, 30 projets)';
  END IF;

  -- Talent 4: Rising Star (inscrit il y a 2 mois)
  IF array_length(v_talents, 1) >= 4 THEN
    UPDATE public.users
    SET rating = 4.6, review_count = 12, completed_projects = 8, created_at = NOW() - INTERVAL '2 months'
    WHERE id = v_talents[4];
    RAISE NOTICE 'Talent 4 mis à jour: Rising Star (4.6/5, 12 avis, inscrit il y a 2 mois)';
  END IF;

  -- Talent 5: Excellence
  IF array_length(v_talents, 1) >= 5 THEN
    UPDATE public.users
    SET rating = 4.95, review_count = 60, completed_projects = 40
    WHERE id = v_talents[5];
    RAISE NOTICE 'Talent 5 mis à jour: Excellence (4.95/5, 60 avis, 40 projets)';
  END IF;

  -- Talent 6: Fiable
  IF array_length(v_talents, 1) >= 6 THEN
    UPDATE public.users
    SET rating = 4.5, review_count = 10, completed_projects = 25
    WHERE id = v_talents[6];
    RAISE NOTICE 'Talent 6 mis à jour: Fiable (4.5/5, 10 avis, 25 projets)';
  END IF;

  -- Talent 7: Communication Parfaite
  IF array_length(v_talents, 1) >= 7 THEN
    UPDATE public.users
    SET rating = 4.85, review_count = 22, completed_projects = 15
    WHERE id = v_talents[7];
    RAISE NOTICE 'Talent 7 mis à jour: Communication Parfaite (4.85/5, 22 avis, 15 projets)';
  END IF;

  -- Talent 8: Talent Confirmé (100 projets)
  IF array_length(v_talents, 1) >= 8 THEN
    UPDATE public.users
    SET rating = 4.4, review_count = 20, completed_projects = 100
    WHERE id = v_talents[8];
    RAISE NOTICE 'Talent 8 mis à jour: Talent Confirmé (4.4/5, 20 avis, 100 projets)';
  END IF;

  -- Talent 9: Membre Actif
  IF array_length(v_talents, 1) >= 9 THEN
    UPDATE public.users
    SET rating = 4.3, review_count = 5, completed_projects = 25
    WHERE id = v_talents[9];
    RAISE NOTICE 'Talent 9 mis à jour: Membre Actif (4.3/5, 5 avis, 25 projets)';
  END IF;

  -- Talent 10: Spécialiste
  IF array_length(v_talents, 1) >= 10 THEN
    UPDATE public.users
    SET rating = 4.6, review_count = 8, completed_projects = 35
    WHERE id = v_talents[10];
    RAISE NOTICE 'Talent 10 mis à jour: Spécialiste (4.6/5, 8 avis, 35 projets)';
  END IF;

  -- Talent 11: Talent Multidisciplinaire
  IF array_length(v_talents, 1) >= 11 THEN
    UPDATE public.users
    SET rating = 4.5, review_count = 12, completed_projects = 55
    WHERE id = v_talents[11];
    RAISE NOTICE 'Talent 11 mis à jour: Talent Multidisciplinaire (4.5/5, 12 avis, 55 projets)';
  END IF;

  -- Talent 12: Aucun badge (critères non remplis)
  IF array_length(v_talents, 1) >= 12 THEN
    UPDATE public.users
    SET rating = 3.5, review_count = 5, completed_projects = 10
    WHERE id = v_talents[12];
    RAISE NOTICE 'Talent 12 mis à jour: Aucun badge (3.5/5, 5 avis, 10 projets)';
  END IF;

  -- Talent 13: Aucun badge (critères non remplis)
  IF array_length(v_talents, 1) >= 13 THEN
    UPDATE public.users
    SET rating = 4.2, review_count = 8, completed_projects = 5
    WHERE id = v_talents[13];
    RAISE NOTICE 'Talent 13 mis à jour: Aucun badge (4.2/5, 8 avis, 5 projets)';
  END IF;

  RAISE NOTICE '✅ Données de test créées avec succès!';
END $$;

-- 3. Vérifier les données créées
SELECT 
  u.first_name || ' ' || u.last_name as talent_name,
  u.rating,
  u.review_count,
  u.completed_projects,
  EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 2592000 as months_old
FROM public.users u
WHERE u.user_type = 'talent'
ORDER BY u.rating DESC NULLS LAST;

-- 4. Maintenant, exécuter l'attribution automatique des badges
SELECT public.check_all_talents_badges();

-- 5. Vérifier les badges attribués
SELECT 
  u.first_name || ' ' || u.last_name as talent_name,
  u.rating,
  u.review_count,
  u.completed_projects,
  array_agg(b.name ORDER BY b.name) as badges_attribues
FROM public.users u
LEFT JOIN public.user_badges ub ON u.id = ub.user_id
LEFT JOIN public.badges b ON ub.badge_id = b.id AND b.is_automatic = TRUE
WHERE u.user_type = 'talent'
GROUP BY u.id, u.first_name, u.last_name, u.rating, u.review_count, u.completed_projects
ORDER BY array_length(array_agg(b.name), 1) DESC NULLS LAST, u.rating DESC;

-- 6. Compter les badges attribués par badge
SELECT 
  b.name as badge_name,
  COUNT(ub.id) as total_attributions
FROM public.badges b
LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
WHERE b.is_automatic = TRUE
GROUP BY b.id, b.name
ORDER BY total_attributions DESC, b.name;


