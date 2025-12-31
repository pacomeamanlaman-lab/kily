# Architecture Kily (anciennement NeighborNet)

## 📊 État Actuel du Projet

**Dernière mise à jour : 31 Décembre 2024**

### Statistiques
- **Commits :** 20+ (main branch)
- **Avancement MVP :** 100% ✅
- **Pages complètes :** 13/13
- **Composants créés :** 28+
- **Lignes de code :** ~10500+

### Fonctionnalités Opérationnelles ✅
✅ Landing page complète avec animations
✅ Système de découverte de talents avec filtres
✅ Pages profils talents détaillées avec portfolio et avis
✅ Navigation mobile globale avec bottom nav
✅ Bottom sheets pour mobile (portfolio, reviews)
✅ Design system violet dark mode complet
✅ Authentification simulée (login/register)
✅ Feed d'actualité avec stories et posts
✅ Recherche globale avec filtres
✅ Système de messaging 1-to-1 avec conversations
✅ Dashboard recruteur avec statistiques
✅ Page paramètres complète (4 sections)
✅ Validation formulaires temps réel
✅ Page 404 personnalisée
✅ États de chargement (skeletons)
✅ Modal de contact interactif
✅ Filtres par catégorie depuis landing
✅ Boutons Follow/Unfollow interactifs
✅ Bouton Save/Unsave sur profils
✅ Notifications Toast avec animations
✅ Layout 3 colonnes desktop (sidebar gauche + feed + sidebar droite)

### MVP Phase 1 - TERMINÉ 🎉
✅ Toutes les pages essentielles (13/13)
✅ Navigation complète et fonctionnelle
✅ Design responsive mobile-first
✅ Layout desktop 3 colonnes façon Facebook
✅ Interactions utilisateur (likes, follows, save, messages)
✅ Données mockées complètes
✅ Toast notifications pour feedback utilisateur
✅ Sidebars avec navigation, tendances, et suggestions

### URL GitHub
https://github.com/pacomeamanlaman-lab/kily

---

## 0. Concept & Vision

### 0.1 Mission
Plateforme de mise en avant des **talents bruts** sans barrière de diplômes ou certifications.

### 0.2 Utilisateurs Cibles
* **Talents locaux** : Personnes avec compétences pratiques (cuisine, bricolage, code, artisanat, etc.)
* **Voisins** : Entraide locale et échange de services de proximité
* **Entreprises/Recruteurs** : Découverte et recrutement de talents autodidactes basés sur compétences réelles
* **Professionnels** : Artisans, experts sans certifications formelles mais avec expérience

### 0.3 Différenciateurs
* Valorisation des compétences **démontrées** vs diplômes
* Système de réputation basé sur la pratique réelle
* Focus Afrique et talents non-conventionnels
* Accessibilité maximale (smartphones basiques, connexion limitée)

## 1. Infrastructure Technique

### 1.1 Frontend
* Framework : Next.js 14
* Styling : Tailwind CSS
* Animations : Framer Motion
* State Management : React Context / Zustand
* Mobile Responsive Design
* **Thème** : Dark Mode (prioritaire) + Light Mode avec toggle

### 1.2 Backend
* Supabase 
* Postgres Database
* Authentification intégrée
* Gestion des temps réel

### 1.3 Services Externes
* Stockage : Supabase Storage
* Authentification : Supabase Auth
* Hébergement : Vercel

## 2. Architecture Applicative

### 2.1 Structure des Dossiers
```
src/
├── app/
│   ├── (auth)/                    # Routes authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (main)/                    # Routes principales
│   │   ├── home/                  # Feed principal
│   │   ├── discover/              # Découverte talents
│   │   ├── profile/[id]/          # Profils
│   │   ├── messages/              # Chat
│   │   └── layout.tsx
│   ├── (recruiter)/               # Dashboard recruteurs
│   │   └── dashboard/
│   └── layout.tsx                 # Root layout
│
├── components/
│   ├── ui/                        # Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── navigation/
│   │   ├── BottomNav.tsx
│   │   └── TopNav.tsx
│   ├── talent/
│   │   ├── TalentCard.tsx
│   │   ├── SkillBadge.tsx
│   │   └── ReputationScore.tsx
│   └── shared/
│
├── lib/
│   ├── supabase/                  # Client Supabase
│   ├── utils/                     # Helpers
│   └── hooks/                     # Custom hooks
│
└── styles/
    └── globals.css                # Thèmes dark/light
```

