# 🎖️ Guide de Déploiement - Badges Prédéfinis

## 📋 Prérequis

- ✅ La table `badges` doit déjà exister (exécuter `supabase/14_badges_tables.sql` d'abord)
- Accès au Supabase Dashboard
- Droits d'administration sur la base de données

## 🚀 Étapes de Déploiement

### Étape 1 : Vérifier que la table badges existe

1. Allez dans votre [Supabase Dashboard](https://app.supabase.com/)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Exécutez cette requête pour vérifier :

```sql
SELECT COUNT(*) FROM public.badges;
```

Si vous obtenez une erreur, exécutez d'abord `supabase/14_badges_tables.sql`.

### Étape 2 : Insérer les badges prédéfinis

1. Dans **SQL Editor**, cliquez sur **New Query**
2. Ouvrez le fichier `supabase/16_default_badges.sql`
3. Copiez-colle tout le contenu dans l'éditeur SQL
4. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

### Étape 3 : Vérifier l'insertion

Après l'exécution, vous devriez voir :
- ✅ Un message de confirmation avec le nombre de badges insérés
- ✅ Une liste de tous les badges créés

## 📊 Badges Inclus

Le script crée **14 badges prédéfinis** répartis en plusieurs catégories :

### 🟢 Badges de Vérification et Statut (2)
- **Talent Vérifié** : Identité vérifiée
- **Compte Premium** : Abonnement premium actif

### 🟡 Badges de Performance (4)
- **Top Talent** : Top 10% des talents
- **Expert** : 50+ projets complétés
- **Professionnel** : Note ≥ 4.5/5 avec 20+ avis
- **Talent de l'Année** : Meilleur talent de l'année

### 🔵 Badges de Progression (3)
- **Rising Star** : Nouveau talent prometteur
- **Talent Confirmé** : 100+ projets ou 50+ avis
- **Membre Actif** : 20+ projets dans les 6 derniers mois

### 🟣 Badges Spécialisés (2)
- **Spécialiste** : Expert dans une catégorie
- **Talent Multidisciplinaire** : Compétent dans 5+ domaines

### 🟠 Badges de Qualité (3)
- **Excellence** : Note ≥ 4.9/5 avec 50+ avis
- **Fiable** : 95%+ de projets livrés à temps
- **Communication Parfaite** : Note communication ≥ 4.8/5

## 🎨 Icônes et Couleurs

Chaque badge utilise une icône et une couleur spécifique :

| Icône | Nom | Couleur |
|-------|-----|---------|
| CheckCircle | ✓ | Vert (#10b981) |
| Crown | 👑 | Or (#f59e0b, #fbbf24) |
| Award | 🏆 | Violet (#8b5cf6) |
| Shield | 🛡️ | Cyan (#06b6d4) |
| Zap | ⚡ | Rose (#ec4899) |
| Star | ⭐ | Jaune/Or (#fbbf24, #f59e0b) |

## ⚠️ Notes Importantes

- **ON CONFLICT DO NOTHING** : Vous pouvez exécuter le script plusieurs fois sans créer de doublons
- Les badges existants ne seront **pas modifiés** si vous réexécutez le script
- Pour modifier un badge existant, utilisez l'interface admin ou une requête SQL UPDATE
- Les critères sont des **descriptions textuelles** - l'implémentation automatique nécessitera des triggers ou des fonctions

## 🔄 Réexécution

Si vous voulez réinitialiser tous les badges :

```sql
-- ⚠️ ATTENTION : Ceci supprimera TOUS les badges et leurs attributions
DELETE FROM public.user_badges;
DELETE FROM public.badges;

-- Puis réexécutez 16_default_badges.sql
```

## 📝 Personnalisation

Pour ajouter vos propres badges, vous pouvez :

1. **Via l'interface admin** : Page Réputation → Bouton "Nouveau Badge"
2. **Via SQL** : Insérez directement dans la table `badges`

```sql
INSERT INTO public.badges (name, description, icon, color, criteria)
VALUES (
  'Mon Badge',
  'Description du badge',
  'Star',  -- Nom de l'icône (CheckCircle, Crown, Award, Shield, Zap, Star)
  '#ff0000',  -- Code couleur hex
  'Critères d''attribution'
);
```

## ✅ Vérification Finale

Pour voir tous les badges créés :

```sql
SELECT 
  name,
  description,
  icon,
  color,
  criteria
FROM public.badges
ORDER BY name;
```

Pour compter les badges :

```sql
SELECT COUNT(*) as total_badges FROM public.badges;
```

---

**🎯 Résultat attendu** : 14 badges prédéfinis disponibles dans l'interface admin pour attribution aux talents.

