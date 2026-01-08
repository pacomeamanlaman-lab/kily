# 🎖️ Guide de Déploiement - Automatisation des Badges

## 📋 Prérequis

- ✅ La table `badges` doit exister (exécuter `supabase/14_badges_tables.sql` d'abord)
- ✅ La table `user_badges` doit exister
- ✅ La table `users` doit avoir les colonnes `rating`, `review_count`, `completed_projects`
- ✅ La table `reviews` doit exister (pour le trigger de mise à jour des ratings)

## 🚀 Étapes de Déploiement

### Étape 1 : Vérifier les prérequis

1. Allez dans votre [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Vérifiez que les tables existent :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('badges', 'user_badges', 'users', 'reviews');
```

### Étape 2 : Exécuter le script d'automatisation

1. Dans **SQL Editor**, cliquez sur **New Query**
2. Ouvrez le fichier `supabase/17_auto_badges.sql`
3. Copiez-colle tout le contenu dans l'éditeur SQL
4. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

### Étape 3 : Vérifier l'installation

Après l'exécution, vérifiez que :

```sql
-- Vérifier que la colonne is_automatic existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'badges' AND column_name = 'is_automatic';

-- Vérifier que les fonctions existent
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_and_assign_badges', 'check_all_talents_badges', 'assign_badges_to_user');

-- Vérifier que le trigger existe
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'check_badges_after_rating_update';
```

### Étape 4 : Initialiser les badges pour les talents existants (Recommandé)

Pour attribuer automatiquement les badges aux talents qui remplissent déjà les critères :

```sql
-- Exécuter pour tous les talents existants
SELECT public.check_all_talents_badges();
```

## 🔄 Fonctionnement Automatique

### Déclencheurs automatiques

Le système s'active automatiquement dans ces cas :

1. **Après chaque avis** : Le trigger `user_rating_trigger` met à jour `rating` et `review_count`, ce qui déclenche `check_badges_after_rating_update`
2. **Après mise à jour de projets** : Si `completed_projects` est mis à jour, les badges sont recalculés
3. **En temps réel** : Dès qu'un critère est rempli, le badge est attribué automatiquement

### Badges automatiques

Les badges suivants sont attribués automatiquement :

| Badge | Critères |
|-------|----------|
| **Top Talent** | Rating ≥ 4.8/5 ET 30+ avis |
| **Expert** | 50+ projets complétés ET Rating ≥ 4.5/5 |
| **Professionnel** | Rating ≥ 4.5/5 ET 20+ avis |
| **Rising Star** | Inscrit < 3 mois ET Rating ≥ 4.5/5 ET 10+ avis |
| **Excellence** | Rating ≥ 4.9/5 ET 50+ avis |
| **Fiable** | 20+ projets complétés ET Rating ≥ 4.5/5 |
| **Communication Parfaite** | Rating ≥ 4.8/5 ET 20+ avis |
| **Talent Confirmé** | 100+ projets OU 50+ avis |
| **Membre Actif** | 20+ projets complétés |
| **Spécialiste** | 30+ projets ET Rating ≥ 4.5/5 |
| **Talent Multidisciplinaire** | 50+ projets complétés |

### Badges manuels

Ces badges restent manuels (attribués par un admin) :

- **Talent Vérifié** : Vérification d'identité
- **Compte Premium** : Géré par le système de paiement
- **Talent de l'Année** : Sélection manuelle

## 🛠️ Utilisation Manuelle

### Attribuer les badges à un utilisateur spécifique

```sql
-- Depuis SQL
SELECT public.assign_badges_to_user('user-uuid-here');

-- Depuis le frontend/backend (via Supabase client)
const { data, error } = await supabase.rpc('assign_badges_to_user', {
  p_user_id: 'user-uuid-here'
});
```

### Vérifier tous les talents

```sql
-- Exécuter pour tous les talents
SELECT public.check_all_talents_badges();
```

## 📊 Monitoring

### Voir les badges attribués automatiquement

```sql
-- Compter les badges automatiques attribués
SELECT 
  b.name,
  COUNT(ub.id) as total_attributions
FROM public.badges b
LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
WHERE b.is_automatic = TRUE
GROUP BY b.name
ORDER BY total_attributions DESC;
```

### Voir les talents avec leurs badges

```sql
-- Voir les talents et leurs badges automatiques
SELECT 
  u.first_name || ' ' || u.last_name as talent_name,
  u.rating,
  u.review_count,
  u.completed_projects,
  array_agg(b.name) as badges
FROM public.users u
LEFT JOIN public.user_badges ub ON u.id = ub.user_id
LEFT JOIN public.badges b ON ub.badge_id = b.id AND b.is_automatic = TRUE
WHERE u.user_type = 'talent'
GROUP BY u.id, u.first_name, u.last_name, u.rating, u.review_count, u.completed_projects
ORDER BY u.rating DESC;
```

## ⚙️ Configuration

### Modifier les critères d'un badge

Pour modifier les critères, éditez la fonction `check_and_assign_badges` dans le script SQL.

### Ajouter un nouveau badge automatique

1. Créez le badge dans l'interface admin ou via SQL
2. Marquez-le comme automatique : `UPDATE badges SET is_automatic = TRUE WHERE name = 'Nouveau Badge'`
3. Ajoutez la logique dans la fonction `check_and_assign_badges`

### Désactiver l'automatisation pour un badge

```sql
UPDATE public.badges 
SET is_automatic = FALSE 
WHERE name = 'Nom du Badge';
```

## 🔍 Dépannage

### Les badges ne s'attribuent pas automatiquement

1. Vérifiez que le trigger existe :
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'check_badges_after_rating_update';
   ```

2. Vérifiez que les fonctions existent :
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'check_and_assign_badges';
   ```

3. Testez manuellement :
   ```sql
   SELECT public.assign_badges_to_user('user-uuid-here');
   ```

### Les badges ne sont pas retirés quand les critères ne sont plus remplis

Le système retire automatiquement les badges si les critères ne sont plus remplis. Vérifiez que le trigger fonctionne en mettant à jour manuellement un utilisateur :

```sql
-- Tester en mettant à jour un utilisateur
UPDATE public.users 
SET rating = 4.0 
WHERE id = 'user-uuid-here';
-- Le trigger devrait se déclencher et retirer les badges si nécessaire
```

## ✅ Résultat Attendu

Après le déploiement :

- ✅ Les badges sont attribués automatiquement quand les critères sont remplis
- ✅ Les badges sont retirés automatiquement si les critères ne sont plus remplis
- ✅ Le système fonctionne en temps réel après chaque avis/projet
- ✅ Les admins peuvent toujours attribuer manuellement les badges non-automatiques

---

**🎯 Note** : Les critères pour certains badges (Fiable, Spécialiste, Talent Multidisciplinaire) utilisent des proxies basés sur `completed_projects` car il n'y a pas encore de table de projets détaillée. Quand cette table sera créée, vous pourrez affiner ces critères.

