# 🗄️ Initialisation de la Base de Données

## ❌ Problème

L'erreur `Failed query: insert into "payments"` indique que la table `payments` n'existe pas dans votre base de données PostgreSQL.

## ✅ Solution : Créer les tables

### Option 1 : Via Script Node.js (Recommandé)

#### Étape 1 : Installer les dépendances

```bash
cd payment-api
npm install
```

#### Étape 2 : Configurer les variables d'environnement

Créez un fichier `.env.local` dans `payment-api/` avec :

```bash
# URL de votre base de données PostgreSQL (la même que dans Vercel)
POSTGRES_URL=postgres://user:password@host:port/database?sslmode=require
# OU
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
```

**Important** : Utilisez la même URL que celle configurée dans Vercel (Settings > Environment Variables > `POSTGRES_URL` ou `DATABASE_URL`).

#### Étape 3 : Exécuter le script d'initialisation

```bash
node scripts/init-db-production.js
```

Le script va :
- ✅ Vérifier si les tables existent
- ✅ Créer les tables manquantes (`payments`, `users`, `entitlements`, `ipn_events`, `audit_logs`)
- ✅ Vérifier la structure

### Option 2 : Via SQL Direct (Alternative)

Si vous avez accès direct à votre base de données PostgreSQL, exécutez ce SQL :

```sql
-- Table payments
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

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(128) NOT NULL,
  email VARCHAR(256),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table entitlements
CREATE TABLE IF NOT EXISTS entitlements (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(128) NOT NULL,
  resource_id VARCHAR(64) NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  source_payment_id INTEGER,
  UNIQUE(uid, resource_id)
);

-- Table ipn_events
CREATE TABLE IF NOT EXISTS ipn_events (
  id SERIAL PRIMARY KEY,
  provider_ref VARCHAR(128) NOT NULL,
  raw_payload JSONB NOT NULL,
  signature_ok BOOLEAN NOT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider_ref)
);

-- Table audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(128),
  action VARCHAR(64) NOT NULL,
  meta JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour entitlements
CREATE UNIQUE INDEX IF NOT EXISTS uniq_uid_resource ON entitlements (uid, resource_id);

-- Index pour ipn_events
CREATE UNIQUE INDEX IF NOT EXISTS uniq_provider_ref ON ipn_events (provider_ref);
```

### Option 3 : Via Vercel Postgres Dashboard

Si vous utilisez Vercel Postgres :

1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Storage** > **Postgres**
4. Cliquez sur **Query**
5. Collez le SQL ci-dessus
6. Exécutez

## ✅ Vérification

Après avoir créé les tables, testez à nouveau :

```bash
curl -X POST https://payment-api-pink.vercel.app/api/paydunya/donation/checkout \
  -H "Content-Type: application/json" \
  -d '{"donationType": "quete", "amount": 1000, "description": "Test"}'
```

Vous devriez maintenant recevoir une réponse avec `checkout_url` et `token` sans erreur de base de données.

## 🔍 Vérifier que les tables existent

### Via Script

```bash
cd payment-api
node -e "
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const client = new Client({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });
client.connect().then(() => {
  return client.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name\");
}).then(res => {
  console.log('Tables:', res.rows.map(r => r.table_name).join(', '));
  client.end();
});
"
```

### Via SQL Direct

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Vous devriez voir : `audit_logs`, `entitlements`, `ipn_events`, `payments`, `users`

## 🎯 Prochaines étapes

Une fois les tables créées :

1. ✅ Testez l'API de donation checkout
2. ✅ Testez depuis l'app mobile
3. ✅ Vérifiez que les paiements sont enregistrés dans la base de données

---

**Important** : N'exécutez ce script qu'une seule fois. Il utilise `CREATE TABLE IF NOT EXISTS` pour éviter de recréer les tables existantes.

