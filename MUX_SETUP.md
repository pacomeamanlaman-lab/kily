# Configuration Mux pour l'upload de vidéos

## 📋 Prérequis

1. Compte Mux créé sur [mux.com](https://www.mux.com)
2. Token ID (clé publique) - déjà fourni : `32lcjnsk8ngc760okbuc5dm13`
3. Token Secret (clé secrète) - à récupérer dans votre dashboard Mux

## 🔑 Récupérer vos clés Mux

1. Connectez-vous à votre dashboard Mux : [dashboard.mux.com](https://dashboard.mux.com)
2. Allez dans **Settings** → **API Access Tokens**
3. Vous verrez :
   - **Token ID** (clé publique) : `32lcjnsk8ngc760okbuc5dm13` ✅ (déjà fourni)
   - **Token Secret** (clé secrète) : à copier (commence souvent par `...`)

## ⚙️ Configuration des variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Mux Video
MUX_TOKEN_ID=32lcjnsk8ngc760okbuc5dm13
MUX_TOKEN_SECRET=votre_token_secret_ici
```

⚠️ **Important** : 
- Ne commitez JAMAIS le fichier `.env.local` (il est déjà dans `.gitignore`)
- Le Token Secret doit rester secret et ne jamais être exposé côté client

## 🚀 Fonctionnalités implémentées

### 1. Upload de vidéos
- Upload direct vers Mux via Direct Upload
- Barre de progression en temps réel
- Support des formats : MP4, MOV, AVI (max 100MB)

### 2. Traitement automatique
- Transcoding automatique par Mux
- Génération de thumbnails automatique
- Streaming adaptatif (HLS)

### 3. Stockage dans Supabase
- Les vidéos sont sauvegardées dans la table `videos`
- URL de streaming : `https://stream.mux.com/{playback_id}.m3u8`
- Thumbnail : `https://image.mux.com/{playback_id}/thumbnail.jpg`

## 📝 Structure des données

Les vidéos sont stockées dans Supabase avec :
- `video_url` : URL HLS de streaming Mux
- `thumbnail` : URL de la thumbnail générée par Mux
- `playback_id` : ID Mux pour le streaming (stocké dans l'URL)

## 🔄 Flow d'upload

1. **Création du Direct Upload** : L'API crée un upload URL sécurisé
2. **Upload de la vidéo** : Le client upload directement vers Mux
3. **Traitement Mux** : Mux encode et traite la vidéo (quelques secondes à quelques minutes)
4. **Récupération du playback_id** : Polling de l'API pour récupérer le playback_id
5. **Sauvegarde Supabase** : La vidéo est sauvegardée avec l'URL de streaming

## 🎬 Utilisation

Une fois configuré, les utilisateurs peuvent :
1. Aller sur le feed
2. Cliquer sur "Publier une vidéo"
3. Sélectionner une vidéo
4. Ajouter titre, description, catégorie
5. Cliquer sur "Publier"
6. La vidéo sera uploadée et traitée automatiquement

## 🐛 Dépannage

### Erreur "Mux credentials not configured"
- Vérifiez que `MUX_TOKEN_ID` et `MUX_TOKEN_SECRET` sont bien dans `.env.local`
- Redémarrez le serveur de développement après avoir ajouté les variables

### La vidéo ne s'affiche pas après upload
- Vérifiez que Mux a fini de traiter la vidéo (peut prendre quelques minutes)
- Vérifiez les logs de la console pour les erreurs

### Upload échoue
- Vérifiez la taille de la vidéo (max 100MB)
- Vérifiez le format (MP4, MOV, AVI recommandés)
- Vérifiez votre connexion internet

## 📚 Documentation Mux

- [Documentation Mux](https://docs.mux.com)
- [Direct Upload Guide](https://docs.mux.com/guides/video/upload-files-directly)
- [Playback Guide](https://docs.mux.com/guides/video/play-your-videos)

