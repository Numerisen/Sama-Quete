# 🏗️ Architecture Admin Web - Documentation Complète

## ✅ État de l'implémentation

**Date:** 2025-01-22  
**Statut:** ✅ **CONFORME** aux spécifications

---

## 📋 Principes essentiels (RESPECTÉS)

### ✅ Mobile : choix d'une seule paroisse
- Les règles Firestore filtrent strictement par `parishId`
- Aucune logique d'église côté mobile dans l'admin

### ✅ Mobile : ne connaît pas les églises
- Les églises sont dans la collection `churches` (interne admin uniquement)
- Aucune référence aux églises dans les collections visibles mobile
- Les règles Firestore ne permettent pas la lecture des églises côté mobile

### ✅ Données mobile: `published = true` + `parishId`
- Toutes les règles Firestore vérifient `published == true` pour le mobile
- Filtrage strict par `parishId` dans toutes les collections

### ✅ Églises = internes admin uniquement
- Collection `churches` créée séparément
- Page "Églises" uniquement accessible aux Admin Paroisse
- Avertissement affiché: "⚠️ Les églises ne sont JAMAIS visibles côté mobile"

### ✅ Dons = à la paroisse, jamais à l'église
- Page "Dons" Admin Paroisse: **AUCUNE référence à `churchId`**
- Service `ParishDonationService.getAll(parishId)` - filtre uniquement par `parishId`
- Règles Firestore: dons filtrés par `parishId` uniquement

---

## 👥 Rôles admin et accès

### 🔴 SUPER ADMIN
- **Pages:** `/admin/dashboard`, `/admin/paroisses`, `/admin/users`, etc.
- **Permissions:** Accès global, CRUD complet sur toutes les collections
- **Règles Firestore:** `isSuperAdmin()` → `allow read, write`

### 🟠 ADMIN ARCHIDIOCÈSE
- **Pages:** `/adminarchdiocese/dashboard`, `/adminarchdiocese/contents`, etc.
- **Permissions:** 
  - Voir tous diocèses, paroisses, églises
  - Consulter statistiques globales et dons (lecture seule)
  - Publier annonces archidiocésaines

### 🟡 ADMIN DIOCÈSE
- **Pages:** `/admindiocese/dashboard`, `/admindiocese/paroisses`, etc.
- **Permissions:**
  - Voir uniquement paroisses et églises de son diocèse
  - Consulter statistiques et dons du diocèse (lecture seule)
  - Publier annonces diocésaines

### 🟢 ADMIN PAROISSE
- **Pages:** `/adminparoisse/*`
- **Permissions:** Gestion de tout ce qui est visible sur le mobile
- **Vues:**
  1. ✅ Dashboard
  2. ✅ Informations paroisse → CRUD (nom, description, statut actif/inactif)
  3. ✅ Églises → CRUD interne, assignation admins église
  4. ✅ Actualités & contenus → filtrage (statut, type, date), actions : valider, refuser, publier
  5. ✅ Types de dons → CRUD, champs : nom, description, icône, 4 montants suggérés, ordre d'affichage
  6. ✅ Dons → lecture seule, statistiques (total, par type, par période)
  7. ✅ Notifications → CRUD, types : news, prayer, activity, donation, liturgy
  8. ✅ Utilisateurs → gestion uniquement des admins église
  9. ✅ Paramètres paroisse → configuration interne

### 🔵 ADMIN ÉGLISE
- **Pages:** `/admineglise/*`
- **Permissions:** Création de contenu soumis à validation paroisse
- **Vues:**
  1. ✅ Dashboard
  2. ✅ Actualités → draft/pending, modifiable tant que non publié
  3. ✅ Activités → soumises à validation paroisse
  4. ✅ prières → validation paroisse
  5. ✅ Dons → lecture seule
  6. ✅ Paramètres → internes

---

## 🧩 Composants obligatoires

### ✅ Sidebar.jsx → dynamique selon rôle
- `components/admin/sidebar-paroisse-admin.tsx` ✅
- `components/admin/sidebar-eglise.tsx` ✅
- `components/admin/sidebar-diocese.tsx` ✅

### ✅ Header.jsx → nom utilisateur, rôle, logout
- `components/admin/header-paroisse-admin.tsx` ✅
- `components/admin/header-eglise.tsx` ✅
- `components/admin/header-diocese.tsx` ✅

### ✅ Table.jsx → reusable table pour vues type : contenus, dons, notifications
- `components/admin/Table.jsx` ✅
- Fonctionnalités: recherche, filtres, pagination, actions personnalisées

