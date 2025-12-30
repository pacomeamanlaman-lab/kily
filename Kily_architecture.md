# Architecture Kily (anciennement NeighborNet)

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

### 7.1 Phase 1 - MVP (Prioritaire)
**Objectif : Lancement rapide avec fonctionnalités essentielles**

#### Features
* ✅ Landing page avec animations (style stars2babi)
* ✅ Auth basique (email uniquement)
* ✅ Profils talents (avatar, bio, compétences)
* ✅ Système de réputation simple (score + badges)
* ✅ Découverte de talents (grille + filtres basiques)
* ✅ Navigation bottom mobile
* ✅ Dark mode uniquement
* ✅ Données mockées (pas de Supabase encore)

#### Pages MVP
1. Landing page (/)
2. Feed découverte (/discover)
3. Profil talent (/profile/[id])
4. Page d'inscription (/register)

#### Composants MVP
* BottomNav
* TalentCard
* SkillBadge
* ReputationScore
* Button, Card, Modal (UI basiques)

---

### 7.2 Phase 2 - Backend & Interactions
**Objectif : Connexion backend + interactions utilisateurs**

#### Features
* ✅ Setup Supabase complet
* ✅ Auth complète (email + phone + OAuth)
* ✅ Chat temps réel
* ✅ Dashboard recruteur
* ✅ Filtres avancés (localisation, catégories)
* ✅ Toggle Light/Dark mode

#### Nouvelles pages
* Messages (/messages)
* Dashboard recruteur (/recruiter/dashboard)
* Settings (/settings)

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