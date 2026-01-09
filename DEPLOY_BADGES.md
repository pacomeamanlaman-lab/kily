# 🎖️ Guide de Déploiement - Système de Badges

## 📋 Prérequis

- Accès au Supabase Dashboard
- Droits d'administration sur la base de données

## 🚀 Étapes de Déploiement

### Étape 1 : Créer les Tables

1. Allez dans votre [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Cliquez sur **New Query**
5. Copiez-colle le contenu du fichier `supabase/14_badges_tables.sql`
6. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

### Étape 2 : Vérifier la Création

Après l'exécution, vous devriez voir :
- ✅ Table `badges` créée avec 6 badges par défaut
- ✅ Table `user_badges` créée
- ✅ Index créés
- ✅ RLS Policies configurées

### Étape 3 : Vérifier les Données

Exécutez cette requête pour vérifier :

```sql
-- Vérifier les badges créés
SELECT id, name, description FROM public.badges;

-- Vérifier que user_badges est vide (normal au début)
SELECT COUNT(*) as total_attributions FROM public.user_badges;
```

## 📊 Résultat Attendu

Après l'exécution :
- **6 badges** seront créés dans la table `badges`
- La table `user_badges` sera vide (0 attributions)
- Dans l'interface admin, tous les badges afficheront **0 talents** (normal, aucune attribution)

## 🎯 Utilisation

Une fois les tables créées :
1. Les badges s'afficheront dans la page **Reputation** du super admin
2. Vous pourrez créer/modifier/supprimer des badges via l'interface
3. Vous pourrez attribuer des badges aux utilisateurs (fonctionnalité à venir)

## ⚠️ Notes Importantes

- Les badges par défaut sont insérés avec `ON CONFLICT DO NOTHING`, donc vous pouvez exécuter le script plusieurs fois sans problème
- Les RLS Policies permettent à tous de lire les badges, mais seuls les admins peuvent les modifier
- La table `user_badges` sera vide au début, c'est normal


