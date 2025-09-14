# 🚀 Guide de Setup - SamaQuête

## 📋 Checklist de Démarrage

### 1. Prérequis
- [ ] Node.js 18+ installé
- [ ] Git installé
- [ ] Compte GitHub
- [ ] Expo Go sur votre téléphone

### 2. Cloner le Projet
```bash
git clone [URL_DU_REPO_PRIVE]
cd Sama-Quete
```

### 3. Panel d'Administration
```bash
cd samaquete-admin
npm install
npm run dev
```
➡️ **Ouvrir**: http://localhost:3000

### 4. Application Mobile
```bash
cd samaquete-mobile
npm install
npx expo start
```
➡️ **Scanner le QR** avec Expo Go

## 🔑 Connexion Firebase

### ✅ Configuration Automatique
Les clés Firebase sont **déjà configurées** dans le projet :
- `samaquete-admin/lib/firebase.ts`
- `samaquete-mobile/lib/firebase.ts`

### 🔐 Comptes de Test
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | `admin@admin.com` | `admin123` |
| Admin Diocèse | `diocese@diocese.com` | `diocese123` |

## 🗄️ Initialisation des Données

### Créer les Profils Utilisateurs
```bash
cd samaquete-admin
node lib/create-profiles.js
```

### Initialiser les Diocèses
```bash
node lib/init-dioceses.js
```

### Créer des Données de Test
```bash
node lib/init-donation-data.js
```

## 🧪 Tests de Connexion

### Vérifier Firebase Admin
```bash
cd samaquete-admin
node lib/test-firebase-data.js
```

### Vérifier Firebase Mobile
```bash
cd samaquete-mobile
node lib/test-mobile-parishes.js
```

## 📱 Utilisation

### Panel d'Administration
1. **Connexion**: Utilisez les comptes de test
2. **Dashboard**: Vue d'ensemble des statistiques
3. **Paroisses**: Créer et gérer les paroisses
4. **Diocèses**: Gérer les diocèses
5. **Dons**: Créer des événements de dons
6. **Utilisateurs**: Gérer les comptes

### Application Mobile
1. **Lancement**: Scanner le QR code avec Expo Go
2. **Sélection**: Choisir une paroisse
3. **Dons**: Faire des dons via l'interface
4. **Actualités**: Consulter les nouvelles
5. **Liturgie**: Voir le calendrier

## 🚨 Problèmes Courants

### Erreur "Module not found"
```bash
# Réinstaller les dépendances
rm -rf node_modules
npm install
```

### Erreur Firebase Index
- Les liens d'erreur dans la console créent automatiquement les index
- Ou utilisez les requêtes sans `orderBy` (déjà implémenté)

### Expo ne se lance pas
```bash
# Nettoyer le cache
npx expo start --clear
```

### Port déjà utilisé
```bash
# Tuer les processus
pkill -f "expo start"
pkill -f "next dev"
```

## 📊 Structure des Données

### Collections Firebase
- `users` - Utilisateurs et rôles
- `dioceses` - Diocèses
- `parishes` - Paroisses
- `donationEvents` - Événements de dons
- `donations` - Dons individuels
- `news` - Actualités
- `liturgy` - Calendrier liturgique
- `notifications` - Notifications

### Relations
```
Diocèse (1) → Paroisses (N)
Paroisse (1) → Événements de dons (N)
Événement (1) → Dons (N)
```

## 🎯 Workflow de Développement

### 1. Développement Local
```bash
# Terminal 1 - Admin
cd samaquete-admin
npm run dev

# Terminal 2 - Mobile
cd samaquete-mobile
npx expo start
```

### 2. Tests
- Utilisez les scripts de test fournis
- Vérifiez les logs dans la console
- Testez sur mobile avec Expo Go

### 3. Déploiement
- Admin: `npm run build` puis déployer
- Mobile: `npx expo build` pour les stores

## 📞 Support

### En cas de problème :
1. Vérifiez cette documentation
2. Consultez les logs dans la console
3. Utilisez les scripts de test
4. Vérifiez la connexion Firebase

### Logs utiles :
- Console du navigateur (Admin)
- Metro bundler (Mobile)
- Firebase Console

---

**🎉 Vous êtes prêt à développer !**