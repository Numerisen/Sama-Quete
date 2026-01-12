# 🔐 Explication CORS - Pourquoi et Pour Qui ?

## 📱 CORS est Principalement pour l'APP MOBILE

### Pourquoi CORS est nécessaire ?

**CORS (Cross-Origin Resource Sharing)** est une sécurité du navigateur qui bloque les requêtes HTTP entre différents domaines/origines.

### 🎯 Cas d'usage dans votre projet

#### 1. **APP MOBILE (React Native/Expo)** ✅ **PRINCIPAL**

L'app mobile fait des requêtes `fetch()` vers `payment-api` :

```typescript
// samaquete-mobile/lib/payment-service.ts
const response = await fetch(`${this.baseUrl}/api/paydunya/donation/checkout`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ ... })
});
```

**Origines possibles de l'app mobile** :
- `exp://localhost:8081` - Expo Go en développement local
- `exp://192.168.x.x:8081` - Expo Go sur réseau local
- `jangui-bi://` - Deep link de l'app compilée
- `https://expo.dev` - Si l'app tourne via Expo web
- `file://` - Si l'app tourne en mode web local

**Sans CORS configuré** :
- ❌ Le navigateur/Expo Go bloque les requêtes
- ❌ Erreur : `CORS policy: No 'Access-Control-Allow-Origin' header`
- ❌ Les paiements ne fonctionnent pas

**Avec CORS configuré** :
- ✅ Les requêtes passent depuis l'app mobile
- ✅ Les paiements fonctionnent
- ✅ L'historique des dons fonctionne

---

#### 2. **ADMIN WEB** ⚠️ **SECONDAIRE (peut-être pas nécessaire)**

L'admin web (`samaquete-admin`) est une application Next.js qui tourne sur :
- `http://localhost:3000` (dev)
- `https://samaquete.vercel.app` (prod)

**Si l'admin fait des requêtes vers `payment-api`** :
- Besoin de CORS si requêtes depuis le navigateur (fetch/AJAX)
- Pas besoin si requêtes serveur-à-serveur (Next.js API routes)

**Dans votre cas** :
- L'admin semble utiliser Firebase directement
- Pas de requêtes directes vers `payment-api` identifiées
- **CORS pour admin = optionnel/préventif**

---

#### 3. **PAYDUNYA IPN** ❌ **PAS BESOIN DE CORS**

PayDunya fait des callbacks POST vers `/api/paydunya/ipn` :
- Ce sont des requêtes **serveur-à-serveur**
- Pas de navigateur impliqué
- **Pas besoin de CORS**

---

## 🔧 Configuration CORS Recommandée

### Pour l'App Mobile (PRINCIPAL)

```env
CORS_ORIGINS=https://payment-api-pink.vercel.app,exp://localhost:8081,exp://192.168.0.0/16,jangui-bi://
```

**Origines à autoriser** :
1. ✅ `exp://localhost:8081` - Expo Go local
2. ✅ `exp://192.168.x.x:8081` - Expo Go réseau local (pattern)
3. ✅ `jangui-bi://` - Deep link app compilée
4. ✅ `https://expo.dev` - Expo web (si utilisé)

### Pour l'Admin Web (SECONDAIRE/OPTIONNEL)

```env
CORS_ORIGINS=...,https://samaquete.vercel.app,http://localhost:3000
```

**Origines à autoriser** :
1. ✅ `https://samaquete.vercel.app` - Admin production
2. ✅ `http://localhost:3000` - Admin développement

---

## 📋 Configuration Finale Recommandée

```env
# Dans Vercel (payment-api)
CORS_ORIGINS=https://payment-api-pink.vercel.app,https://samaquete.vercel.app,exp://localhost:8081,exp://192.168.0.0/16,jangui-bi://,https://expo.dev
```

**Explication** :
- `https://payment-api-pink.vercel.app` - L'API elle-même (pour les redirections)
- `https://samaquete.vercel.app` - Admin web (préventif)
- `exp://localhost:8081` - Expo Go local
- `exp://192.168.0.0/16` - Expo Go réseau local (toutes les IPs locales)
- `jangui-bi://` - Deep link app mobile
- `https://expo.dev` - Expo web

---

## ⚠️ IMPORTANT : Sécurité

**NE JAMAIS utiliser `*` en production** :
```env
# ❌ MAUVAIS
CORS_ORIGINS=*

# ✅ BON
CORS_ORIGINS=https://payment-api-pink.vercel.app,exp://localhost:8081,jangui-bi://
```

**Pourquoi ?**
- `*` permet à **n'importe quel site web** de faire des requêtes vers votre API
- Risque de vol de données
- Risque d'attaques CSRF

---

## 🎯 Résumé

| Client | Besoin CORS | Priorité | Origines |
|--------|-------------|----------|----------|
| **App Mobile** | ✅ **OUI** | 🔴 **CRITIQUE** | `exp://localhost:8081`, `jangui-bi://` |
| **Admin Web** | ⚠️ Peut-être | 🟡 Optionnel | `https://samaquete.vercel.app` |
| **PayDunya IPN** | ❌ Non | - | Serveur-à-serveur |

**Conclusion** : CORS est **principalement pour l'app mobile**. L'admin web n'en a probablement pas besoin, mais on le garde par précaution.

