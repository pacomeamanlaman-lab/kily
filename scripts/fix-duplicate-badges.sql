-- =============================================
-- CORRIGER LES DOUBLONS DE BADGES
-- Description: Identifie et supprime les badges en double
-- =============================================

-- 1. Identifier les badges en double
SELECT 
  name,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at) as badge_ids,
  array_agg(created_at ORDER BY created_at) as created_dates
FROM public.badges
GROUP BY name
HAVING COUNT(*) > 1;

-- 2. Voir les détails des doublons
WITH duplicates AS (
  SELECT 
    name,
    COUNT(*) as count
  FROM public.badges
  GROUP BY name
  HAVING COUNT(*) > 1
)
SELECT 
  b.id,
  b.name,
  b.description,
  b.is_automatic,
  b.created_at,
  COUNT(ub.id) as attributions_count
FROM public.badges b
INNER JOIN duplicates d ON b.name = d.name
LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
GROUP BY b.id, b.name, b.description, b.is_automatic, b.created_at
ORDER BY b.name, b.created_at;

-- 3. Supprimer les doublons (GARDE LE PLUS ANCIEN, TRANSFÈRE LES ATTRIBUTIONS)
-- ⚠️ ATTENTION : Exécutez d'abord les requêtes ci-dessus pour voir les doublons
-- ⚠️ Cette requête supprime les badges en double en gardant le plus ancien

-- Pour chaque groupe de doublons, garder le premier (le plus ancien) et supprimer les autres
-- Mais d'abord, transférer les attributions vers le badge conservé

DO $$
DECLARE
  v_duplicate RECORD;
  v_keep_id UUID;
  v_delete_id UUID;
BEGIN
  -- Parcourir tous les groupes de doublons
  FOR v_duplicate IN 
    SELECT name, array_agg(id ORDER BY created_at) as ids
    FROM public.badges
    GROUP BY name
    HAVING COUNT(*) > 1
  LOOP
    -- Le premier ID (le plus ancien) est celui qu'on garde
    v_keep_id := v_duplicate.ids[1];
    
    -- Parcourir les autres IDs (doublons à supprimer)
    FOR i IN 2..array_length(v_duplicate.ids, 1) LOOP
      v_delete_id := v_duplicate.ids[i];
      
      -- Transférer les attributions vers le badge conservé
      UPDATE public.user_badges
      SET badge_id = v_keep_id
      WHERE badge_id = v_delete_id
      AND NOT EXISTS (
        SELECT 1 FROM public.user_badges
        WHERE user_id = user_badges.user_id
        AND badge_id = v_keep_id
      );
      
      -- Supprimer les attributions en double (si l'utilisateur avait les deux badges)
      DELETE FROM public.user_badges
      WHERE badge_id = v_delete_id;
      
      -- Supprimer le badge en double
      DELETE FROM public.badges
      WHERE id = v_delete_id;
      
      RAISE NOTICE 'Badge "%" supprimé (ID: %), attributions transférées vers ID: %', 
        v_duplicate.name, v_delete_id, v_keep_id;
    END LOOP;
  END LOOP;
END $$;

-- 4. Vérifier qu'il n'y a plus de doublons
SELECT 
  name,
  COUNT(*) as count
FROM public.badges
GROUP BY name
HAVING COUNT(*) > 1;

-- Si cette requête ne retourne rien, tous les doublons ont été supprimés ✅

