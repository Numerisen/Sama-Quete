# 💳 Guide d'Intégration de l'API de Paiement

## 📋 Options d'Intégration

### Option 1 : Cloner dans `services/` (Recommandé) ✅

**Avantages :**
- ✅ Simple et direct
- ✅ Tout dans le même dépôt
- ✅ Facile à maintenir
- ✅ Cohérent avec la structure monorepo

**Commandes :**
```bash
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete
cd services
git clone <URL_DU_REPO_PAIEMENT> payment-api
cd payment-api
# Installer les dépendances si nécessaire
npm install  # ou yarn install, ou pip install -r requirements.txt selon le langage
```

### Option 2 : Git Submodule

**Avantages :**
- ✅ Conserve l'historique Git
- ✅ Peut être mis à jour indépendamment

**Commandes :**
```bash
cd /Users/cheikhahmadoubambakebe/Desktop/Samaquete-RECLONE/Sama-Quete
git submodule add <URL_DU_REPO_PAIEMENT> services/payment-api
git submodule update --init --recursive
```

**Pour mettre à jour :**
```bash
git submodule update --remote services/payment-api
```

### Option 3 : Package npm privé

**Avantages :**
- ✅ Réutilisable
- ✅ Versioning indépendant

**Configuration :**
1. Publier l'API comme package npm privé
2. Configurer `.npmrc` avec le token d'accès
3. Installer via `npm install @numerisen/payment-api`

## 🚀 Intégration dans le Projet

### Structure Recommandée

```
Sama-Quete/
├── services/
│   └── payment-api/          # API de paiement clonée
│       ├── src/
│       ├── package.json
│       └── README.md
├── samaquete-admin/
│   └── lib/
│       └── payment-service.ts  # Service client pour l'API
└── samaquete-mobile/
    └── lib/
        └── payment-service.ts  # Service client pour l'API mobile
```

### Étapes d'Intégration

1. **Cloner le repo de paiement**
   ```bash
   cd services
   git clone <URL_DU_REPO> payment-api
   ```

2. **Créer les services clients**
   - `samaquete-admin/lib/payment-service.ts`
   - `samaquete-mobile/lib/payment-service.ts`

3. **Configurer les variables d'environnement**
   - Ajouter les clés API dans `.env`
   - Configurer les URLs de l'API

4. **Intégrer dans les composants**
   - Modifier `PaymentScreen.tsx` dans mobile
   - Créer les pages de paiement dans admin

## 📝 Configuration

### Variables d'Environnement

Ajouter dans `.env` ou `.env.local` :

```env
# API de Paiement
PAYMENT_API_URL=http://localhost:3001
PAYMENT_API_KEY=your_api_key_here
PAYMENT_WEBHOOK_SECRET=your_webhook_secret

# Pour production
PAYMENT_API_URL_PROD=https://api-paiement.numerisen.com
```

### Scripts dans package.json racine

```json
{
  "scripts": {
    "dev:payment": "cd services/payment-api && npm run dev",
    "build:payment": "cd services/payment-api && npm run build",
    "start:payment": "cd services/payment-api && npm start"
  }
}
```

## 🔗 Intégration avec les Services Existants

### Dans samaquete-admin

Créer `samaquete-admin/lib/payment-service.ts` qui appelle l'API de paiement.

### Dans samaquete-mobile

Modifier `src/components/screens/donations/PaymentScreen.tsx` pour utiliser l'API.

## 📚 Documentation

Une fois l'API clonée, documenter :
- Les endpoints disponibles
- Les formats de requêtes/réponses
- Les webhooks
- Les méthodes de paiement supportées (Wave, Orange Money, Carte bancaire)

