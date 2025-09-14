# 🚀 Guide de Déploiement - SamaQuête

## 📋 Checklist de Déploiement

### ✅ Préparation
- [ ] Code testé localement
- [ ] Toutes les fonctionnalités validées
- [ ] Documentation à jour
- [ ] Scripts de test fonctionnels

### ✅ Configuration Firebase
- [ ] Projet Firebase configuré
- [ ] Règles de sécurité définies
- [ ] Index Firestore créés
- [ ] Comptes de test créés

### ✅ Applications
- [ ] Panel d'administration fonctionnel
- [ ] Application mobile fonctionnelle
- [ ] Connexion Firebase établie
- [ ] Données de test initialisées

## 🌐 Déploiement du Panel d'Administration

### Option 1: Vercel (Recommandé)
```bash
cd samaquete-admin
npm install -g vercel
vercel --prod
```

### Option 2: Netlify
```bash
cd samaquete-admin
npm run build
# Uploader le dossier 'out' sur Netlify
```

### Option 3: Serveur VPS
```bash
cd samaquete-admin
npm run build
npm install -g pm2
pm2 start npm --name "samaquete-admin" -- start
```

## 📱 Déploiement de l'Application Mobile

### Build Android
```bash
cd samaquete-mobile
npx expo build:android
```

### Build iOS
```bash
cd samaquete-mobile
npx expo build:ios
```

### Publication sur les Stores
1. **Google Play Store**:
   - Uploader l'APK généré
   - Remplir les informations de l'app
   - Soumettre pour révision

2. **Apple App Store**:
   - Uploader via Xcode ou Application Loader
   - Remplir les métadonnées
   - Soumettre pour révision

## 🔧 Configuration de Production

### Variables d'Environnement
```bash
# Panel d'Administration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_APP_ENVIRONMENT=production

# Application Mobile
# Les clés sont déjà configurées dans firebase.ts
```

### Règles Firestore de Production
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles plus strictes pour la production
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /dioceses/{dioceseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // ... autres règles
  }
}
```

## 📊 Monitoring et Maintenance

### Firebase Console
- **URL**: https://console.firebase.google.com/project/numerisen-14a03
- **Monitoring**: Utilisation, erreurs, performances
- **Analytics**: Statistiques d'utilisation
- **Crashlytics**: Rapports de crash

### Logs de Production
```bash
# Panel d'Administration (Vercel)
vercel logs

# Application Mobile (Expo)
expo logs
```

### Sauvegarde des Données
```bash
# Export Firestore
gcloud firestore export gs://your-backup-bucket

# Import Firestore
gcloud firestore import gs://your-backup-bucket
```

## 🔐 Sécurité

### Checklist de Sécurité
- [ ] Règles Firestore configurées
- [ ] Authentification activée
- [ ] HTTPS activé
- [ ] Clés API sécurisées
- [ ] Permissions utilisateurs définies

### Mise à Jour des Clés
```bash
# Générer de nouvelles clés si nécessaire
# Mettre à jour firebase.ts
# Redéployer les applications
```

## 📈 Performance

### Optimisations
- [ ] Images optimisées
- [ ] Code minifié
- [ ] Cache configuré
- [ ] CDN activé
- [ ] Lazy loading implémenté

### Monitoring
- [ ] Google Analytics
- [ ] Firebase Performance
- [ ] Sentry (erreurs)
- [ ] LogRocket (sessions)

## 🚨 Plan de Récupération

### En cas de Problème
1. **Restauration des Données**:
   ```bash
   gcloud firestore import gs://backup-bucket/backup-date
   ```

2. **Rollback de l'Application**:
   ```bash
   vercel rollback
   ```

3. **Restauration Mobile**:
   - Rebuild avec version précédente
   - Publication d'urgence

## 📞 Support Post-Déploiement

### Monitoring 24/7
- Firebase Console
- Vercel Dashboard
- Expo Dashboard
- Google Analytics

### Maintenance
- Mise à jour des dépendances
- Sauvegarde régulière
- Monitoring des performances
- Gestion des utilisateurs

---

**🎉 Votre application est prête pour la production !**