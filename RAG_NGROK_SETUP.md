# 🔧 Configuration Ngrok pour le RAG

## Problème Actuel

L'URL ngrok dans `.env` est **offline** (`ERR_NGROK_3200`). L'app mobile ne peut pas se connecter au RAG.

## Solution : Redémarrer Ngrok

### 1. Démarrer Ngrok

```bash
# Dans un terminal séparé
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete
ngrok http 8000
```

### 2. Copier la Nouvelle URL

Ngrok affichera quelque chose comme :
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:8000
```

### 3. Mettre à Jour le .env

```bash
cd samaquete-mobile
# Éditer .env et remplacer l'ancienne URL ngrok par la nouvelle
EXPO_PUBLIC_ASSISTANT_API_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app
```

### 4. Redémarrer l'App Mobile

```bash
# Dans le terminal de l'app mobile
npm start
# Puis appuyer sur 'r' pour recharger
```

## Alternative : Utiliser localhost (Simulateur iOS/Android uniquement)

Si vous testez sur un **simulateur iOS** ou **émulateur Android**, vous pouvez utiliser `localhost` :

```bash
# Dans samaquete-mobile/.env
EXPO_PUBLIC_ASSISTANT_API_URL=http://localhost:8000
```

⚠️ **Note** : `localhost` ne fonctionne **PAS** sur un appareil physique. Utilisez ngrok pour les appareils réels.

## Vérifier que ça Fonctionne

### 1. Tester l'URL ngrok

```bash
curl https://VOTRE-URL-NGROK.ngrok-free.app/api/v1/chatbot/health
```

Devrait retourner :
```json
{"status":"healthy","initialized":true,...}
```

### 2. Tester depuis l'App

1. Ouvrir l'app mobile
2. Aller dans l'Assistant Spirituel
3. Poser une question
4. Vérifier les logs dans le terminal Expo pour voir les erreurs détaillées

## Dépannage

### Ngrok se ferme automatiquement

Ngrok free a une limite de temps. Solutions :
- Utiliser ngrok avec un compte (gratuit) : `ngrok config add-authtoken YOUR_TOKEN`
- Utiliser un service alternatif (localtunnel, serveo, etc.)

### Erreur "ERR_NGROK_3200"

Cela signifie que le tunnel ngrok n'est plus actif. Redémarrez ngrok.

### L'app ne se connecte toujours pas

1. Vérifier que le RAG tourne : `docker-compose ps` dans `rag-system/`
2. Vérifier l'URL dans `.env` : `cat samaquete-mobile/.env | grep ASSISTANT`
3. Vérifier les logs Expo pour voir les erreurs détaillées
4. Tester l'URL manuellement avec `curl`

## Améliorations Apportées

✅ **Gestion d'erreur améliorée** : L'app affiche maintenant des messages d'erreur plus détaillés
✅ **Logs détaillés** : Les erreurs sont loggées avec l'URL et le statut HTTP
✅ **Détection ngrok** : L'app détecte si ngrok est offline et affiche un message approprié