### ✅ Form.jsx → reusable form pour CRUD
- `components/admin/Form.jsx` ✅
- Fonctionnalités: validation, types de champs multiples, gestion d'erreurs

---

## 🔥 Firebase / Firestore

### Structure des documents
Chaque document contient :
- ✅ `parishId` (obligatoire)
- ✅ `status` (draft | pending | published)

### Règles Firestore
- ✅ Basées sur : rôle utilisateur et `parishId`
- ✅ Mobile lit uniquement : `status = published` et `parishId = selectedParish`
- ✅ Fichier: `firestore.rules` ✅

---

## 📄 Pages implémentées

### ADMIN PAROISSE
| Page | Fichier | Statut |
|------|---------|--------|
| Dashboard | `app/adminparoisse/dashboard/page.tsx` | ✅ |
| Informations paroisse | `app/adminparoisse/informations/page.tsx` | ✅ |
| Églises | `app/adminparoisse/eglises/page.tsx` | ✅ |
| Actualités & contenus | `app/adminparoisse/contenus/page.tsx` | ✅ |
| Types de dons | `app/adminparoisse/donation-types/page.tsx` | ✅ |
| Dons | `app/adminparoisse/donations/page.tsx` | ✅ |
| Notifications | `app/adminparoisse/notifications/page.tsx` | ✅ |
| Utilisateurs | `app/adminparoisse/users/page.tsx` | ✅ |
| Paramètres paroisse | `app/adminparoisse/settings/page.tsx` | ✅ |

### ADMIN ÉGLISE
| Page | Fichier | Statut |
|------|---------|--------|
| Dashboard | `app/admineglise/dashboard/page.tsx` | ✅ |
| Actualités | `app/admineglise/news/page.tsx` | ✅ |
| Activités | `app/admineglise/activities/page.tsx` | ✅ |
| prières | `app/admineglise/prayers/page.tsx` | ✅ |
| Dons | `app/admineglise/donations/page.tsx` | ✅ |
| Paramètres | `app/admineglise/settings/page.tsx` | ✅ |

---

## 🧪 Tests de conformité

### Script de test
```bash
npm run test:conformity
```

Le script `lib/test-conformity.js` valide :
- ✅ Principes essentiels
- ✅ Rôles et permissions
- ✅ Pages ADMIN PAROISSE
- ✅ Pages ADMIN ÉGLISE
- ✅ Composants obligatoires
- ✅ Configuration Firestore
- ✅ Interdictions strictes

### Rapport généré
Le script génère un rapport JSON : `conformity-report.json`

---

## 🚫 Interdictions strictes (RESPECTÉES)

### ❌ Choix d'église côté mobile
- **Statut:** ✅ Respecté
- Aucune logique de sélection d'église dans l'admin

### ❌ Dons rattachés à une église
- **Statut:** ✅ Respecté
- Tous les dons utilisent uniquement `parishId`

### ❌ Publication directe sans validation paroisse
- **Statut:** ✅ Respecté
- Workflow: draft → pending → published (validation paroisse requise)

### ❌ Mélange des responsabilités
- **Statut:** ✅ Respecté
- Séparation claire des rôles et permissions

---

## 📱 UI / Design

### ✅ Dashboard moderne et responsive
- Utilisation de Chart.js pour les graphiques
- Cards avec statistiques
- Design sobre et professionnel

### ✅ Sidebar fixe gauche
- Collapsable
- Navigation claire selon le rôle

### ✅ Header avec nom, rôle, logout
- Affichage du nom utilisateur
- Menu déroulant avec logout
- Indicateur de notifications

### ✅ Design sobre, professionnel
- Palette de couleurs cohérente
- Utilisation de Tailwind CSS
- Composants UI réutilisables (shadcn/ui)

---

## 🔧 Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Tester la conformité
npm run test:conformity

# Build de production
npm run build

# Linter
npm run lint
```

---

## 📝 Notes importantes

1. **Tous les contenus doivent avoir `parishId`** - C'est obligatoire pour le filtrage mobile
2. **Les statuts doivent être respectés** - draft → pending → published
3. **Les églises sont INTERNES** - Jamais visibles côté mobile
4. **Les dons sont à la PAROISSE** - Jamais à l'église

---

## ✅ Validation finale

Tous les éléments demandés dans le prompt ont été implémentés :
- ✅ Architecture complète
- ✅ Tous les rôles et permissions
- ✅ Toutes les pages ADMIN PAROISSE
- ✅ Toutes les pages ADMIN ÉGLISE
- ✅ Composants réutilisables (Table, Form)
- ✅ Règles Firestore conformes
- ✅ Script de test de conformité
- ✅ Respect des interdictions strictes

**L'interface admin est prête pour la production !** 🎉
