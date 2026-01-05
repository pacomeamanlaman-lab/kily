# Guide de Migration localStorage → Supabase

## 🎯 Objectif
Remplacer progressivement toutes les fonctions localStorage par les services Supabase.

## 📋 Plan de migration par ordre de priorité

### ✅ Phase 1 : Scripts SQL (TERMINÉ)
- [x] Toutes les tables créées dans Supabase
- [x] RLS policies configurées
- [x] Triggers et fonctions créés

### ✅ Phase 2 : Configuration (TERMINÉ)
- [x] Variables d'environnement `.env.local`
- [x] Client Supabase configuré
- [x] Services API créés

### 🔄 Phase 3 : Authentification (EN COURS)
Migration de l'auth localStorage → Supabase Auth

**Fichiers à migrer :**
1. `src/lib/auth.ts` → Utiliser `src/lib/supabase/auth.service.ts`
2. `src/hooks/useCurrentUser.ts` → Utiliser Supabase Auth
3. `src/app/login/page.tsx` → Utiliser `login()` de auth.service
4. `src/app/register/page.tsx` → Utiliser `register()` de auth.service
5. `src/components/auth/ProtectedRoute.tsx` → Utiliser `isLoggedIn()`

**Changements requis :**
```typescript
// AVANT (localStorage)
import { login } from '@/lib/auth';
const success = login(email, password);

// APRÈS (Supabase)
import { login } from '@/lib/supabase';
const { success, user, error } = await login(email, password);
```

### 🔄 Phase 4 : Utilisateurs
Migration de users localStorage → Supabase

**Fichiers à migrer :**
1. `src/lib/users.ts` → Utiliser `src/lib/supabase/users.service.ts`
2. Tous les composants qui utilisent `getCurrentUser()`
3. Tous les composants qui utilisent `getUserById()`

**Changements requis :**
```typescript
// AVANT (localStorage - synchrone)
import { getCurrentUser } from '@/lib/users';
const user = getCurrentUser();

// APRÈS (Supabase - asynchrone)
import { getCurrentUser } from '@/lib/supabase';
const user = await getCurrentUser();
```

### 🔄 Phase 5 : Posts & Feed
Migration de posts localStorage → Supabase

**Fichiers à migrer :**
1. `src/lib/posts.ts` → Utiliser `src/lib/supabase/posts.service.ts`
2. `src/app/feed/page.tsx` → Utiliser `loadPosts()`
3. `src/components/feed/PostCard.tsx` → Utiliser `togglePostLike()`
4. `src/components/feed/CreatePostForm.tsx` → Utiliser `createPost()`
5. `src/components/feed/EditPostModal.tsx` → Utiliser `updatePost()`

### 🔄 Phase 6 : Vidéos
Migration de videos localStorage → Supabase

**Fichiers à migrer :**
1. `src/lib/videos.ts` → Utiliser `src/lib/supabase/videos.service.ts`
2. `src/app/page.tsx` → Utiliser `loadVideos()`
3. `src/components/video/VideoCard.tsx` → Utiliser `toggleVideoLike()`
4. `src/components/publish/CreateVideoForm.tsx` → Utiliser `createVideo()`

### 🔄 Phase 7 : Messagerie
Migration de messages localStorage → Supabase

**Fichiers à migrer :**
1. `src/lib/messages.ts` → Utiliser `src/lib/supabase/messages.service.ts`
2. `src/app/messages/page.tsx` → Utiliser `loadConversations()`
3. `src/app/messages/[id]/page.tsx` → Utiliser `loadMessages()` + `subscribeToMessages()`

### 🔄 Phase 8 : Stories
Migration de stories localStorage → Supabase

**Fichiers à migrer :**
1. `src/lib/stories.ts` → Utiliser `src/lib/supabase/stories.service.ts`
2. `src/components/feed/StoryCarousel.tsx` → Utiliser `loadStories()`
3. `src/components/feed/CreateStoryModal.tsx` → Utiliser `createStory()`

### 🔄 Phase 9 : Follows
Migration de follows localStorage → Supabase

**Fichiers à migrer :**
1. `src/lib/follows.ts` → Utiliser `src/lib/supabase/follows.service.ts`
2. `src/lib/savedTalents.ts` → Utiliser `src/lib/supabase/follows.service.ts`
3. Tous les composants qui utilisent `toggleFollow()`

## 🔧 Différences clés à retenir

### 1. **Synchrone → Asynchrone**
Toutes les fonctions Supabase sont asynchrones (retournent des Promises).

```typescript
// AVANT
const user = getCurrentUser(); // Synchrone

// APRÈS
const user = await getCurrentUser(); // Asynchrone
```

### 2. **Gestion d'erreurs**
```typescript
// AVANT
try {
  createUser(data);
} catch (error) {
  console.error(error);
}

// APRÈS
const { success, user, error } = await register(data);
if (!success) {
  console.error(error);
}
```

### 3. **IDs utilisateurs**
```typescript
// AVANT (localStorage)
const userId = getCurrentUserId(); // "user_123_abc"

// APRÈS (Supabase Auth)
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id; // UUID Supabase
```

### 4. **Relations**
Supabase permet de charger les relations directement :

```typescript
// Charger un post avec les infos de l'auteur
const posts = await supabase
  .from('posts')
  .select(`
    *,
    author:users!author_id (
      first_name,
      last_name,
      avatar
    )
  `);
```

## 🧪 Tests à effectuer après chaque phase

1. **Auth** : Login, logout, register, reset password
2. **Users** : Voir profil, modifier profil
3. **Posts** : Créer, liker, commenter, modifier, supprimer
4. **Videos** : Créer, liker, voir
5. **Messages** : Envoyer, recevoir (temps réel)
6. **Stories** : Créer, voir, expiration 24h
7. **Follows** : Follow/unfollow, count

## 📝 Ordre recommandé de migration

1. ✅ **Auth** (critique) - Toute l'app dépend de l'auth
2. **Users** (critique) - Nécessaire pour tout le reste
3. **Posts** - Fonctionnalité principale du feed
4. **Videos** - Page d'accueil
5. **Messages** - Messagerie privée
6. **Stories** - Stories éphémères
7. **Follows** - Relations sociales

## 🚨 Points d'attention

1. **Compatibilité localStorage** : Ne pas supprimer immédiatement les fichiers localStorage, garder un fallback pendant la transition
2. **Session persistante** : Supabase Auth gère automatiquement la session
3. **RLS** : Vérifier que les politiques RLS permettent les opérations nécessaires
4. **Types TypeScript** : Les types sont définis dans les services
5. **Temps réel** : Utiliser `subscribeToMessages()` pour la messagerie en temps réel

## 🎯 Commencer par quoi ?

Je recommande de commencer par **l'authentification** car c'est la base de tout :

1. Migrer `useCurrentUser` hook
2. Migrer la page login
3. Migrer la page register
4. Tester le flow complet

Prêt à commencer ?
