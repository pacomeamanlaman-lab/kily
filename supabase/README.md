# Scripts SQL Supabase - Kily

Ce dossier contient tous les scripts SQL pour créer la base de données Supabase de Kily.

## 📋 Ordre d'exécution

Exécute les scripts **dans l'ordre** suivant dans le SQL Editor de Supabase :

1. **01_users_table.sql** - Table des utilisateurs (talents, voisins, recruteurs)
2. **02_skills_table.sql** - Compétences des utilisateurs
3. **03_portfolio_items_table.sql** - Éléments du portfolio
4. **04_posts_table.sql** - Publications et likes des posts
5. **05_comments_table.sql** - Commentaires sur les posts
6. **06_videos_table.sql** - Vidéos et likes des vidéos
7. **07_stories_table.sql** - Stories éphémères (24h) et vues
8. **08_messaging_tables.sql** - Conversations et messages privés
9. **09_relations_tables.sql** - Follows et talents sauvegardés
10. **10_reviews_table.sql** - Avis et évaluations
11. **11_admin_system.sql** - Système d'administration (ajoute is_admin et fonctions admin)

## 🏗️ Structure de la base de données

### Tables principales

- **users** - Utilisateurs (talents, voisins, recruteurs)
- **skills** - Compétences des talents
- **portfolio_items** - Portfolio (images/vidéos des travaux)
- **posts** - Publications dans le feed social
- **post_likes** - Likes sur les posts
- **comments** - Commentaires sur les posts
- **videos** - Vidéos partagées
- **video_likes** - Likes sur les vidéos
- **stories** - Stories éphémères (24h)
- **story_views** - Vues des stories
- **conversations** - Conversations privées
- **messages** - Messages privés
- **follows** - Relations de suivi (followers/following)
- **saved_talents** - Talents sauvegardés par les recruteurs
- **reviews** - Avis et évaluations

## 🔐 Sécurité (Row Level Security)

Tous les scripts incluent :
- **RLS activé** sur toutes les tables
- **Politiques de sécurité** appropriées pour chaque table
- **Authentification Supabase** intégrée avec `auth.uid()`

## 🚀 Fonctionnalités automatiques

Les scripts incluent :
- **Triggers** pour mettre à jour automatiquement les compteurs (likes, comments, rating)
- **Indexes** pour optimiser les performances
- **Contraintes** pour garantir l'intégrité des données
- **Fonction** pour supprimer automatiquement les stories expirées

## 📝 Notes importantes

1. **Variables d'environnement** : Configure d'abord `.env.local` avec tes clés Supabase
2. **Ordre d'exécution** : Respecte l'ordre des scripts (dépendances entre tables)
3. **Row Level Security** : Les politiques RLS protègent les données sensibles
4. **Stories expirées** : Configure un cron job pour exécuter `delete_expired_stories()` toutes les heures

## 🔄 Prochaines étapes

Après avoir exécuté tous les scripts :
1. Migrer le code localStorage vers Supabase
2. Implémenter l'authentification Supabase
3. Créer les services API pour chaque table
4. Tester les politiques RLS
