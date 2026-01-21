# 📘 Guide d'utilisation des interfaces Admin - SamaQuete

## 🎯 Hiérarchie des rôles

```
🔴 Super Admin (super_admin)
    └─ Gestion globale : archidiocèses, diocèses, paroisses, églises, utilisateurs
    
🟠 Admin Archidiocèse (archdiocese_admin)
    └─ Supervision nationale : voir tous diocèses, stats globales, lecture seule dons
    
🟡 Admin Diocèse (diocese_admin)
    └─ Supervision territoriale : voir paroisses du diocèse, stats diocèse, lecture seule dons
    
🟢 Admin Paroisse (parish_admin)
    └─ Supervision locale : gérer églises, VALIDER contenus église, vue consolidée dons
    
🔵 Admin Église (church_admin)
    └─ Opérationnel terrain : CRÉER contenus (PENDING), gérer horaires/événements locaux
```

---

## 🚀 Comment tester les interfaces

### 1. **Connexion unique pour tous les admins**

URL : `http://localhost:3000/login`

**Interface de login** :
- 5 boutons visuels (Super Admin | Archidiocèse | Diocèse | Paroisse | Église)
- Le bouton est uniquement **visuel** (pour savoir quel type de compte)
- **La redirection se fait automatiquement selon le rôle Firebase**

### 2. **Comptes de test à créer**

```javascript
// Dans Firestore > collection "users"

// 1) Super Admin
{
  uid: "superadmin123",
  email: "admin@samaquete.sn",
  displayName: "Super Admin",
  role: "super_admin",
  permissions: { ... },  // Toutes permissions
  isActive: true
}

// 2) Admin Archidiocèse Dakar
{
  uid: "archdiocese_dakar",
  email: "archidiocese.dakar@samaquete.sn",
  displayName: "Admin Archidiocèse Dakar",
  role: "archdiocese_admin",
  archdioceseId: "dakar",
  permissions: { canViewDonations: true, canManageContent: true, ... },
  isActive: true
}

// 3) Admin Diocèse Thiès
{
  uid: "diocese_thies",
  email: "diocese.thies@samaquete.sn",
  displayName: "Admin Diocèse Thiès",
  role: "diocese_admin",
  dioceseId: "thies",
  permissions: { canViewDonations: true, canManageContent: true, ... },
  isActive: true
}

// 4) Admin Paroisse Saint-Joseph
{
  uid: "paroisse_stjoseph",
  email: "paroisse.stjoseph@samaquete.sn",
  displayName: "Admin Paroisse St-Joseph",
  role: "parish_admin",
  dioceseId: "dakar",
  parishId: "st-joseph-medina",
  permissions: { canValidateContent: true, canManageDonations: true, ... },
  isActive: true
}

// 5) Admin Église Jean Bosco
{
  uid: "eglise_jeanbosco",
  email: "eglise.jeanbosco@samaquete.sn",
  displayName: "Admin Église Jean Bosco",
  role: "church_admin",
  dioceseId: "dakar",
  parishId: "st-joseph-medina",
  churchId: "jean-bosco",
  permissions: { canCreateContent: true, canManageDonations: true, ... },
  isActive: true
}
```

### 3. **Créer les comptes dans Firebase Auth**

```bash
# Dans Firebase Console > Authentication
# Ou utiliser le script:
cd samaquete-admin
node lib/create-admin-users.js
```

---

## 📊 Fonctionnalités par niveau

### 🔴 Super Admin (`/admin`)

**Dashboard** :
- Statistiques globales (tous diocèses, paroisses, églises)
- Total des dons (tous niveaux)
- Gestion des utilisateurs admin
- Gestion de la structure (archidiocèses → diocèses → paroisses → églises)

**Pages disponibles** :
- `/admin/dashboard` - Vue d'ensemble
- `/admin/dioceses` - Gestion diocèses
- `/admin/paroisses` - Gestion paroisses
- `/admin/users` - Gestion utilisateurs
- `/admin/donations` - Tous les dons (lecture/écriture)
- `/admin/news` - Toutes les actualités
- `/admin/settings` - Paramètres globaux

