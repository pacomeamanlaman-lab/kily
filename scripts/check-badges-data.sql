-- Script pour vérifier les données dans les tables badges

-- 1. Vérifier les badges
SELECT 
  id, 
  name, 
  description,
  created_at
FROM public.badges
ORDER BY created_at;

-- 2. Vérifier les user_badges (attributions)
SELECT 
  ub.id,
  ub.user_id,
  ub.badge_id,
  b.name as badge_name,
  u.email as user_email,
  ub.awarded_at
FROM public.user_badges ub
LEFT JOIN public.badges b ON ub.badge_id = b.id
LEFT JOIN public.users u ON ub.user_id = u.id
ORDER BY ub.awarded_at DESC
LIMIT 50;

-- 3. Compter les attributions par badge
SELECT 
  b.name,
  b.id,
  COUNT(ub.id) as attribution_count
FROM public.badges b
LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
GROUP BY b.id, b.name
ORDER BY attribution_count DESC;

-- 4. Vérifier le nombre total d'utilisateurs
SELECT COUNT(*) as total_users FROM public.users;

-- 5. Vérifier le nombre total d'attributions
SELECT COUNT(*) as total_attributions FROM public.user_badges;


