-- =============================================
-- CORRECTION DE L'ERREUR SQL - Fonction check_all_talents_badges
-- Description: Corrige l'ambiguïté de user_id dans la fonction
-- =============================================

-- Recréer la fonction avec les corrections
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
    FROM public.user_badges ub
    WHERE ub.user_id = v_talent.id;
    
    RETURN QUERY SELECT v_talent.id, v_updated_count;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

