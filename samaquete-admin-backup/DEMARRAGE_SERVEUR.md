# 🚀 Guide de Démarrage du Serveur

## ⚠️ Problème de Permissions (EPERM)

Si vous rencontrez l'erreur `EPERM: operation not permitted` lors du démarrage du serveur, voici les solutions :

### Solution 1: Lancer manuellement dans votre terminal

Ouvrez un terminal et exécutez :

```bash
cd samaquete-admin
npm run dev
```

Si le port 3000 est occupé, utilisez un autre port :

```bash
PORT=3001 npm run dev
```

### Solution 2: Vérifier les processus existants

Si le port 3000 est occupé, trouvez et arrêtez le processus :

```bash
# Trouver le processus
lsof -ti:3000

# Arrêter le processus (remplacer PID par le numéro trouvé)
kill -9 PID
```

### Solution 3: Utiliser localhost au lieu de 0.0.0.0

Modifiez le fichier `package.json` pour forcer l'utilisation de localhost :

```json
{
  "scripts": {
    "dev": "next dev -H localhost"
  }
}
```

### Solution 4: Vérifier les paramètres de sécurité macOS

1. **Système > Confidentialité et sécurité > Accès complet au disque**
   - Vérifier que votre terminal/éditeur a les permissions nécessaires

2. **Système > Réseau > Pare-feu**
   - Vérifier que le pare-feu n'bloque pas Node.js

### Solution 5: Utiliser un port différent de manière permanente

Créez un fichier `.env.local` dans `samaquete-admin/` :

```bash
PORT=3001
```

Puis lancez :

```bash
npm run dev
```

---

## ✅ Démarrage Normal

Une fois le serveur démarré, vous devriez voir :

```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

Accédez à l'application sur : **http://localhost:3000** (ou le port configuré)

---

## 🔐 Comptes de Test

Une fois le serveur démarré, vous pouvez tester avec :

### Super Admin
- **Email:** `admin@admin.com`
- **Mot de passe:** `admin123`
- **URL:** `http://localhost:3000/login`

### Admin Diocèse
- **Email:** `diocese@admin.com`
- **Mot de passe:** `diocese123`

### Admin Archidiocèse
- **Email:** `archdiocese.dakar@samaquete.sn`
- **Mot de passe:** `Admin123`

> **Note:** Ces comptes doivent être créés dans Firebase Console avant de pouvoir se connecter. Voir `COMPTES_TEST_RAPIDE.md` pour les instructions détaillées.

---

## 🐛 Dépannage

### Erreur "Element type is invalid"

Si vous voyez cette erreur :

1. **Nettoyer le cache Next.js :**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Réinstaller les dépendances :**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

### Erreur de connexion Firebase

Vérifiez que :
- Le fichier `.env.local` contient les bonnes clés Firebase
- Les règles Firestore sont déployées
- Les collections nécessaires existent dans Firestore

---

## 📝 Notes

- Le serveur se recharge automatiquement lors des modifications de code (Hot Reload)
- Les erreurs de compilation apparaissent dans le terminal et dans le navigateur
- Utilisez `Ctrl+C` pour arrêter le serveur
