# 🔧 Services

Ce dossier contient les services backend et APIs externes utilisés par SamaQuête.

## 📁 Structure

```
services/
├── payment-api/          # API de paiement (Wave, Orange Money, Carte bancaire)
└── README.md            # Ce fichier
```

## 💳 API de Paiement

### Installation

```bash
# Cloner le repo de l'API de paiement
cd services
git clone <URL_DU_REPO_PAIEMENT> payment-api
cd payment-api
npm install  # ou yarn install
```

### Démarrage

```bash
# Depuis la racine du projet
npm run dev:payment

# Ou directement
cd services/payment-api
npm run dev
```

### Configuration

Créer un fichier `.env` dans `services/payment-api/` avec les clés API nécessaires.

## 🔗 Intégration

Les services sont intégrés via :
- `samaquete-admin/lib/payment-service.ts` - Service client pour l'admin
- `samaquete-mobile/lib/payment-service.ts` - Service client pour le mobile

