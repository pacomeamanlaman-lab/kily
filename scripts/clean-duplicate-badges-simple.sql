-- =============================================
-- NETTOYER LES DOUBLONS DE BADGES (VERSION SIMPLE)
-- Description: Supprime les badges en double en gardant le plus récent
-- =============================================

-- ⚠️ ATTENTION : Ce script supprime les badges en double
-- Il garde le badge le plus récent (celui créé le 2026-01-08 20:29:55)
-- et supprime les anciens (créés le 2026-01-08 20:00:24)

-- 1. Voir les doublons avant suppression
SELECT 
  name,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at DESC) as badge_ids,
  array_agg(created_at ORDER BY created_at DESC) as created_dates
FROM public.badges
GROUP BY name
HAVING COUNT(*) > 1;

-- 2. Supprimer les doublons (garde le plus récent, supprime l'ancien)
-- Pour chaque groupe de doublons, on garde le dernier créé et on supprime les autres

DO $$
DECLARE
  v_duplicate RECORD;
  v_keep_id UUID;
  v_delete_id UUID;
  v_ids UUID[];
BEGIN
  -- Parcourir tous les groupes de doublons
  FOR v_duplicate IN 
    SELECT name, array_agg(id ORDER BY created_at DESC) as ids
    FROM public.badges
    GROUP BY name
    HAVING COUNT(*) > 1
  LOOP
    -- Le premier ID (le plus récent) est celui qu'on garde
    v_keep_id := v_duplicate.ids[1];
    v_ids := v_duplicate.ids;
    
    -- Parcourir les autres IDs (doublons à supprimer)
    FOR i IN 2..array_length(v_ids, 1) LOOP
      v_delete_id := v_ids[i];
      
      -- Transférer les attributions vers le badge conservé (si pas déjà présent)
      UPDATE public.user_badges ub1
      SET badge_id = v_keep_id
      WHERE ub1.badge_id = v_delete_id
      AND NOT EXISTS (
        SELECT 1 FROM public.user_badges ub2
        WHERE ub2.user_id = ub1.user_id
        AND ub2.badge_id = v_keep_id
      );
      
      -- Supprimer les attributions restantes du badge à supprimer
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

-- 3. Vérifier qu'il n'y a plus de doublons
SELECT 
  name,
  COUNT(*) as count
FROM public.badges
GROUP BY name
HAVING COUNT(*) > 1;

-- Si cette requête ne retourne rien, tous les doublons ont été supprimés ✅

-- 4. Vérifier les badges restants
SELECT 
  id,
  name,
  description,
  is_automatic,
  created_at
FROM public.badges
ORDER BY name, created_at;


