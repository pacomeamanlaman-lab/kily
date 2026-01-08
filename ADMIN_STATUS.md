# 📊 État des Lieux - Pages d'Administration

## ✅ Users (95% Fonctionnel)

### ✅ Fonctionnalités Implémentées
- Chargement des utilisateurs depuis Supabase
- Filtres (recherche, type, statut)
- Actions complètes :
  - ✅ Voir profil (modal en lecture seule)
  - ✅ Éditer profil (modal édition)
  - ✅ Bannir/Suspendre/Réactiver utilisateur
  - ✅ Supprimer utilisateur
- Modals : AddUserModal, EditUserModal
- Mise à jour locale sans rechargement de page
- Affichage correct des types (Super Admin, Recruteur, Talent, Voisin)
- Badges de statut (Actif, Banni, Suspendu)

### ⚠️ À Améliorer (5%)
- Peut-être optimiser les performances pour de grandes listes
- Pagination si nécessaire

---

## ⚠️ Content (60% Semi-fonctionnel)

### ✅ Fonctionnalités Implémentées
- Chargement des posts, vidéos, stories depuis Supabase
- Filtres (recherche, type, catégorie)
- Stats cards (nombre de posts, vidéos, stories)
- Affichage des contenus avec thumbnails
- Action "Supprimer" (appelle `/api/admin/delete-content`)

### ❌ À Implémenter (40%)
1. **Compter les signalements** (lignes 134, 157)
   - Actuellement : `reports: 0`
   - À faire : Récupérer depuis la table `reports` et compter par contenu

2. **Routes pour voir un contenu spécifique** (lignes 48-52)
   - Actuellement : Redirige vers `/feed`
   - À faire : Créer routes `/posts/[id]`, `/videos/[id]`, `/stories/[id]`

3. **✅ API route `/api/admin/delete-content` existe et fonctionne**

4. **Améliorer l'affichage des signalements**
   - Afficher un badge rouge si `reports > 0`

---

## ⚠️ Messages (65% Semi-fonctionnel)

### ✅ Fonctionnalités Implémentées
- Chargement des conversations depuis Supabase
- Graphiques (messages par jour, par heure)
- Stats cards (total messages, conversations actives, croissance, signalements)
- Liste des conversations récentes avec participants
- Affichage du dernier message

### ❌ À Implémenter (35%)
1. **Compter les messages par conversation** (ligne 56)
   - Actuellement : `messagesCount: 0`
   - À faire : Requête Supabase pour compter les messages dans chaque conversation

2. **Vérifier si une conversation est signalée** (ligne 59)
   - Actuellement : `reported: false`
   - À faire : Vérifier dans la table `reports` si la conversation est signalée

3. **Action "Voir conversation"** (ligne 230)
   - Actuellement : Bouton sans action
   - À faire : Rediriger vers une page de détail de conversation ou ouvrir un modal

4. **Stat "Croissance"** (ligne 129)
   - Actuellement : Valeur hardcodée `"+18%"`
   - À faire : Calculer la vraie croissance depuis les données

---

## ⚠️ Categories (70% Semi-fonctionnel)

### ✅ Fonctionnalités Implémentées
- Chargement des catégories depuis Supabase (via `getCategoriesStats`)
- Affichage des stats (talents, posts par catégorie)
- Stats cards (total catégories, total talents, total posts)
- Affichage des catégories avec icônes et couleurs

### ❌ À Implémenter (30%)
1. **Bouton "Nouvelle Catégorie"** (ligne 76)
   - Actuellement : Bouton sans action
   - À faire : Créer un modal pour ajouter une nouvelle catégorie

2. **Boutons "Éditer" et "Supprimer"** (lignes 137-142)
   - Actuellement : Boutons sans action
   - À faire : 
     - Modal d'édition pour modifier une catégorie
     - Confirmation + suppression d'une catégorie

3. **Gérer les catégories depuis la DB**
   - Actuellement : Les catégories sont calculées depuis `skills` et `posts`
   - À faire : Créer une table `categories` pour gérer les catégories de manière centralisée

---

## ❌ Moderation (10% Maquette)

### ✅ Fonctionnalités Implémentées
- Chargement des signalements depuis Supabase
- Filtres (type, statut)
- Stats cards (en attente, approuvés, rejetés, total)
- Affichage des signalements avec détails

### ❌ À Implémenter (90%)
1. **Compter les signalements multiples** (ligne 98)
   - Actuellement : `reportCount: 1`
   - À faire : Grouper les signalements par `reported_item_id` et `reported_item_type`

