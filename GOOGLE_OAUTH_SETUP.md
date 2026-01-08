# 🔐 Guide d'Activation de l'Authentification Google OAuth

## 📋 Prérequis

- Un compte Google (pour créer le projet OAuth)
- Accès au dashboard Supabase
- Votre application déployée (ou URL locale pour le développement)

## 🚀 Étapes de Configuration

### Étape 1 : Créer un Projet dans Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez le **Project ID** (vous en aurez besoin)

### Étape 2 : Activer l'API Google+ (si nécessaire)

1. Dans Google Cloud Console, allez dans **APIs & Services > Library**
2. Recherchez "Google+ API" ou "Google Identity"
3. Cliquez sur **Enable** si ce n'est pas déjà activé

### Étape 3 : Créer les Credentials OAuth 2.0

1. Allez dans **APIs & Services > Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Si c'est la première fois, configurez l'**OAuth consent screen** :
   - Choisissez **External** (ou Internal si vous avez Google Workspace)
   - Remplissez les informations :
     - **App name** : Kily
     - **User support email** : votre email
     - **Developer contact information** : votre email
   - Cliquez sur **Save and Continue**
   - Ajoutez les **Scopes** (par défaut, email, profile, openid suffisent)
   - Ajoutez des **Test users** si nécessaire (pour le mode test)
   - Cliquez sur **Save and Continue** puis **Back to Dashboard**

4. Créez l'**OAuth Client ID** :
   - **Application type** : Web application
   - **Name** : Kily Web Client
   - **Authorized JavaScript origins** :
     ```
     http://localhost:3000
     https://votre-domaine.vercel.app
     https://votre-domaine.com
     ```
   - **Authorized redirect URIs** :
     ```
     https://votre-projet.supabase.co/auth/v1/callback
     ```
     ⚠️ **IMPORTANT** : Remplacez `votre-projet` par votre vrai projet Supabase
   
5. Cliquez sur **Create**
6. **Copiez le Client ID et le Client Secret** (vous en aurez besoin pour Supabase)

### Étape 4 : Configurer Google dans Supabase

1. Allez sur votre [Dashboard Supabase](https://app.supabase.com/)
2. Sélectionnez votre projet
3. Allez dans **Authentication > Providers**
4. Trouvez **Google** dans la liste et cliquez dessus
5. Activez le toggle **Enable Google provider**
6. Entrez les credentials :
   - **Client ID (for OAuth)** : Collez le Client ID de Google Cloud Console
   - **Client Secret (for OAuth)** : Collez le Client Secret de Google Cloud Console
7. Cliquez sur **Save**

### Étape 5 : Vérifier les URLs de Redirection

Dans Supabase, vérifiez que l'URL de redirection est correcte :
- Elle devrait être : `https://votre-projet.supabase.co/auth/v1/callback`
- Cette URL doit correspondre à celle que vous avez ajoutée dans Google Cloud Console

### Étape 6 : Tester la Connexion

1. Allez sur votre page de login
2. Cliquez sur le bouton "Continuer avec Google"
3. Vous devriez être redirigé vers Google pour autoriser l'application
4. Après autorisation, vous serez redirigé vers `/auth/callback`
5. Vous devriez être connecté et redirigé selon votre type d'utilisateur

## 🔧 Configuration pour Production

### URLs à Ajouter dans Google Cloud Console

Pour la production, ajoutez ces URLs dans **Authorized redirect URIs** :

```
https://votre-projet.supabase.co/auth/v1/callback
```

Et dans **Authorized JavaScript origins** :

```
https://votre-domaine.vercel.app
https://votre-domaine.com
```

### Variables d'Environnement

Aucune variable d'environnement supplémentaire n'est nécessaire. Supabase gère tout côté serveur.

## 🐛 Dépannage

### Erreur "redirect_uri_mismatch"

- Vérifiez que l'URL dans Google Cloud Console correspond exactement à celle de Supabase
- L'URL doit être : `https://votre-projet.supabase.co/auth/v1/callback`
- Pas de slash à la fin, pas d'espaces

### Erreur "access_denied"

- Vérifiez que l'OAuth consent screen est configuré
- Si en mode test, ajoutez l'email de l'utilisateur dans "Test users"

### L'utilisateur n'est pas créé dans la table `users`

- Vérifiez que le trigger `handle_new_user` est bien créé dans Supabase
- Vérifiez les logs Supabase pour voir les erreurs

### Redirection vers /feed au lieu de /admin/dashboard pour les admins

- Vérifiez que `getRedirectPath` dans `users.service.ts` vérifie bien `is_admin`
- Vérifiez que le profil utilisateur a bien `is_admin = true` dans la table `users`

## 📝 Notes Importantes

1. **Première connexion** : Lors de la première connexion avec Google, un profil utilisateur sera automatiquement créé dans la table `users` grâce au trigger `handle_new_user`

2. **Données récupérées** : Google fournit automatiquement :
   - Email
   - Nom (first_name, last_name)
   - Avatar (photo de profil)
   - Ces données sont stockées dans `user_metadata` puis dans la table `users`

3. **Sécurité** : Ne partagez jamais votre Client Secret publiquement. Il doit rester dans Supabase uniquement.

## ✅ Checklist de Vérification

- [ ] Projet créé dans Google Cloud Console
- [ ] OAuth consent screen configuré
- [ ] OAuth Client ID créé
- [ ] URLs de redirection ajoutées dans Google Cloud Console
- [ ] Google provider activé dans Supabase
- [ ] Client ID et Secret ajoutés dans Supabase
- [ ] Test de connexion réussi
- [ ] Profil utilisateur créé automatiquement
- [ ] Redirection fonctionne correctement




