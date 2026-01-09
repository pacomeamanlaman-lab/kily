-- =============================================
-- INITIALISER LES BADGES POUR TOUS LES TALENTS
-- Description: Attribue automatiquement les badges aux talents qui remplissent les critères
-- =============================================

-- 1. Vérifier s'il y a des doublons de badges
SELECT 
  name,
  COUNT(*) as count
FROM public.badges
GROUP BY name
HAVING COUNT(*) > 1;

-- 2. Voir les talents existants et leurs stats
SELECT 
  id,
  first_name || ' ' || last_name as talent_name,
  rating,
  review_count,
  completed_projects,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at)) / 2592000 as months_since_creation
FROM public.users
WHERE user_type = 'talent'
ORDER BY rating DESC NULLS LAST
LIMIT 10;

-- 3. Exécuter la fonction pour attribuer les badges à tous les talents
SELECT 
  user_id,
  badges_updated
FROM public.check_all_talents_badges();

-- 4. Vérifier les résultats après attribution
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
  AND ub.id IS NOT NULL
GROUP BY u.id, u.first_name, u.last_name, u.rating, u.review_count, u.completed_projects
ORDER BY array_length(array_agg(b.name), 1) DESC NULLS LAST;

-- 5. Compter les badges attribués par badge
SELECT 
  b.name as badge_name,
  COUNT(ub.id) as total_attributions
FROM public.badges b
LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
WHERE b.is_automatic = TRUE
GROUP BY b.id, b.name
ORDER BY total_attributions DESC, b.name;