2. **Actions sur les signalements** (lignes 311-326)
   - **"Voir détails"** : Ouvrir un modal ou rediriger vers le contenu signalé
   - **"Approuver"** : Mettre le statut à `approved` dans la table `reports`
   - **"Supprimer"** : Supprimer le contenu signalé (post/video/story/user)
   - **"Bannir auteur"** : Bannir l'auteur du contenu signalé

3. **API Routes à créer** :
   - `/api/admin/approve-report` : Approuver un signalement
   - `/api/admin/reject-report` : Rejeter un signalement
   - `/api/admin/delete-reported-content` : Supprimer le contenu signalé

4. **Récupérer le contenu signalé**
   - Actuellement : Affiche seulement l'ID et le type
   - À faire : Joindre les tables `posts`, `videos`, `stories`, `users` pour afficher les détails du contenu signalé

5. **Afficher le thumbnail du contenu signalé**
   - Actuellement : Affiche un placeholder si pas de thumbnail
   - À faire : Récupérer le thumbnail depuis le contenu signalé

---

## ❌ Reputation (5% Maquette)

### ✅ Fonctionnalités Implémentées
- Chargement des top talents depuis Supabase
- Affichage des badges statiques (hardcodés)
- Stats cards (badges disponibles, badges attribués, note moyenne, croissance)
- Tableau des top talents avec classement

### ❌ À Implémenter (95%)
1. **Bouton "Nouveau Badge"** (ligne 168)
   - Actuellement : Bouton sans action
   - À faire : Créer un modal pour ajouter un nouveau badge

2. **Boutons "Éditer" et "Supprimer" pour les badges** (lignes 243-248)
   - Actuellement : Boutons sans action
   - À faire : 
     - Modal d'édition pour modifier un badge
     - Confirmation + suppression d'un badge

3. **Gérer les badges depuis la DB**
   - Actuellement : Badges hardcodés dans le code (lignes 73-128)
   - À faire : 
     - Créer une table `badges` dans Supabase
     - Créer une table `user_badges` pour lier les badges aux utilisateurs
     - Remplacer les badges statiques par des données depuis Supabase

4. **Calculer les badges automatiquement**
   - Actuellement : `usersCount` est hardcodé
   - À faire : Calculer depuis `user_badges` le nombre d'utilisateurs ayant chaque badge

5. **Afficher les badges des talents**
   - Actuellement : `badges: []` dans `getTopTalents` (ligne 944)
   - À faire : Récupérer les badges depuis `user_badges` pour chaque talent

6. **Stat "Croissance avis"** (ligne 215)
   - Actuellement : Valeur hardcodée `"+23%"`
   - À faire : Calculer la vraie croissance depuis les données

7. **Calculer la note moyenne** (ligne 145)
   - Actuellement : Calculée depuis `topTalents` seulement
   - À faire : Calculer depuis tous les talents, pas seulement le top 10

---

## 📋 Résumé des Priorités

### 🔴 Priorité Haute
1. **Moderation** : Implémenter les actions (approuver, rejeter, supprimer, bannir)
2. **Content** : Compter les signalements et créer les routes de détail
3. **Messages** : Compter les messages par conversation et vérifier les signalements

### 🟡 Priorité Moyenne
4. **Categories** : Implémenter les actions (créer, éditer, supprimer)
5. **Reputation** : Créer la structure DB pour les badges et implémenter les actions

### 🟢 Priorité Basse
6. **Users** : Optimisations mineures
7. **Messages** : Calculer la vraie croissance
8. **Reputation** : Calculer la vraie croissance et la note moyenne globale

---

## 🗄️ Tables Supabase à Vérifier/Créer

### Tables existantes (à vérifier)
- ✅ `users`
- ✅ `posts`
- ✅ `videos`
- ✅ `stories`
- ✅ `messages`
- ✅ `conversations`
- ✅ `reports`
- ✅ `skills`

### Tables à créer
- ❌ `categories` (pour gérer les catégories de manière centralisée)
- ❌ `badges` (pour gérer les badges)
- ❌ `user_badges` (pour lier les badges aux utilisateurs)

---

## 🔧 API Routes à Créer/Vérifier

### ✅ Vérifiées
- `/api/admin/delete-content` (existe et fonctionne)

### À créer
- `/api/admin/approve-report` (pour Moderation)
- `/api/admin/reject-report` (pour Moderation)
- `/api/admin/delete-reported-content` (pour Moderation)
- `/api/admin/create-category` (pour Categories)
- `/api/admin/update-category` (pour Categories)
- `/api/admin/delete-category` (pour Categories)
- `/api/admin/create-badge` (pour Reputation)
- `/api/admin/update-badge` (pour Reputation)
- `/api/admin/delete-badge` (pour Reputation)
- `/api/admin/assign-badge` (pour Reputation)
- `/api/admin/remove-badge` (pour Reputation)

