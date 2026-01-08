-- =============================================
-- SCRIPT DE TEST - Automatisation des Badges
-- Description: Script pour tester le système d'attribution automatique
-- =============================================

-- 1. Vérifier que les fonctions existent
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

-- 2. Vérifier que le trigger existe
SELECT 
  trigger_name as "Trigger",
  event_manipulation as "Événement",
  event_object_table as "Table"
FROM information_schema.triggers 
WHERE trigger_name = 'check_badges_after_rating_update';

-- 3. Vérifier les badges automatiques
SELECT 
  name as "Badge",
  is_automatic as "Automatique",
  criteria as "Critères"
FROM public.badges
WHERE is_automatic = TRUE
ORDER BY name;

-- 4. Voir un exemple de talent avec ses badges
SELECT 
  u.id,
  u.first_name || ' ' || u.last_name as "Talent",
  u.rating as "Note",
  u.review_count as "Avis",
  u.completed_projects as "Projets",
  array_agg(b.name) FILTER (WHERE b.name IS NOT NULL) as "Badges"
FROM public.users u
LEFT JOIN public.user_badges ub ON u.id = ub.user_id
LEFT JOIN public.badges b ON ub.badge_id = b.id
WHERE u.user_type = 'talent'
  AND u.rating > 0
GROUP BY u.id, u.first_name, u.last_name, u.rating, u.review_count, u.completed_projects
ORDER BY u.rating DESC
LIMIT 5;

-- 5. Tester l'attribution pour un talent spécifique (remplacer 'USER_ID' par un vrai ID)
-- SELECT public.assign_badges_to_user('USER_ID_HERE');

-- 6. Compter les badges automatiques attribués
SELECT 
  b.name as "Badge",
  COUNT(ub.id) as "Nombre d'attributions",
  b.is_automatic as "Automatique"
FROM public.badges b
LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
WHERE b.is_automatic = TRUE
GROUP BY b.id, b.name, b.is_automatic
ORDER BY COUNT(ub.id) DESC;

