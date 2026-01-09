-- =============================================
-- VÉRIFIER LE NOM DE LA CONTRAINTE UNIQUE
-- Description: Trouve le nom exact de la contrainte unique sur user_badges
-- =============================================

-- Vérifier le nom de la contrainte unique
SELECT 
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'user_badges'
  AND constraint_type = 'UNIQUE';


