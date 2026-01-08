-- =============================================
-- TRIGGER: handle_new_user (OAuth)
-- Description: Crée automatiquement un profil utilisateur dans la table users
-- quand un nouvel utilisateur s'inscrit via OAuth (Google, Facebook, etc.)
-- =============================================

-- Fonction pour créer automatiquement le profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_first_name TEXT;
  user_last_name TEXT;
  user_avatar TEXT;
  user_email TEXT;
BEGIN
  -- Extraire les données depuis user_metadata (fournies par OAuth)
  -- Google fournit généralement: given_name, family_name, name, picture
  -- On essaie plusieurs variantes pour maximiser les chances de récupérer les données
  
  -- Pour first_name, on essaie dans cet ordre:
  -- 1. given_name (Google standard)
  -- 2. first_name (format alternatif)
  -- 3. name (nom complet, on prend la première partie)
  -- 4. full_name (format alternatif)
  -- 5. email (on prend la partie avant @)
  -- 6. 'Utilisateur' (fallback)
  user_first_name := COALESCE(
    NEW.raw_user_meta_data->>'given_name',
    NEW.raw_user_meta_data->>'first_name',
    CASE 
      WHEN NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
        TRIM(SPLIT_PART(NEW.raw_user_meta_data->>'name', ' ', 1))
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        TRIM(SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1))
      ELSE NULL
    END,
    SPLIT_PART(NEW.email, '@', 1),
    'Utilisateur'
  );
  
  -- Pour last_name, on essaie dans cet ordre:
  -- 1. family_name (Google standard)
  -- 2. last_name (format alternatif)
  -- 3. name (nom complet, on prend la deuxième partie et suivantes)
  -- 4. full_name (format alternatif)
  -- 5. '' (vide si on ne trouve rien)
  user_last_name := COALESCE(
    NEW.raw_user_meta_data->>'family_name',
    NEW.raw_user_meta_data->>'last_name',
    CASE 
      WHEN NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
        TRIM(SUBSTRING(NEW.raw_user_meta_data->>'name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'name') + 1))
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        TRIM(SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1))
      ELSE NULL
    END,
    ''
  );
  
  -- Si last_name est toujours vide après tous les essais, on laisse vide
  -- (mieux que d'utiliser l'email qui n'est pas un nom)
  
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'photo_url',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
  );
  
  user_email := NEW.email;

  -- Vérifier si le profil existe déjà (éviter les doublons)
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Créer le profil utilisateur dans la table users
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      avatar,
      user_type,
      verified,
      has_completed_onboarding,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_email,
      user_first_name,
      user_last_name,
      user_avatar,
      'talent', -- Par défaut, type talent (peut être changé plus tard)
      FALSE, -- Non vérifié par défaut
      FALSE, -- Doit compléter l'onboarding
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après l'insertion d'un nouvel utilisateur dans auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Commentaire pour documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Fonction trigger qui crée automatiquement un profil utilisateur dans la table users quand un nouvel utilisateur s''inscrit via OAuth (Google, Facebook, etc.)';