### 2.2 Pages Principales

#### A. Landing Page (non-authentifié)
* Hero avec parallax et animations
* Section "Talents populaires"
* Catégories de compétences
* Témoignages
* CTA inscription talent/recruteur

#### B. Feed Principal (authentifié)
* Grille de talents disponibles
* Filtres (localisation, compétence, réputation)
* Stories/mises en avant
* Navigation bottom mobile

#### C. Page Profil Talent
* Avatar + badges réputation
* Portfolio (photos/vidéos de réalisations)
* Compétences validées avec niveaux
* Témoignages/avis clients
* Bouton "Contacter" / "Recruter"

#### D. Discover
* Exploration par catégorie
* Map interactive (talents à proximité)
* Trending talents
* Recherche avancée

#### E. Messages
* Chat 1-to-1 temps réel
* Liste conversations
* Notifications

### 2.3 Modules Principaux
* Authentification
* Profil Utilisateur
* Marketplace de Services
* Système de Réputation
* Chat Sécurisé
* Groupes de Compétences

## 3. Base de Données

### 3.1 Tables Principales (Supabase PostgreSQL)

#### users
* id (uuid, primary key)
* email (string, unique)
* phone (string, nullable)
* name (string)
* avatar_url (string, nullable)
* bio (text, nullable)
* user_type (enum: 'talent', 'neighbor', 'recruiter')
* location (point/geography, nullable)
* created_at (timestamp)
* updated_at (timestamp)

#### skills
* id (uuid, primary key)
* name (string)
* category (string: 'cuisine', 'bricolage', 'tech', 'artisanat', etc.)
* icon (string, nullable)
* created_at (timestamp)

#### user_skills
* id (uuid, primary key)
* user_id (uuid, foreign key → users)
* skill_id (uuid, foreign key → skills)
* level (enum: 'beginner', 'intermediate', 'expert')
* verified (boolean, default false)
* years_experience (integer, nullable)
* created_at (timestamp)

#### portfolios
* id (uuid, primary key)
* user_id (uuid, foreign key → users)
* media_url (string)
* media_type (enum: 'image', 'video')
* description (text, nullable)
* skill_id (uuid, foreign key → skills, nullable)
* created_at (timestamp)

#### services
* id (uuid, primary key)
* user_id (uuid, foreign key → users)
* title (string)
* description (text)
* price (decimal, nullable)
* category (string)
* status (enum: 'active', 'inactive', 'completed')
* created_at (timestamp)
* updated_at (timestamp)

#### reviews
* id (uuid, primary key)
* from_user_id (uuid, foreign key → users)
* to_user_id (uuid, foreign key → users)
* service_id (uuid, foreign key → services, nullable)
* rating (integer, 1-5)
* comment (text, nullable)
* created_at (timestamp)

#### reputation_scores
* id (uuid, primary key)
* user_id (uuid, foreign key → users, unique)
* total_score (decimal)
* total_reviews (integer)
* badges (jsonb, array of badge objects)
* updated_at (timestamp)

#### messages
* id (uuid, primary key)
* from_user_id (uuid, foreign key → users)
* to_user_id (uuid, foreign key → users)
* content (text)
* read (boolean, default false)
* created_at (timestamp)

#### transactions
* id (uuid, primary key)
* from_user_id (uuid, foreign key → users)
* to_user_id (uuid, foreign key → users)
* service_id (uuid, foreign key → services)
* amount (decimal, nullable)
* status (enum: 'pending', 'completed', 'cancelled')
* created_at (timestamp)
* completed_at (timestamp, nullable)

## 4. Fonctionnalités Techniques

### 4.1 Authentification
* Inscription par email/téléphone
* Validation par SMS
* OAuth (Google, Facebook)
* Authentification sécurisée

### 4.2 Système de Réputation
* Algorithme de calcul de score
* Badges dynamiques
* Historique des interactions

### 4.3 Chat Sécurisé
* Chiffrement de bout en bout
* Gestion des permissions
* Modération automatique

## 5. Sécurité

### 5.1 Protections
* HTTPS
* Chiffrement des données
* Protection contre injections SQL
* Limitation des requêtes
* Authentification multi-facteurs

