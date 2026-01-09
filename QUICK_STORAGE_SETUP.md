# Configuration rapide des politiques Storage via le Dashboard

## ⚠️ Important
Vous ne pouvez pas créer ces politiques via SQL car `storage.objects` nécessite des permissions admin. Utilisez le dashboard Supabase.

## 🚀 Étapes rapides

### 1. Accéder au bucket
1. Ouvrez votre dashboard Supabase
2. Menu gauche → **Storage**
3. Cliquez sur le bucket **"photos"**
4. Cliquez sur l'onglet **"Policies"** en haut

### 2. Créer la politique INSERT (la plus importante)

1. Cliquez sur **"New Policy"**
2. Sélectionnez **"Create a policy from scratch"**
3. Remplissez :
   - **Policy name**: `Upload photos authentifiés`
   - **Allowed operation**: Sélectionnez **INSERT**
   - **Target roles**: Sélectionnez **authenticated**
   - **WITH CHECK expression**: Copiez-collez ceci :
   ```sql
   bucket_id = 'photos' 
   AND (
     (string_to_array(name, '/'))[1] = 'avatar' AND (string_to_array(name, '/'))[2] = auth.uid()::text
     OR
     (string_to_array(name, '/'))[1] = 'cover' AND (string_to_array(name, '/'))[2] = auth.uid()::text
     OR
     (string_to_array(name, '/'))[1] = 'portfolio' AND (string_to_array(name, '/'))[2] = auth.uid()::text
   )
   ```
4. Cliquez sur **"Review"** puis **"Save policy"**

### 3. Créer la politique SELECT (lecture publique)

1. Cliquez sur **"New Policy"**
2. Sélectionnez **"Create a policy from scratch"**
3. Remplissez :
   - **Policy name**: `Lecture publique photos`
   - **Allowed operation**: Sélectionnez **SELECT**
   - **Target roles**: Laissez vide (pour tous)
   - **USING expression**: 
   ```sql
   bucket_id = 'photos'
   ```
4. Cliquez sur **"Review"** puis **"Save policy"**

### 4. (Optionnel) Créer UPDATE et DELETE

Si vous voulez permettre la mise à jour et suppression :

**UPDATE Policy:**
- Operation: `UPDATE`
- Target: `authenticated`
- USING: (même expression que INSERT)

**DELETE Policy:**
- Operation: `DELETE`
- Target: `authenticated`
- USING: (même expression que INSERT)

## ✅ Test

Après avoir créé au minimum les politiques INSERT et SELECT, testez l'upload d'une photo. L'erreur RLS devrait être résolue !

## 📝 Note

Le code génère automatiquement les chemins dans ce format :
- `avatar/{userId}/timestamp-random.jpg`
- `cover/{userId}/timestamp-random.jpg`
- `portfolio/{userId}/timestamp-random.jpg`

Les politiques vérifient que le deuxième élément du chemin correspond à l'ID de l'utilisateur authentifié.

