# 🔍 Trouver l'URL de la Base de Données - Guide Rapide

## ✅ Étapes

1. **Allez sur** : https://vercel.com/dashboard
2. **Sélectionnez** votre projet `payment-api`
3. **Cliquez sur** : Settings > Environment Variables
4. **Cherchez** : `POSTGRES_URL` ou `DATABASE_URL`
5. **Copiez** la valeur complète (elle commence par `postgres://`)

## 📝 Exemple

Si vous voyez dans Vercel :
```
POSTGRES_URL = postgres://user:pass@host:port/db?sslmode=require
```

Alors dans `.env.local`, mettez :
```bash
POSTGRES_URL=postgres://user:pass@host:port/db?sslmode=require
```

**Important** : Copiez la valeur **exacte** depuis Vercel, sans guillemets.

## 🚨 Si vous ne trouvez pas POSTGRES_URL

Vous devez créer une base de données PostgreSQL :
- Vercel Dashboard > Storage > Create Database > Postgres
- OU utilisez Neon, Supabase, etc.

Puis ajoutez l'URL dans Vercel > Settings > Environment Variables
