-- =============================================
-- DIAGNOSTIC - Pourquoi aucun badge n'est attribué ?
-- Description: Vérifie les stats des talents pour comprendre pourquoi aucun badge n'est attribué
-- =============================================

-- 1. Voir les stats de tous les talents
SELECT 
  u.id,
  u.first_name || ' ' || u.last_name as talent_name,
  u.rating,
  u.review_count,
  u.completed_projects,
  u.created_at,
  EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 2592000 as months_since_creation,
  u.user_type,
  COUNT(ub.id) as badges_count
FROM public.users u
LEFT JOIN public.user_badges ub ON u.id = ub.user_id
WHERE u.user_type = 'talent'
GROUP BY u.id, u.first_name, u.last_name, u.rating, u.review_count, u.completed_projects, u.created_at, u.user_type
ORDER BY u.rating DESC NULLS LAST;

-- 2. Vérifier quels talents remplissent quels critères
SELECT 
  u.first_name || ' ' || u.last_name as talent_name,
  u.rating,
  u.review_count,
  u.completed_projects,
  EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 2592000 as months_old,
  -- Critères pour chaque badge
  CASE WHEN u.rating >= 4.8 AND u.review_count >= 30 THEN '✅' ELSE '❌' END as "Top Talent",
  CASE WHEN u.completed_projects >= 50 AND u.rating >= 4.5 THEN '✅' ELSE '❌' END as "Expert",
  CASE WHEN u.rating >= 4.5 AND u.review_count >= 20 THEN '✅' ELSE '❌' END as "Professionnel",
  CASE WHEN EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 2592000 < 3 AND u.rating >= 4.5 AND u.review_count >= 10 THEN '✅' ELSE '❌' END as "Rising Star",
  CASE WHEN u.rating >= 4.9 AND u.review_count >= 50 THEN '✅' ELSE '❌' END as "Excellence",
  CASE WHEN u.completed_projects >= 20 AND u.rating >= 4.5 THEN '✅' ELSE '❌' END as "Fiable",
  CASE WHEN u.rating >= 4.8 AND u.review_count >= 20 THEN '✅' ELSE '❌' END as "Communication Parfaite",
  CASE WHEN u.completed_projects >= 100 OR u.review_count >= 50 THEN '✅' ELSE '❌' END as "Talent Confirmé",
  CASE WHEN u.completed_projects >= 20 THEN '✅' ELSE '❌' END as "Membre Actif",
  CASE WHEN u.completed_projects >= 30 AND u.rating >= 4.5 THEN '✅' ELSE '❌' END as "Spécialiste",
  CASE WHEN u.completed_projects >= 50 THEN '✅' ELSE '❌' END as "Talent Multidisciplinaire"
FROM public.users u
WHERE u.user_type = 'talent'
ORDER BY u.rating DESC NULLS LAST;

-- 3. Tester manuellement l'attribution pour un talent spécifique
-- Remplace 'USER_ID_HERE' par un ID réel de la liste ci-dessus
-- SELECT public.assign_badges_to_user('USER_ID_HERE');

-- 4. Vérifier les badges automatiques disponibles
SELECT 
  name,
  is_automatic,
  criteria
FROM public.badges
WHERE is_automatic = TRUE
ORDER BY name;

-- 5. Compter combien de talents ont des données (rating, reviews, projets)
SELECT 
  COUNT(*) FILTER (WHERE rating > 0) as talents_with_rating,
  COUNT(*) FILTER (WHERE review_count > 0) as talents_with_reviews,
  COUNT(*) FILTER (WHERE completed_projects > 0) as talents_with_projects,
  COUNT(*) as total_talents
FROM public.users
WHERE user_type = 'talent';

