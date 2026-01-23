# Guide de dépannage - Erreurs 404 Next.js

## Problème : Erreurs 404 sur les chunks Next.js

Si vous rencontrez des erreurs comme :
```
GET http://localhost:3000/_next/static/chunks/main-app.js?v=... net::ERR_ABORTED 404 (Not Found)
GET http://localhost:3000/_next/static/chunks/app-pages-internals.js net::ERR_ABORTED 404 (Not Found)
```

## Solutions

### 1. Nettoyer le cache Next.js

```bash
cd samaquete-admin
rm -rf .next
rm -rf node_modules/.cache
```

### 2. Redémarrer le serveur de développement

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

### 3. Vérifier que le port 3000 est libre

```bash
# Sur macOS/Linux
lsof -ti:3000 | xargs kill -9

# Puis redémarrer
npm run dev
```

### 4. Réinstaller les dépendances (si nécessaire)

```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### 5. Vider le cache du navigateur

- Chrome/Edge : Ctrl+Shift+Delete (ou Cmd+Shift+Delete sur Mac)
- Firefox : Ctrl+Shift+Delete (ou Cmd+Shift+Delete sur Mac)
- Ou utiliser le mode navigation privée pour tester

### 6. Vérifier les erreurs de build

```bash
npm run build
```

Si des erreurs apparaissent, les corriger avant de relancer `npm run dev`.

## Erreur "Could not establish connection"

Cette erreur provient généralement d'extensions de navigateur (comme des extensions de développement) qui tentent de communiquer avec les iframes. Elle est filtrée par `ErrorFilterScript` et peut être ignorée en toute sécurité.

## Si le problème persiste

1. Vérifier que vous êtes dans le bon répertoire : `samaquete-admin`
2. Vérifier que Node.js est à jour : `node --version` (doit être >= 18)
3. Vérifier les logs du serveur pour d'autres erreurs
4. Essayer avec un autre navigateur