### 5.2 Confidentialité
* RGPD Compliant
* Anonymisation partielle
* Contrôle des données personnelles

## 6. Déploiement

### 6.1 Stratégie
* Conteneurisation Docker
* Déploiement Kubernetes
* CI/CD avec GitHub Actions

### 6.2 Monitoring
* Logs applicatifs
* Suivi des performances
* Alertes de sécurité

## 7. Roadmap de Développement

### 7.1 Phase 1 - MVP (✅ TERMINÉ - 100%)
**Objectif : Lancement rapide avec fonctionnalités essentielles**

#### 📱 Pages Complétées (13/13)

**Pages Publiques :**
1. ✅ Landing page (/) - Hero avec parallax, talents populaires, catégories cliquables, features, footer
2. ✅ Login (/login) - Auth avec validation temps réel, OAuth mockés, loading state
3. ✅ Register (/register) - Formulaire 3 étapes (type, infos, compétences), validation dynamique
4. ✅ 404 (/not-found) - Page erreur personnalisée avec animations

**Pages Authentifiées :**
5. ✅ Feed (/feed) - Stories carousel, posts avec likes/comments, suggestions talents
6. ✅ Discover (/discover) - Recherche, filtres (catégories, villes), grille responsive
7. ✅ Search (/search) - Recherche globale, tabs, états vides, suggestions
8. ✅ Profile Talent (/profile/[id]) - Header immersif, portfolio, avis, bottom sheets mobile
9. ✅ Profile User (/profile) - Profil personnel éditable, stats, settings preview

**Pages Messaging :**
10. ✅ Messages List (/messages) - Liste conversations mockées, recherche, online status, unread badges
11. ✅ Conversation (/messages/[id]) - Chat 1-to-1, messages temps réel mockés, auto-scroll

**Pages Recruteur :**
12. ✅ Recruiter Dashboard (/recruiter/dashboard) - Stats, sauvegardés, contactés, actions rapides

**Pages Settings :**
13. ✅ Settings (/settings) - 4 tabs (profil, notifications, confidentialité, sécurité)

#### 🎨 Composants Créés (20+)

**UI de Base :**
* Button (4 variants: primary, secondary, outline, ghost)
* Card (3 variants avec animations)
* Badge (5 variants)
* Input (avec label, error, icon support)
* BottomSheet (drawer mobile animé)
* Skeleton (3 variants pour loading states)
* StepIndicator (progression multi-étapes)
* Toast (notifications avec 3 types: success, error, info)

**Navigation :**
* BottomNav (global, 4 tabs avec routing)
* TopNav (landing page)