---

### 🟠 Admin Archidiocèse (`/adminarchdiocese`)

**Dashboard** :
- Vue tous les diocèses de l'archidiocèse
- Stats globales archidiocèse
- Dons (lecture seule)

**Pages disponibles** :
- `/adminarchdiocese/dashboard`
- `/adminarchdiocese/dioceses` - Liste diocèses
- `/adminarchdiocese/donations` - Tous les dons (lecture seule)
- `/adminarchdiocese/news` - Publier annonces archidiocésaines
- `/adminarchdiocese/settings`

---

### 🟡 Admin Diocèse (`/admindiocese`)

**Dashboard** :
- Vue paroisses du diocèse
- Stats diocèse
- Dons diocèse (lecture seule)

**Pages disponibles** :
- `/admindiocese/dashboard?diocese=Thiès`
- `/admindiocese/paroisses` - Liste paroisses du diocèse
- `/admindiocese/donations` - Dons diocèse (lecture seule)
- `/admindiocese/news` - Publier annonces diocésaines
- `/admindiocese/settings`

---

### 🟢 Admin Paroisse (`/adminparoisse`)

**Dashboard** :
- Vue églises rattachées
- Stats paroisse
- Dons paroisse + églises (vue consolidée)
- **Contenus en attente de validation** (créés par églises)

**Pages disponibles** :
- `/adminparoisse/dashboard?paroisse=St-Joseph`
- `/adminparoisse/eglises` - Gestion églises
- `/adminparoisse/users` - Gestion admins église
- `/adminparoisse/donations` - Dons paroisse + églises
- `/adminparoisse/news` - Publier annonces + **VALIDER contenus église**
- `/adminparoisse/prayers` - Horaires prières
- `/adminparoisse/activities` - Activités
- `/adminparoisse/settings`

**🔑 Fonctionnalité clé : Validation des contenus**
```
Église crée actualité → Status: PENDING
↓
Paroisse reçoit notification
↓
Paroisse valide → Status: PUBLISHED (visible dans app mobile)
OU
Paroisse rejette → Status: REJECTED (avec raison)
```

---

### 🔵 Admin Église (`/admineglise`)

**Dashboard** :
- Activités église
- Horaires prières
- Dons église uniquement
- **Contenus créés** (en attente validation paroisse)

**Pages disponibles** :
- `/admineglise/dashboard?eglise=Jean-Bosco`
- `/admineglise/news` - **CRÉER actualités** (status PENDING → validation paroisse)
- `/admineglise/prayers` - Horaires prières
- `/admineglise/activities` - Événements locaux
- `/admineglise/donations` - Dons église (gestion locale)
- `/admineglise/settings` - Paramètres église

**🔑 Workflow de création de contenu** :
```typescript
// Église crée une actualité
await NewsService.create({
  title: "Messe de Pâques",
  content: "...",
  parishId: "st-joseph-medina",  // ⚠️ OBLIGATOIRE
  churchId: "jean-bosco",
  status: "pending",              // ⚠️ Attente validation
  published: false,               // Pas visible dans app
  createdBy: userUid,
  createdByRole: "church_admin"
})

// Paroisse valide
await ContentValidationService.validateContent(contentId, parishAdminUid)
// → status: "published", published: true, visible dans app mobile
```

---

## 🗂️ Structure Firebase Firestore

### Collections principales

