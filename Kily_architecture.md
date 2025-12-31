# Architecture Kily (anciennement NeighborNet)

## 📊 État Actuel du Projet

**Dernière mise à jour : 31 Décembre 2024**

### Statistiques
- **Commits :** 16+ (main branch)
- **Avancement MVP :** 100% ✅
- **Pages complètes :** 13/13
- **Composants créés :** 21+
- **Lignes de code :** ~9000+

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

#### 💼 Dashboard Recruteur
* ⏳ Tabs fonctionnels (switcher entre Stats/Sauvegardés/Contactés)
* ⏳ Actions sur talents (retirer des sauvegardés, contacter)
* ⏳ Filtres et recherche

#### 🔍 Discover/Search
* ✅ Filtres catégories et villes
* ⏳ Search en temps réel (recherche globale fonctionnelle)
* ⏳ Tabs search (switcher entre Talents/Posts/Utilisateurs)

#### ⚙️ Settings
* ⏳ Toggle notifications (switches fonctionnels)
* ⏳ Changer mot de passe (formulaire)
* ⏳ Changer email/phone (formulaire)

#### ✨ Micro-interactions
* ⏳ Notifications badge (compteur sur icône notifs)
* ⏳ Pull to refresh sur mobile

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