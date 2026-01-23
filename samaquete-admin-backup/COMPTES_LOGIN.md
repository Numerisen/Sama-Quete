# 🔐 Comptes de Login pour Tester l'Interface Admin

## 📋 Comptes de Test Disponibles

### 🔴 Super Admin
```
Email: admin@admin.com
Mot de passe: admin123
Rôle: super_admin
URL après connexion: /admin/dashboard
```

### 🟡 Admin Diocèse
```
Email: diocese@admin.com
Mot de passe: diocese123
Rôle: diocese_admin
URL après connexion: /admindiocese/dashboard
```

### 🟠 Admin Archidiocèse
```
Email: archdiocese.dakar@samaquete.sn
Mot de passe: Admin123
Rôle: archdiocese_admin
URL après connexion: /adminarchdiocese/dashboard
```

---

## 🚀 Comment Créer les Comptes (Firebase Console)

### Étape 1: Créer les Utilisateurs dans Firebase Auth

1. Aller dans **Firebase Console** > **Authentication**
2. Cliquer sur **"Ajouter un utilisateur"**
3. Créer les 3 utilisateurs ci-dessus
4. **Copier les UID** générés pour chaque utilisateur

### Étape 2: Créer les Profils dans Firestore

1. Aller dans **Firestore** > Collection **"users"**
2. Créer un document pour chaque UID copié

#### Document Super Admin (utiliser l'UID copié)
```json
{
  "email": "admin@admin.com",
  "displayName": "Super Administrateur",
  "role": "super_admin",
  "permissions": {
    "canManageUsers": true,
    "canManageArchdioceses": true,
    "canManageDioceses": true,
    "canManageParishes": true,
    "canManageChurches": true,
    "canManageContent": true,
    "canValidateContent": true,
    "canCreateContent": true,
    "canViewReports": true,
    "canViewDonations": true,
    "canManageDonations": true,
    "canManageSettings": true
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Document Admin Diocèse (utiliser l'UID copié)
```json
{
  "email": "diocese@admin.com",
  "displayName": "Administrateur Diocèse",
  "role": "diocese_admin",
  "dioceseId": "dakar",
  "permissions": {
    "canManageUsers": false,
    "canManageArchdioceses": false,
    "canManageDioceses": false,
    "canManageParishes": false,
    "canManageChurches": false,
    "canManageContent": true,
    "canValidateContent": false,
    "canCreateContent": true,
    "canViewReports": true,
    "canViewDonations": true,
    "canManageDonations": false,
    "canManageSettings": false
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Document Admin Archidiocèse (utiliser l'UID copié)
```json
{
  "email": "archdiocese.dakar@samaquete.sn",
  "displayName": "Admin Archidiocèse Dakar",
  "role": "archdiocese_admin",
  "archdioceseId": "dakar",
  "permissions": {
    "canManageUsers": false,
    "canManageArchdioceses": false,
    "canManageDioceses": false,
    "canManageParishes": false,
    "canManageChurches": false,
    "canManageContent": true,
    "canValidateContent": false,
    "canCreateContent": true,
    "canViewReports": true,
    "canViewDonations": true,
    "canManageDonations": false,
    "canManageSettings": false
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## 🟢 Comptes Admin Paroisse et Église

Ces comptes sont créés **automatiquement** lors de la création d'une paroisse ou d'une église via l'interface admin.

**Format des emails:**
- Paroisse: `paroisse-[nom-normalisé]@samaquete.sn`
- Église: `eglise-[nom-normalisé]@samaquete.sn`

**Mot de passe par défaut:** `Admin123`

**Exemples:**
- Paroisse "Saint-Joseph de Médina" → `paroisse-saint-joseph-de-medina@samaquete.sn`
- Église "Saint Jean Bosco" → `eglise-saint-jean-bosco@samaquete.sn`

---

## 🧪 Tests à Effectuer

### Test 1: Super Admin
1. Aller sur `http://localhost:3000/login`
2. Se connecter avec `admin@admin.com` / `admin123`
3. Vérifier la redirection vers `/admin/dashboard`
4. Tester la gestion des paroisses, diocèses, utilisateurs

### Test 2: Admin Paroisse
1. **Créer une paroisse** via Super Admin (`/admin/paroisses/create`)
2. Le compte admin paroisse est créé automatiquement
3. Se connecter avec l'email généré / `Admin123`
4. Vérifier la redirection vers `/adminparoisse/dashboard`
5. Tester toutes les pages:
   - ✅ Informations paroisse
   - ✅ Églises
   - ✅ Actualités & contenus (validation workflow)
   - ✅ Types de dons
   - ✅ Dons (lecture seule)
   - ✅ Notifications
   - ✅ Utilisateurs
   - ✅ Paramètres paroisse

### Test 3: Admin Église
1. **Créer une église** via Admin Paroisse (`/adminparoisse/eglises`)
2. Le compte admin église est créé automatiquement
3. Se connecter avec l'email généré / `Admin123`
4. Vérifier la redirection vers `/admineglise/dashboard`
5. Tester toutes les pages:
   - ✅ Dashboard
   - ✅ Actualités (création draft/pending)
   - ✅ Activités
   - ✅ prières
   - ✅ Dons (lecture seule)
   - ✅ Paramètres

---

## 🔧 Correction de l'Erreur "Element type is invalid"

Si vous voyez cette erreur au démarrage:

1. **Vérifier les packages installés:**
```bash
cd samaquete-admin
npm install
```

2. **Vérifier que next-themes est installé:**
```bash
npm list next-themes
```

3. **Si manquant, installer:**
```bash
npm install next-themes
```

4. **Redémarrer le serveur:**
```bash
npm run dev
```

5. **Si l'erreur persiste, vérifier les imports:**
   - Vérifier que tous les composants UI sont bien exportés
   - Vérifier qu'il n'y a pas de conflit entre `components/theme-provider.tsx` et `components/ui/theme-provider.tsx`

---

## 📝 Notes Importantes

- Les **mots de passe par défaut** sont `Admin123` pour les comptes créés automatiquement
- Les **emails** sont générés automatiquement selon le nom de l'entité
- Les **UID** doivent correspondre entre Firebase Auth et Firestore
- Les **IDs** (`parishId`, `churchId`, `dioceseId`) doivent exister dans les collections correspondantes

---

## ✅ Checklist de Test

- [ ] Super Admin peut accéder à toutes les pages
- [ ] Admin Paroisse peut gérer sa paroisse uniquement
- [ ] Admin Église peut créer des contenus (draft/pending)
- [ ] Admin Église ne peut pas publier directement
- [ ] Admin Paroisse peut valider les contenus église
- [ ] Les dons sont en lecture seule pour tous
- [ ] Les filtres par `parishId` fonctionnent correctement
- [ ] Les règles Firestore bloquent l'accès aux autres paroisses