```
users/                          # Comptes admin
  {uid}/
    - role: "super_admin" | "archdiocese_admin" | ...
    - archdioceseId?: string
    - dioceseId?: string
    - parishId?: string
    - churchId?: string
    - permissions: { ... }
    
archdioceses/                   # Structure archidiocèses
  {id}/
    - name: string
    - region: string
    
dioceses/                       # Structure diocèses
  {id}/
    - name: string
    - archdioceseId: string
    
parishes/                       # Structure paroisses
  {id}/
    - name: string
    - dioceseId: string
    - dioceseName: string
    
churches/                       # Structure églises
  {id}/
    - name: string
    - parishId: string
    
admin_news/                     # Actualités (avec workflow validation)
  {id}/
    - title: string
    - content: string
    - parishId: string          # ⚠️ OBLIGATOIRE pour app mobile
    - churchId?: string         # Si créé par église
    - status: "pending" | "published" | "rejected"
    - published: boolean        # Visible dans app mobile
    - createdBy: string
    - createdByRole: "parish_admin" | "church_admin"
    - validatedBy?: string      # UID validateur
    - rejectionReason?: string
    
admin_donations/                # Dons synchronisés (PayDunya → Firestore)
  paydunya_{token}/
    - donorName: string
    - fullname: string          # Alias
    - amount: number
    - type: "quete" | "denier" | "cierge" | "messe"
    - status: "pending" | "confirmed" | "cancelled"
    - parishId?: string
    - dioceseId?: string
    - uid: string
    - source: "mobile"
    - provider: "paydunya"
    
parish_donations/               # Dons saisis manuellement par paroisse
parish_prayer_times/            # Horaires prières
parish_activities/              # Activités
```

---

## 🔧 Données de test à créer

### Script de création (à exécuter)

```bash
cd samaquete-admin
node lib/init-test-data.js
```

Ou manuellement dans Firestore Console :

**1) Créer un diocèse**
```json
// Collection: dioceses
{
  "id": "dakar",
  "name": "Archidiocèse de Dakar",
  "region": "Dakar",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**2) Créer une paroisse**
```json
// Collection: parishes
{
  "id": "st-joseph-medina",
  "name": "Paroisse Saint-Joseph de Médina",
  "dioceseId": "dakar",
  "dioceseName": "Archidiocèse de Dakar",
  "city": "Dakar",
  "cure": "Père Jean Dupont",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**3) Créer une église**
```json
// Collection: churches
{
  "id": "jean-bosco",
  "name": "Église Saint Jean Bosco",
  "parishId": "st-joseph-medina",
  "address": "Médina, Dakar",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## ❓ FAQ : "Fidèle" dans admin église

**Question** : Je vois "fidèle" dans admin église, c'est quoi ?

**Réponse** : C'est un **terme générique** pour désigner les membres/utilisateurs de l'église visibles dans les statistiques du dashboard. Actuellement c'est probablement :
- Un compteur de fidèles inscrits dans l'app mobile
- Ou un placeholder pour une future fonctionnalité de gestion des membres

**Où c'est utilisé** :
- `app/admineglise/dashboard/page.tsx` : Statistiques "X fidèles"
- `components/admin/header-paroisse.tsx` : Peut-être un menu fidèles

**Pour le voir** : Va sur `/admineglise/dashboard` et regarde les cartes de stats.

---

## ✅ Prochaines étapes (en attente Firebase Admin JSON)

1. ✅ Hiérarchie rôles implémentée
2. ✅ Login unique créé
3. ✅ Workflow validation contenu créé
4. ⏳ **Script migration dons** (attente `firebase-adminsdk.json`)
5. ⏳ Finaliser toutes les pages settings
6. ⏳ Supprimer fonctionnalités notifications

---

## 🐛 Problèmes connus (à corriger)

- [ ] Page settings manquante pour `adminparoisse`
- [ ] Pages settings basiques pour `admin` et `admindiocese`
- [ ] Bouton déconnexion manquant dans certains layouts
- [ ] Références notifications à supprimer
- [ ] Route `/adminarchdiocese` à créer (actuellement manquante)

---

## 📞 Support

En cas de problème :
1. Vérifier que le compte existe dans Firebase Auth
2. Vérifier que le rôle existe dans Firestore `users/{uid}`
3. Vérifier que `parishId`/`dioceseId` correspondent aux IDs réels
4. Regarder les logs navigateur (F12 → Console)

