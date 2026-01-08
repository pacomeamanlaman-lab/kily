# Fix : Problème d'inscription - Conflit avec le trigger OAuth

## 🐛 Problème identifié

Lors de l'inscription d'un nouvel utilisateur, une erreur se produisait car :

1. **Le trigger `on_auth_user_created`** (défini dans `supabase/12_oauth_user_trigger.sql`) crée automatiquement un profil utilisateur dans `public.users` dès qu'un utilisateur est créé dans `auth.users`.

2. **Le flux d'inscription** :
   - `signUp()` crée l'utilisateur dans `auth.users`
   - Le trigger se déclenche automatiquement → Crée l'utilisateur dans `public.users` avec des valeurs par défaut (first_name, last_name vides, etc.)
   - Le code essayait ensuite d'**insérer** dans `public.users` → **ERREUR 409 Conflict** car l'utilisateur existe déjà !

## ✅ Solution

Au lieu d'essayer d'insérer un nouvel utilisateur, il faut **mettre à jour** le profil créé par le trigger :

### Avant (❌ Ne fonctionnait pas)
```typescript
// 2. Créer le profil utilisateur dans la table users
const { data: user, error: userError } = await supabase
  .from('users')
  .insert({
    id: authData.user.id,
    email: userData.email,
    first_name: userData.first_name,
    // ... autres champs
  })
  .select()
  .single();
```

### Après (✅ Fonctionne)
```typescript
// 2. Mettre à jour le profil utilisateur dans la table users
// (Le trigger on_auth_user_created a déjà créé le profil de base)
const { data: user, error: userError } = await supabase
  .from('users')
  .update({
    email: cleanEmail,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone,
    country: userData.country,
    city: userData.city,
    commune: userData.commune,
    bio: userData.bio,
    user_type: userData.user_type,
    // ... autres champs
    has_completed_onboarding: false,
  })
  .eq('id', authData.user.id)
  .select()
  .single();
```

## 🔍 Améliorations supplémentaires

1. **Vérification de l'existence** : Vérifier si l'utilisateur existe déjà dans `public.users` avant de créer dans `auth.users`
2. **Nettoyage de l'email** : Utiliser `trim()` et `toLowerCase()` pour nettoyer l'email
3. **Gestion des erreurs** : Meilleure gestion des cas où l'utilisateur existe déjà dans `auth.users` mais pas dans `public.users`

## 📝 Fichiers modifiés

- `src/lib/supabase/users.service.ts` : Changement de `insert` vers `update` dans la fonction `createUser`

## 🎯 Résultat

L'inscription fonctionne maintenant correctement :
- Le trigger crée le profil de base
- Le code met à jour le profil avec les vraies données de l'utilisateur
- Plus de conflit 409 !

