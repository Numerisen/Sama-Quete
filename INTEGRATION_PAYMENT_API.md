# 🔗 Guide d'Intégration Payment-API

## 📋 Vue d'ensemble

Ce document décrit l'intégration du submodule `payment-api` dans le projet Sama-Quete. L'architecture respecte le principe d'isolation : **le submodule payment-api n'est jamais modifié directement**. Toute adaptation se fait via une couche d'intégration interne.

## 🏗️ Architecture

```
Sama-Quete/
├── payment-api/              # Submodule Git (NE JAMAIS MODIFIER)
│   └── src/
│       └── app/api/          # APIs PayDunya
├── samaquete-admin/
│   └── lib/
│       └── payment-service.ts # Couche d'intégration admin
├── samaquete-mobile/
│   └── lib/
│       └── payment-service.ts # Couche d'intégration mobile
└── services/                 # (Optionnel) Services partagés
```

## 🔐 Principe d'Isolation

### ✅ Ce qui est autorisé

- Utiliser les APIs du submodule via HTTP
- Créer des wrappers dans `lib/payment-service.ts`
- Adapter les données entre Sama-Quete et payment-api
- Configurer via variables d'environnement

### ❌ Ce qui est interdit

- Modifier directement les fichiers dans `payment-api/`
- Copier-coller le code du submodule ailleurs
- Hardcoder des secrets dans le code
- Créer des dépendances directes vers le code source du submodule

## 🚀 Installation

### 1. Initialiser les submodules

```bash
# Initialiser et cloner les submodules
./scripts/init-submodules.sh

# Ou manuellement:
git submodule init
git submodule update --recursive
```

### 2. Installer les dépendances

```bash
# Installer les dépendances du submodule payment-api
cd payment-api
npm install
cd ..

# Installer les dépendances de l'admin
cd samaquete-admin
npm install
cd ..
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer .env et remplir les valeurs
# - Firebase credentials
# - PayDunya keys
# - Database URL
```

## 📡 Utilisation de l'API de Paiement

### Dans l'application Admin

```typescript
import { paymentService } from '@/lib/payment-service';

// Vérifier les entitlements
const entitlements = await paymentService.checkEntitlements();

// Créer un checkout
const checkout = await paymentService.createCheckout('BOOK_PART_2');
// checkout.checkout_url contient l'URL de paiement

// Vérifier le statut
const status = await paymentService.checkPaymentStatus(checkout.token);
```

### Dans l'application Mobile

```typescript
import { paymentService } from '@/lib/payment-service';

// Créer un checkout
const checkout = await paymentService.createCheckout('BOOK_PART_2');

// Ouvrir l'URL de paiement
await paymentService.openCheckout(checkout.checkout_url);

// Gérer le retour (dans un handler de deep link)
const status = await paymentService.handlePaymentReturn(url);
```

## 🐳 Dockerisation

### Build et démarrage

```bash
# Build l'image Docker
docker build -t samaquete:latest .

# Démarrer avec docker-compose
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### Variables d'environnement Docker

Toutes les variables d'environnement doivent être définies dans `.env` ou passées à `docker-compose.yml`.

## 🔄 Flux de Paiement

1. **Création du checkout**
   - L'utilisateur initie un paiement
   - L'app appelle `paymentService.createCheckout(planId)`
   - L'API payment-api crée une facture PayDunya
   - Retourne une URL de checkout

2. **Redirection vers PayDunya**
   - L'utilisateur est redirigé vers l'URL de checkout
   - Effectue le paiement sur la plateforme PayDunya

3. **Notification IPN**
   - PayDunya envoie un webhook à `/api/paydunya/ipn`
   - L'API payment-api met à jour le statut du paiement
   - Accorde les entitlements si le paiement est réussi

4. **Retour utilisateur**
   - L'utilisateur est redirigé vers `/payment/return`
   - L'app vérifie le statut final
   - Met à jour l'interface utilisateur

## 🔒 Sécurité

### Variables d'environnement sensibles

- `FIREBASE_PRIVATE_KEY` - Clé privée Firebase Admin
- `PAYDUNYA_MASTER_KEY` - Clé maître PayDunya
- `PAYDUNYA_PRIVATE_KEY` - Clé privée PayDunya
- `PAYDUNYA_TOKEN` - Token PayDunya
- `DATABASE_URL` - URL de la base de données

**⚠️ Ne jamais commiter ces valeurs dans Git !**

### Authentification

Toutes les routes utilisateur de payment-api nécessitent un token Firebase :
```
Authorization: Bearer <firebase_id_token>
```

Le service `payment-service.ts` gère automatiquement l'authentification.

## 🔧 Maintenance

### Mettre à jour le submodule

```bash
# Mettre à jour vers la dernière version
git submodule update --remote payment-api

# Ou vers une version spécifique
cd payment-api
git checkout <tag-ou-branche>
cd ..
git add payment-api
git commit -m "Update payment-api submodule"
```

### Ajouter de nouvelles fonctionnalités

1. Vérifier si payment-api supporte déjà la fonctionnalité
2. Si oui, ajouter un wrapper dans `payment-service.ts`
3. Si non, contacter le mainteneur du submodule

## 📚 Documentation

- [README payment-api](./payment-api/README.md) - Documentation du submodule
- [Guide PayDunya](./payment-api/AUDIT_DOC_PAYDUNYA.md) - Documentation PayDunya
- [Intégration Mobile](./payment-api/MOBILE_INTEGRATION.md) - Guide d'intégration mobile

## 🐛 Dépannage

### Le submodule n'est pas cloné

```bash
# Vérifier que le submodule est configuré
cat .gitmodules

# Réinitialiser
git submodule deinit -f payment-api
git submodule update --init --recursive
```

### Erreur d'authentification Firebase

- Vérifier que `FIREBASE_PRIVATE_KEY` est correctement formaté (avec `\n`)
- Vérifier que `FIREBASE_PROJECT_ID` correspond au projet Firebase

### Erreur de connexion à l'API

- Vérifier que `NEXT_PUBLIC_PAYMENT_API_URL` est correct
- Vérifier que l'API payment-api est démarrée
- Vérifier les logs Docker : `docker-compose logs payment-api`

## 🚀 Déploiement

### Production

1. Configurer les variables d'environnement de production
2. Build l'image Docker : `docker build -t samaquete:prod .`
3. Déployer avec docker-compose ou votre orchestrateur
4. Configurer les URLs publiques dans PayDunya

### Variables de production requises

- `NODE_ENV=production`
- `PAYDUNYA_MODE=live`
- `BASE_URL=https://payment-api.yourdomain.com`
- Toutes les clés de production (Firebase, PayDunya, Database)

