# 🔍 Comment Trouver l'URL de Votre Base de Données

## 📋 Étapes pour Obtenir l'URL

### Étape 1 : Aller dans Vercel Dashboard

1. Allez sur : https://vercel.com/dashboard
2. **Connectez-vous** à votre compte
3. **Sélectionnez** votre projet : `payment-api`

### Étape 2 : Aller dans Settings > Environment Variables

1. Dans votre projet, cliquez sur **Settings** (en haut)
2. Dans le menu de gauche, cliquez sur **Environment Variables**

### Étape 3 : Trouver l'URL de la Base de Données

Cherchez une variable qui s'appelle :
- `POSTGRES_URL` OU
- `DATABASE_URL`

**Exemple de ce que vous devriez voir** :

```
POSTGRES_URL = postgres://neondb_owner:npg_DUw48mozIsXb@ep-icy-boat-adugt8mk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

OU

```
DATABASE_URL = postgres://user:password@host:port/database?sslmode=require
```

### Étape 4 : Copier la Valeur Complète

1. **Cliquez** sur la variable `POSTGRES_URL` ou `DATABASE_URL`
2. **Copiez** la valeur complète (elle commence par `postgres://`)
3. **Ne modifiez rien** - utilisez-la telle quelle

## ✅ Exemple Concret

Si dans Vercel vous voyez :

```
POSTGRES_URL = postgres://neondb_owner:npg_ABC123@ep-example.aws.neon.tech/neondb?sslmode=require
```

Alors dans votre fichier `.env.local`, vous devez mettre :

```bash
POSTGRES_URL=postgres://neondb_owner:npg_ABC123@ep-example.aws.neon.tech/neondb?sslmode=require
```

**Important** :
- ✅ Copiez la valeur **complète** depuis Vercel
- ✅ Ne mettez **pas** de guillemets
- ✅ Utilisez la valeur **exacte** telle qu'elle apparaît dans Vercel

## 🚨 Si Vous Ne Trouvez Pas POSTGRES_URL ou DATABASE_URL

Cela signifie que vous n'avez pas encore configuré de base de données. Vous devez :

1. **Créer une base de données PostgreSQL** :
   - Option A : Utiliser **Vercel Postgres** (recommandé)
     - Vercel Dashboard > Storage > Create Database > Postgres
   - Option B : Utiliser **Neon**, **Supabase**, ou autre service PostgreSQL

2. **Ajouter l'URL dans Vercel** :
   - Settings > Environment Variables
   - Ajoutez `POSTGRES_URL` avec l'URL de votre base de données

## 📝 Format d'une URL PostgreSQL

Une URL PostgreSQL ressemble à :

```
postgres://[user]:[password]@[host]:[port]/[database]?[options]
```

**Exemple** :
```
postgres://monuser:monpassword123@db.example.com:5432/mabasededonnees?sslmode=require
```

## ✅ Vérification

Après avoir créé votre `.env.local` avec la bonne URL, testez :

```bash
cd payment-api
node scripts/init-db-production.js
```

Le script devrait se connecter à votre base de données et créer les tables.

---

**Résumé** : Copiez la valeur **exacte** de `POSTGRES_URL` ou `DATABASE_URL` depuis Vercel Dashboard > Settings > Environment Variables, et collez-la dans votre fichier `.env.local`.

