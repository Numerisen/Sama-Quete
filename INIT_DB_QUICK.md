# 🗄️ Initialisation Rapide de la Base de Données

## ❌ Problème
La table `payments` n'existe pas dans votre base de données PostgreSQL.

## ✅ Solution Rapide

### 1. Obtenir l'URL de la base de données

Dans Vercel Dashboard > Settings > Environment Variables, copiez la valeur de :
- `POSTGRES_URL` OU
- `DATABASE_URL`

### 2. Exécuter le script

```bash
cd payment-api

# Créer .env.local avec votre URL de base de données
echo "POSTGRES_URL=votre-url-de-vercel" > .env.local

# Installer les dépendances si nécessaire
npm install

# Exécuter le script d'initialisation
node scripts/init-db-production.js
```

### 3. Vérifier

```bash
curl -X POST https://payment-api-pink.vercel.app/api/paydunya/donation/checkout \
  -H "Content-Type: application/json" \
  -d '{"donationType": "quete", "amount": 1000, "description": "Test"}'
```

Si ça fonctionne, vous recevrez `checkout_url` ✅

## 🔄 Alternative : SQL Direct

Si vous avez accès à votre base de données, exécutez simplement :

```sql
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(128) NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'paydunya',
  provider_token VARCHAR(128) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  amount INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'XOF',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Et les autres tables (voir INIT_DATABASE.md pour le SQL complet).
