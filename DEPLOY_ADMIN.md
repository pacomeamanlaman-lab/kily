# 🚀 Guide de Déploiement du Compte Admin en Production

## ✅ Vérifications Préalables

Avant de déployer le compte admin en production, assurez-vous que :

1. **Le SQL admin a été exécuté** sur votre base de données Supabase de production
   - Fichier : `supabase/11_admin_system.sql`
   - Ce script ajoute la colonne `is_admin` à la table `users` et crée les fonctions nécessaires

2. **Les variables d'environnement sont configurées** dans votre plateforme de déploiement (Vercel, Netlify, etc.)
   - `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` : Clé service (nécessaire pour créer le compte admin)

## 📝 Étapes de Déploiement

### Étape 1 : Exécuter le SQL sur Supabase Production

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de `supabase/11_admin_system.sql`
4. Exécutez le script

### Étape 2 : Créer le Compte Admin

#### Option A : Via le Script (Recommandé)

1. Clonez le repo en local ou accédez au code
2. Configurez les variables d'environnement dans `.env.local` :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
   ```

3. Exécutez le script :
   ```bash
   node scripts/create-admin.js
   ```

4. Le script créera le compte avec :
   - **Email** : `admin@gmail.com`
   - **Mot de passe** : `12345678`
   - **is_admin** : `true`

#### Option B : Via le Dashboard Supabase

1. Créez un utilisateur dans **Authentication > Users**
2. Notez l'ID de l'utilisateur
3. Dans **SQL Editor**, exécutez :
   ```sql
   UPDATE users 
   SET is_admin = TRUE 
   WHERE id = 'l-id-de-l-utilisateur';
   ```

### Étape 3 : Vérifier le Déploiement

1. Déployez votre application (si ce n'est pas déjà fait)
2. Connectez-vous avec le compte admin :
   - Email : `admin@gmail.com`
   - Mot de passe : `12345678`
3. Vous devriez être automatiquement redirigé vers `/admin/dashboard`

## 🔒 Sécurité

⚠️ **IMPORTANT** : Après la première connexion, changez le mot de passe du compte admin !

1. Connectez-vous avec le compte admin
2. Allez dans les paramètres
3. Changez le mot de passe pour un mot de passe fort

## 🐛 Dépannage

### Le compte admin n'est pas redirigé vers le dashboard

1. Vérifiez que `is_admin = TRUE` dans la table `users` :
   ```sql
   SELECT id, email, is_admin FROM users WHERE email = 'admin@gmail.com';
   ```

2. Vérifiez les logs de la console du navigateur pour voir les erreurs

### Erreur "User not found" lors de la création

- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correcte
- Vérifiez que l'utilisateur n'existe pas déjà dans Auth

### Les routes admin ne sont pas protégées

- Vérifiez que `ProtectedAdminRoute` est bien utilisé dans `src/app/admin/dashboard/layout.tsx`
- Vérifiez que la fonction `isAdmin()` dans `admin.service.ts` fonctionne correctement

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
- Les logs Supabase dans le dashboard
- Les logs de votre application (Vercel, Netlify, etc.)
- La console du navigateur pour les erreurs JavaScript





