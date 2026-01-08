-- Script pour nettoyer les données de test dans user_badges
-- ⚠️ ATTENTION : Ce script supprime TOUTES les attributions de badges
-- Utilisez-le seulement si vous voulez réinitialiser les badges

-- 1. Voir combien d'attributions existent
SELECT COUNT(*) as total_attributions FROM public.user_badges;

-- 2. Voir les attributions par badge
SELECT 
  b.name,
  COUNT(ub.id) as count
FROM public.badges b
LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
GROUP BY b.id, b.name
ORDER BY count DESC;

-- 3. Supprimer TOUTES les attributions (décommentez si vous voulez nettoyer)
-- DELETE FROM public.user_badges;

-- 4. Vérifier après nettoyage
-- SELECT COUNT(*) as remaining_attributions FROM public.user_badges;

