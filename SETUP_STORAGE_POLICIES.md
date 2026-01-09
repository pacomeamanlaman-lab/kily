# Configuration des politiques RLS pour le bucket Storage "photos"

## Problème
L'erreur "must be owner of relation objects" se produit car `storage.objects` est une table système qui nécessite des permissions spéciales pour créer des politiques via SQL.

## Solution : Créer les politiques via le Dashboard Supabase

### Étape 1 : Accéder aux politiques du bucket
1. Allez dans votre dashboard Supabase
2. Cliquez sur **Storage** dans le menu de gauche
3. Cliquez sur le bucket **"photos"**
4. Allez dans l'onglet **"Policies"**

### Étape 2 : Créer la politique de lecture (SELECT)

1. Cliquez sur **"New Policy"**
2. Choisissez **"Create a policy from scratch"**
3. Configurez :
   - **Policy name**: `Tout le monde peut lire les photos publiques`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public` (ou laissez vide pour tous)
   - **USING expression**: 
     ```sql
     bucket_id = 'photos'
     ```
4. Cliquez sur **"Review"** puis **"Save policy"**

### Étape 3 : Créer la politique d'upload (INSERT)

1. Cliquez sur **"New Policy"**
2. Choisissez **"Create a policy from scratch"**
3. Configurez :
   - **Policy name**: `Les utilisateurs authentifiés peuvent uploader leurs propres photos`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'photos' 
     AND (
       (storage.foldername(name))[1] = 'avatar' AND (storage.foldername(name))[2] = auth.uid()::text
       OR
       (storage.foldername(name))[1] = 'cover' AND (storage.foldername(name))[2] = auth.uid()::text
       OR
       (storage.foldername(name))[1] = 'portfolio' AND (storage.foldername(name))[2] = auth.uid()::text
     )
     ```
4. Cliquez sur **"Review"** puis **"Save policy"**

### Étape 4 : Créer la politique de mise à jour (UPDATE)

1. Cliquez sur **"New Policy"**
2. Choisissez **"Create a policy from scratch"**
3. Configurez :
   - **Policy name**: `Les utilisateurs authentifiés peuvent mettre à jour leurs propres photos`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated`
   - **USING expression**:
     ```sql
     bucket_id = 'photos' 
     AND (
       (storage.foldername(name))[1] = 'avatar' AND (storage.foldername(name))[2] = auth.uid()::text
       OR
       (storage.foldername(name))[1] = 'cover' AND (storage.foldername(name))[2] = auth.uid()::text
       OR
       (storage.foldername(name))[1] = 'portfolio' AND (storage.foldername(name))[2] = auth.uid()::text
     )
     ```
4. Cliquez sur **"Review"** puis **"Save policy"**

### Étape 5 : Créer la politique de suppression (DELETE)

1. Cliquez sur **"New Policy"**
2. Choisissez **"Create a policy from scratch"**
3. Configurez :
   - **Policy name**: `Les utilisateurs authentifiés peuvent supprimer leurs propres photos`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **USING expression**:
     ```sql
     bucket_id = 'photos' 
     AND (
       (storage.foldername(name))[1] = 'avatar' AND (storage.foldername(name))[2] = auth.uid()::text
       OR
       (storage.foldername(name))[1] = 'cover' AND (storage.foldername(name))[2] = auth.uid()::text
       OR
       (storage.foldername(name))[1] = 'portfolio' AND (storage.foldername(name))[2] = auth.uid()::text
     )
     ```
4. Cliquez sur **"Review"** puis **"Save policy"**

## Vérification

Après avoir créé toutes les politiques, testez l'upload d'une photo. L'erreur RLS devrait être résolue.

## Structure des fichiers

Les fichiers doivent être organisés ainsi dans le bucket :
```
photos/
  ├── avatar/
  │   └── {userId}/
  │       └── {timestamp}-{random}.jpg
  ├── cover/
  │   └── {userId}/
  │       └── {timestamp}-{random}.jpg
  └── portfolio/
      └── {userId}/
          └── {timestamp}-{random}.jpg
```

Le code dans `storage.service.ts` génère automatiquement cette structure.

