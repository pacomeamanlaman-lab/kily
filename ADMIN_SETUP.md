# Guide de Configuration Admin - Kily

## 🎯 Vue d'ensemble

Le système d'administration de Kily permet de gérer la plateforme avec des droits d'accès spéciaux. Ce guide explique comment configurer et utiliser le système admin.

## 📋 Prérequis

1. Avoir exécuté tous les scripts SQL Supabase (voir `supabase/README.md`)
2. Avoir un compte utilisateur créé dans Supabase Auth
3. Avoir accès au SQL Editor de Supabase

## 🚀 Configuration Initiale

### Étape 1 : Exécuter le script SQL Admin

Exécute le script `supabase/11_admin_system.sql` dans le SQL Editor de Supabase. Ce script :
- Ajoute la colonne `is_admin` à la table `users`
- Crée les fonctions `promote_to_admin()` et `demote_from_admin()`
- Configure les politiques RLS pour les admins

### Étape 2 : Créer le premier administrateur

Un compte admin par défaut a été créé automatiquement avec les identifiants suivants :
- **Email** : `admin@gmail.com`
- **Mot de passe** : `12345678`

⚠️ **IMPORTANT** : Change le mot de passe après la première connexion !

#### Option A : Utiliser le script automatique (Recommandé)

Un script est disponible pour créer le compte admin :

```bash
node scripts/create-admin.js
```

Ce script :
- Crée l'utilisateur dans Supabase Auth
- Crée le profil dans la table `users` avec `is_admin = true`
- Gère les cas où l'utilisateur existe déjà

#### Option B : Via SQL (Alternative)

Si tu préfères créer manuellement via SQL :

```sql
-- D'abord créer l'utilisateur dans Auth (via l'interface Supabase ou API)
-- Puis mettre à jour la table users
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'admin@gmail.com';
```

#### Option C : Via l'application (nécessite déjà un admin)

Si tu as déjà un admin, tu peux utiliser la fonction `promoteToAdmin()` dans le code :

```typescript
import { promoteToAdmin } from '@/lib/supabase/admin.service';

const result = await promoteToAdmin('email@exemple.com');
if (result.success) {
  console.log('Utilisateur promu en admin');
} else {
  console.error('Erreur:', result.error);
}
```

## 🔐 Protection des Routes Admin

Toutes les routes sous `/admin/dashboard` sont automatiquement protégées par le composant `ProtectedAdminRoute`. Ce composant :

1. Vérifie que l'utilisateur est connecté
2. Vérifie que l'utilisateur est admin (`is_admin = true`)
3. Redirige vers `/login` si non connecté
4. Redirige vers `/feed` si connecté mais pas admin

## 📚 Services Disponibles

### Vérifier si un utilisateur est admin

```typescript
import { isAdmin, isUserAdmin } from '@/lib/supabase/admin.service';

// Vérifier si l'utilisateur actuel est admin
const currentUserIsAdmin = await isAdmin();

// Vérifier si un utilisateur spécifique est admin
const userIsAdmin = await isUserAdmin(userId);
```

### Obtenir tous les admins

```typescript
import { getAllAdmins } from '@/lib/supabase/admin.service';

const admins = await getAllAdmins();
```

### Promouvoir/Dégrader un admin

```typescript
import { promoteToAdmin, demoteFromAdmin } from '@/lib/supabase/admin.service';

// Promouvoir un utilisateur
const result = await promoteToAdmin('email@exemple.com');

// Retirer les droits admin
const result = await demoteFromAdmin('email@exemple.com');
```

### Obtenir les statistiques admin

```typescript
import { getAdminStats } from '@/lib/supabase/admin.service';

const stats = await getAdminStats();
// Retourne: { totalUsers, totalTalents, totalRecruiters, totalNeighbors, totalAdmins, verifiedUsers }
```

## 🛡️ Sécurité

### Row Level Security (RLS)

Les politiques RLS sont configurées pour permettre aux admins de :
- Voir tous les utilisateurs
- Modifier tous les profils
- Supprimer tous les comptes

Les utilisateurs normaux ne peuvent toujours que :
- Voir tous les profils publics
- Modifier leur propre profil
- Supprimer leur propre compte

### Fonctions SQL Sécurisées

Les fonctions `promote_to_admin()` et `demote_from_admin()` sont marquées `SECURITY DEFINER`, ce qui signifie qu'elles s'exécutent avec les privilèges du créateur. Cependant, elles sont protégées par la vérification dans le code TypeScript qui s'assure que seul un admin peut les appeler.

## 📝 Notes Importantes

1. **Premier Admin** : Le premier admin doit être créé manuellement via SQL car il n'y a pas encore d'admin pour valider la promotion.

2. **Sécurité** : Ne partage jamais les identifiants admin. Utilise des mots de passe forts.

3. **Audit** : Considère ajouter une table d'audit pour tracer les actions admin (modifications, suppressions, etc.).

4. **Permissions Granulaires** : Actuellement, tous les admins ont les mêmes droits. Si tu veux des rôles différents (modérateur, super admin, etc.), il faudra étendre le système.

## 🔄 Migration depuis l'ancien système

Si tu migres depuis un système localStorage, assure-toi de :
1. Exécuter le script SQL `11_admin_system.sql`
2. Exécuter le script `scripts/create-admin.js` pour créer le compte admin par défaut
3. Promouvoir manuellement les autres utilisateurs qui étaient admin avant (si nécessaire)
4. Tester l'accès aux routes admin avec `admin@gmail.com` / `12345678`

## ❓ Dépannage

### "Vous devez être administrateur pour effectuer cette action"
- Vérifie que l'utilisateur a bien `is_admin = true` dans la table `users`
- Vérifie que tu es bien connecté avec le bon compte

### Redirection vers /feed au lieu de /admin/dashboard
- L'utilisateur n'est pas admin
- Vérifie `is_admin` dans la base de données

### Erreur lors de l'exécution du script SQL
- Vérifie que tous les scripts précédents ont été exécutés
- Vérifie que la table `users` existe
- Vérifie les permissions dans Supabase