**Composants Métier :**
* TalentCard (card talent cliquable avec hover effects)
* SkillBadge (compétence + niveau d'expertise)
* ReputationScore (rating étoiles avec count)
* PostCard (posts feed avec interactions)
* StoryCarousel (stories horizontal scroll)

#### 🗄️ Types & Data
* Types TypeScript complets (Talent, Skill, Review, Post, Story, etc.)
* Mock data : 12 talents africains, 10+ skills, reviews, 5 posts, 4 stories
* Villes africaines (14 villes)
* Catégories de compétences (10 catégories)

#### ✨ Features Implémentées
* ✅ Dark mode complet avec thème violet (#8b5cf6)
* ✅ Authentification simulée (localStorage)
* ✅ Navigation complète inter-pages
* ✅ Filtres avancés (recherche, catégories, villes)
* ✅ Validation formulaires temps réel
* ✅ Interactions sociales (likes, follows avec toggle, save talents, messages)
* ✅ Bottom sheets pour mobile UX
* ✅ Loading states avec skeletons
* ✅ Page 404 personnalisée
* ✅ Modal de contact interactif
* ✅ Stories et posts feed
* ✅ Dashboard recruteur
* ✅ Système de messaging avec conversations mockées
* ✅ Settings complets (4 sections)
* ✅ Design responsive mobile-first
* ✅ Layout desktop 3 colonnes (sidebar gauche + feed + sidebar droite)
* ✅ Sidebar gauche avec navigation principale (6 items)
* ✅ Sidebar droite avec suggestions, tendances, villes actives
* ✅ Animations Framer Motion partout
* ✅ Notifications Toast avec auto-dismiss
* ✅ Follow/Unfollow talents avec feedback
* ✅ Save/Unsave profils (favoris)
* ✅ SEO basique (metadata, lang fr)

---

### 7.2 Phase 1.5 - Interactions Frontend (EN COURS - 90%)
**Objectif : Finaliser toutes les interactions avant l'intégration backend**

#### 🎯 Feed Interactions ✅ TERMINÉ
* ✅ Follow/Unfollow talents
* ✅ Likes sur posts (toggle cœur + compteur)
* ✅ Commentaires (modal avec 19 commentaires mockés + ajout)
* ✅ Partage de posts (bouton share avec toast)
* ✅ Filtres fonctionnels (Tous/Abonnements/Tendances qui filtrent vraiment)
* ✅ Stories cliquables (modal plein écran avec navigation et progress bars)
* ✅ Infinite scroll (charge +2 posts automatiquement, message fin de feed)

#### 💬 Messaging Interactions ✅ TERMINÉ
* ✅ Liste conversations avec recherche
* ✅ Envoyer message (input + bouton send qui ajoute au chat)
* ✅ Indicateur "en train d'écrire..." (3 dots animés)
* ✅ Marquer comme lu (badge unread disparaît au clic)

#### 👤 Profile Interactions ✅ TERMINÉ
* ✅ Save/Unsave talent
* ✅ Éditer son profil (modal édition avec nom, bio, email, phone, ville)
* ✅ Upload photo de profil (avatar)
  - FileReader API pour preview locale en base64
  - Toast de confirmation "Photo de profil mise à jour !"
* ✅ Upload photo de couverture
  - FileReader API pour preview locale en base64
  - Toast de confirmation "Photo de couverture mise à jour !"
* ✅ Ajouter portfolio item - Multi-upload avec drag & drop
  - Sélection multiple d'images (FileReader API)
  - Glisser-déposer avec feedback visuel
  - Génération automatique de titres numérotés ("Portfolio item 1, 2, 3...")
  - Preview locale des images en base64
  - Toast compteur d'images uploadées
  - Bouton "Ajouter plus" toujours visible dans la grille
* ✅ Éditer portfolio item (modal avec titre + description modifiables)
  - Bouton édition au hover sur chaque image
  - Modal dédiée pour modification
  - Affichage titre/description en bas de chaque image
* ✅ Ajouter des compétences - Système interactif avec tags
  - 45+ compétences prédéfinies organisées en 9 catégories
  - Tags cliquables avec effet visuel (Check icon quand sélectionné)
  - Barre de recherche avec filtrage en temps réel
  - Saisie manuelle de compétences personnalisées (input + bouton Plus)
  - Section "Compétences personnalisées" dédiée et cliquable
  - Possibilité de désélectionner toute compétence (prédéfinie ou personnalisée)
  - Compteur de sélections en temps réel dans le header
  - Niveau par défaut "intermediate"
  - Modal optimisé (hauteur 35vh) avec CTA footer toujours visibles
* ✅ Amélioration UI contact info
  - Cards stylisées avec icônes Mail/Phone
  - Containers violets pour icônes avec hover effect
  - Layout responsive (1 col mobile, 2 desktop)
  - Labels au-dessus des valeurs
* ✅ Laisser un avis (étoiles + commentaire)
* ✅ Bouton "Recruter" (toast + redirect vers messages)

#### 💼 Dashboard Recruteur ✅ TERMINÉ
* ✅ Tabs fonctionnels (switcher entre Stats/Sauvegardés/Contactés)
  - Tab "Vue d'ensemble" avec statistiques dynamiques
  - Tab "Sauvegardés" avec liste filtrée
  - Tab "Contactés" avec historique
  - Animations smooth entre tabs
* ✅ Actions sur talents sauvegardés
  - Bouton "Retirer" (icône Trash) au hover sur card
  - Bouton "Contacter" (icône Mail) au hover sur card
  - Toast de confirmation pour chaque action
  - Redirect automatique vers messages après contact
  - State management avec mise à jour temps réel
* ✅ Filtres et recherche (tabs Sauvegardés et Contactés)
  - Barre de recherche par nom, compétence ou ville
  - Filtres par catégorie (6 catégories) avec pills cliquables
  - Compteur dynamique de résultats filtrés
  - Bouton reset des filtres
  - Message "Aucun résultat" si filtres vides
  - Empty states personnalisés par tab
* ✅ Stats dynamiques mis à jour en temps réel
  - Compteur talents sauvegardés
  - Compteur contacts envoyés
* ✅ Bouton "Message" direct dans tab Contactés
* ✅ Overlays d'actions au hover avec transitions

#### 🔍 Discover/Search ✅ TERMINÉ
* ✅ Filtres catégories et villes
* ✅ Search en temps réel (recherche globale fonctionnelle)
  - Filtrage instantané par nom, compétence ou ville
  - useMemo pour optimisation
* ✅ Tabs search (switcher entre Talents/Posts/Utilisateurs)
  - Tab "Talents" avec grille de TalentCard
  - Tab "Posts" avec liste de PostCard (layout centré)
  - Tab "Utilisateurs" avec liste stylisée + badges (Talent/Utilisateur)
  - Compteurs dynamiques sur chaque tab (badges)
  - Animations smooth entre tabs
  - Empty states personnalisés par tab (🔍📝👤)
  - Header compteur adaptatif selon tab actif

#### 📝 Register/Inscription ✅ Amélioration
* ✅ Uniformisation système de compétences (Step 3)
  - Remplacement mockSkills par les mêmes 45+ compétences prédéfinies que profile
  - Barre de recherche avec filtrage en temps réel
  - Tags cliquables avec Check icon
  - Saisie manuelle avec input + bouton Plus
  - Section "Compétences personnalisées" dédiée
  - Même UX que l'édition de profil

#### ⚙️ Settings ✅
* ✅ Toggle notifications (switches fonctionnels avec Toast)
* ✅ Changer mot de passe (formulaire avec validation et Toast)
* ✅ Changer email/phone (formulaires avec validation et Toast)

**Détails de l'implémentation :**
- Toggles fonctionnels pour notifications (5 options)
- Toggles fonctionnels pour confidentialité (3 options)
- Formulaire changement mot de passe avec :
  * Validation longueur minimum 8 caractères
  * Vérification correspondance confirmation
  * Reset automatique après succès
  * Toast feedback
- Formulaire changement email avec :
  * Validation regex email
  * Confirmation par mot de passe
  * Mise à jour du profil
  * Toast feedback
- Formulaire changement téléphone avec :
  * Validation regex téléphone
  * Confirmation par mot de passe
  * Mise à jour du profil
  * Toast feedback
- Toast notifications globales pour tous les retours utilisateur

#### ✨ Micro-interactions ✅
* ✅ Notifications badge (compteur sur icône notifs)
* ✅ Pull to refresh sur mobile

**Détails de l'implémentation :**
- Badge de notifications sur icône Messages (bottom nav mobile) :
  * Badge rouge avec compteur (3 non lus)
  * Support pour 9+ messages
  * Position absolute top-right sur l'icône
- Badge de notifications sur icône Bell (mobile + desktop) :
  * Mobile : Badge dans header feed (5 notifications)
  * Desktop : Badge dans DesktopHeader global (5 notifications)
  * Support pour 9+ notifications
  * Visible sur Feed, Discover, Messages en desktop
- Header desktop global (nouveau) :
  * Composant DesktopHeader conditionnel
  * Affiché sur : /feed, /discover, /messages
  * Contient : Logo + Search bar + Bell icon (badge) + Avatar
  * Sticky top, bg-black/95, backdrop-blur
  * Hidden sur mobile (lg:block)
- Pull to refresh sur mobile :
  * Détection du swipe down au top de la page
  * Indicateur visuel avec rotation d'icône
  * Feedback Toast pour actualisation
  * Animation smooth avec Framer Motion
  * Implémenté sur Feed et Discover pages
  * Distance de pull: 80px minimum pour trigger
  * Max distance: 100px

### 🎉 Phase 1.5 - Frontend Interactions TERMINÉE
Toutes les interactions frontend MVP sont complétées :
- ✅ Profile interactions (avatar/cover upload, skills, portfolio)
- ✅ Dashboard Recruteur (tabs, filters, actions)
- ✅ Discover/Search (tabs, filtres multi-critères)
- ✅ Register Skills uniformization
- ✅ Settings (toggles, password/email/phone forms)
- ✅ Micro-interactions (notifications badge, pull to refresh)

### 🎥 Phase 1.75 - Système Vidéo (TikTok-like) ✅
**Objectif : Intégration de vidéos talents dans l'app**

#### Composants Créés
* ✅ **VideoCard.tsx** - Vignette vidéo avec thumbnail, durée, stats
  - Thumbnail avec overlay gradient
  - Play button animé au hover
  - Badge durée et vues
  - Info auteur avec badge vérifié
  - Stats (likes, commentaires)
  - Hover effects avec Framer Motion

* ✅ **VideoPlayer.tsx** - Player modal TikTok-like avancé
  - Player vidéo plein écran responsive (desktop/mobile)
  - Navigation multi-input :
    * Swipe vertical tactile (up/down) pour mobile
    * Molette souris pour desktop
    * Clavier (flèches haut/bas, Espace)
  - Controls: Play/Pause, Mute/Unmute, Progress bar
  - Actions: Like, Comment, Share avec compteurs
  - **Sidebar commentaires style TikTok** :
    * Desktop : slide depuis la droite avec backdrop blur
    * Mobile : drawer depuis le bas
    * 15 commentaires mockés par vidéo
    * Liste scrollable avec avatars
  - **Synchronisation likes localStorage** :
    * Likes partagés entre VideoCardFeed et VideoPlayer
    * Persistance entre sessions
    * Compteurs mis à jour en temps réel
  - Info auteur en overlay
  - Animations smooth avec Framer Motion
  - Touch gestures optimisés
  - **Hook useIsMobile()** pour détection responsive
  - Indicateurs de progression masqués (optimisation UX)

* ✅ **VideoCardFeed.tsx** - Card vidéo pour le feed
  - Composant dédié au feed (différent de VideoCard discover)
  - Intégration popup commentaires (comme PostCard)
  - Synchronisation likes avec VideoPlayer via localStorage
  - Bouton play toujours visible sur thumbnail
  - Animations conditionnelles desktop/mobile

* ✅ **videoLikes.ts** - Gestion localStorage des likes vidéos
  - Fonctions : `loadVideoLikes()`, `isVideoLiked()`, `getVideoLikesCount()`, `toggleVideoLike()`, `initVideoLikesCount()`
  - Persistance état like + compteur
  - Synchronisation entre tous les composants vidéo
  - Interface TypeScript `VideoLikesState`

* ✅ **videoData.ts** - 8 vidéos mockées + commentaires
  - Vidéos gratuites (isPremium: false)
  - Catégories variées (cuisine, tech, beauté, artisanat, etc.)
  - Auteurs avec avatars et badges vérifiés
  - Stats réalistes (vues, likes, comments, shares)
  - **15 commentaires mockés par vidéo** avec auteur, timestamp, likes

#### Intégrations
* ✅ **Feed Page** - Feed mixte posts + vidéos
  - Alternance : 2 posts, 1 vidéo, 2 posts, 1 vidéo...
  - VideoCardFeed cliquable ouvrant VideoPlayer modal
  - Intégré mobile & desktop
  - Likes synchronisés localStorage

* ✅ **Discover Page** - Tab "Vidéos" dédié + infinite scroll
  - 4ème tab "Vidéos" avec compteur dynamique
  - Grid responsive (1-2-3-4 colonnes selon écran)
  - Filtres par catégorie fonctionnels
  - Search par titre, description, auteur
  - **Infinite scroll sur tous les tabs** (Tous, Populaires, Récents, Vidéos)
  - Charge +6 items automatiquement à l'approche du bas
  - Message "Vous avez tout vu" en fin de scroll
  - Empty state avec emoji 🎥

#### Features Vidéo
- Format vertical 9:16 (format mobile-first)
- Auto-play au chargement
- Muted par défaut
- Loop activé
- Touch swipe pour next/prev vidéo (min 50px)
- Like interactif (animation coeur rouge) synchronisé
- Compteurs animés (formatage K/M)
- Modal full-screen avec backdrop blur
- Close button (X) en haut
- Navigation hints (swipe indicators)
- Commentaires TikTok-style (sidebar desktop, drawer mobile)
- Système de likes persistant (localStorage)
- Infinite scroll discover

#### URLs Vidéos Utilisées
- Google Test Videos (commondatastorage bucket)
- Format: MP4, compatible tous navigateurs
- Poids optimisé pour streaming

---

### 📝 Phase 1.8 - Système de Publication (Publish/Create) ✅
**Objectif : Permettre aux utilisateurs de créer du contenu**

#### Composants Créés

* ✅ **PublishModal.tsx** - Modal de choix post/vidéo
  - Modal centrée avec animations Framer Motion
  - 2 options stylisées : "Publier un post" / "Publier une vidéo"
  - Support `initialType` pour ouverture directe d'un formulaire
  - Synchronisation état avec useEffect
  - Bouton annuler et fermeture backdrop
  - Design violet dark cohérent

* ✅ **CreatePostForm.tsx** - Formulaire création de post
  - Textarea avec compteur 500 caractères
  - Upload image optionnel avec preview
  - Sélecteur de catégorie (8 catégories)
  - Validation côté client
  - Mock API call avec délai 1s
  - Toast confirmation succès
  - Boutons "Retour" et "Publier"
  - État submitting avec disable

* ✅ **CreateVideoForm.tsx** - Formulaire upload vidéo
  - Upload vidéo avec preview player
  - Validation taille max 100MB
  - Champ titre avec compteur 100 caractères
  - Champ description optionnel 300 caractères
  - Sélecteur de catégorie (8 catégories)
  - Mock API call avec délai 2s
  - Toast confirmation succès
  - Preview vidéo avec controls
  - Bouton supprimer vidéo

* ✅ **CreatePostButton.tsx** - Composant "Quoi de neuf" Facebook-style
  - Avatar utilisateur à gauche
  - Input factice "Quoi de neuf, {Nom} ?" cliquable
  - 2 boutons rapides : Photo (icône Image) et Vidéo (icône Video)
  - **Icône Photo** : ouvre directement CreatePostForm
  - **Icône Vidéo** : ouvre directement CreateVideoForm
  - **Input principal** : ouvre modal de choix
  - État modal géré avec objet {isOpen, type}
  - Design card violet avec hover effects
  - Cursor pointer sur tous les éléments cliquables

* ✅ **CreateStoryModal.tsx** - Modal création de story
  - Upload image avec preview
  - Format 9:16 recommandé (aspect-ratio CSS)
  - Validation type image + max 10MB
  - Preview en taille story (mobile-like)
  - Bouton supprimer image
  - Mock API call avec délai 1s
  - Toast confirmation succès
  - Expiration 24h calculée
  - Design cohérent avec autres modals

* ✅ **toast.ts** - Utilitaire notifications
  - Fonction `showToast(message, type)` avec 3 types : success, error, info
  - Fallback alert navigateur pour MVP
  - TODO : Remplacer par composant Toast personnalisé
  - Support emoji selon type (✅ ❌ ℹ️)

#### Intégrations Navigation

* ✅ **BottomNav (Mobile)** - Bouton publish centré flottant
  - Layout 2-1-2 (2 tabs gauche, bouton center, 2 tabs droite)
  - Bouton "+" violet gradient, arrondi, flottant au-dessus nav (-top-4)
  - Effet scale au hover (110%) et active (95%)
  - Shadow violet pour effet 3D
  - Ouvre PublishModal au clic
  - BottomNavWrapper client component pour gestion état modal

* ✅ **Feed Desktop** - CreatePostButton au-dessus stories
  - Composant inséré entre filtres et stories
  - Layout horizontal : avatar + input + 2 icônes
  - Raccourcis directs : Photo → Post, Vidéo → Video
  - Design cohérent avec cards feed
  - Visible uniquement desktop (mobile = bouton bottom nav)

* ✅ **StoryCarousel** - Bouton "Ajouter" fonctionnel
  - Premier item du carousel = bouton "Créer story"
  - Cercle violet gradient avec icône Plus
  - onClick ouvre CreateStoryModal
  - Cursor pointer avec hover scale
  - Label "Ajouter" en dessous

#### Features Publication
- 📝 Posts : texte + image optionnelle + catégorie
- 🎥 Vidéos : upload + titre + description + catégorie
- 📖 Stories : image format 9:16, expiration 24h
- ✅ Validation formulaires temps réel
- ✅ Preview médias (image/vidéo) avant publication
- ✅ Compteurs de caractères
- ✅ Mock storage (console.log pour MVP)
- ✅ Toast feedback utilisateur
- ✅ États loading avec boutons disabled
- ✅ Cursor pointer partout
- ✅ Raccourcis directs (photo/vidéo icons)
- ✅ Modal choice pour input principal

#### Workflow Utilisateur
**Mobile :**
1. Clic bouton "+" bottom nav → Modal choix
2. Clic icône Photo (feed desktop) → Formulaire post direct
3. Clic icône Vidéo (feed desktop) → Formulaire vidéo direct
4. Clic "Ajouter" stories → Modal story direct

**Desktop :**
1. Clic "Quoi de neuf" → Modal choix
2. Clic icône Photo → Formulaire post direct
3. Clic icône Vidéo → Formulaire vidéo direct
4. Clic "Ajouter" stories → Modal story direct

#### Données Mockées
- Auteur par défaut : "Vous" (@vous)
- Avatar par défaut : image placeholder
- Timestamp : Date.now()
- Stories : expiration calculée (+24h)
- Sauvegarde : console.log (TODO: localStorage ou API)

---

### 7.3 Phase 2 - Backend & Intégration
**Objectif : Connexion backend + données réelles**

#### Features Backend
* ⏳ Setup Supabase complet
* ⏳ Auth complète (email + phone + OAuth réels)
* ⏳ Chat temps réel avec Supabase Realtime
* ⏳ Upload images (avatar, portfolio)
* ⏳ Base de données PostgreSQL
* ⏳ Système de notifications
* ⏳ Toggle Light/Dark mode
* ⏳ Paiements (Mobile Money)

#### Optimisations Techniques
* ⏳ Next.js Image pour optimisation
* ⏳ Meta tags SEO dynamiques
* ⏳ Accessibilité (ARIA labels)
* ⏳ Tests unitaires (Jest)
* ⏳ Performance optimization

---

### 7.3 Phase 3 - Features Avancées
**Objectif : Différenciation et scalabilité**

#### Features
* ✅ Map interactive (talents à proximité)
* ✅ Paiements intégrés (Mobile Money)
* ✅ Analytics utilisateurs
* ✅ Notifications push
* ✅ Groupes de compétences
* ✅ Stories/mises en avant

#### Optimisations
* Microservices
* Scalabilité horizontale
* Cache stratégies avancées

## 8. Internationalisation

### 8.1 Langues
* Français
* Anglais
* Langues locales africaines

### 8.2 Adaptations
* Formats de dates locaux
* Devises multiples
* Supports culturels

## 9. Accessibilité

### 9.1 Compatibilité
* Smartphones basiques
* Connexion internet limitée
* Mode basse consommation
* Taille de données réduite

## 10. Annexes Techniques

### 10.1 Stack Technique
* Languages : TypeScript
* Frontend : React
* Backend : Node.js
* Base de données : PostgreSQL
* ORM : Prisma
* API : GraphQL

### 10.2 Outils de Développement
* ESLint
* Prettier
* Jest (tests)
* Storybook
* TypeScript

### 10.3 Performance
* Code Splitting
* Lazy Loading
* Cache Stratégies
* Optimisation images

## 11. Design System

### 11.1 Inspiration Design
* Source : Projet stars2babi (C:\Users\OMEN\Documents\video)
* Style : Moderne, Premium, Animations fluides

### 11.2 Palette de Couleurs

#### Dark Mode (Prioritaire)
* Background principal : `#000000` (noir)
* Background secondaire : `#0a0a0a` (noir léger)
* Texte principal : `#ffffff` (blanc)
* Texte secondaire : `#9ca3af` (gris)
* Accent violet : `#8b5cf6` (violet-500)
* Accent violet foncé : `#6d28d9` (violet-700)
* Bordures : `rgba(255, 255, 255, 0.1)` (blanc transparent)

#### Light Mode (Secondaire)
* Background principal : `#ffffff` (blanc)
* Background secondaire : `#f8f9fa` (gris très clair)
* Texte principal : `#1a1a1a` (presque noir)
* Texte secondaire : `#6b7280` (gris)
* Accent violet : `#8b5cf6` (violet-500) - identique
* Accent violet foncé : `#6d28d9` (violet-700) - identique
* Bordures : `#e5e7eb` (gris clair)

### 11.3 Composants UI
* Navigation bottom mobile (4 tabs)
* Cards avec effets hover et animations
* Boutons violets avec effets scale
* Modales de paiement/actions
* Système de badges de réputation
* Profils utilisateurs avec avatars
* Grilles responsive (talents/services)

### 11.4 Animations
* Framer Motion pour transitions
* Parallax scrolling
* Hover effects (scale, translate)
* Page transitions fluides
* Loading states animés