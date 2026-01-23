# 🔐 Règles Firestore - Résumé Complet

## ✅ Vérification et Ajustement des Règles Firestore

### 📋 Collections Protégées

#### 1. **admin_news** (Actualités)

| Rôle | Action | Filtres | Restrictions |
|------|--------|---------|--------------|
| Super Admin | CRUD complet | Aucun filtre | Accès global |
| Archidiocèse | Lecture, publication | Aucun filtre | Publication archidiocésaine uniquement |
| Diocèse | Lecture, publication | `dioceseId == user.dioceseId` | Publication diocésaine |
| Paroisse | CRUD complet | `parishId == user.parishId` | Validation workflow (draft/pending → published) |
| Église | Création/modification | `parishId == user.parishId AND churchId == user.churchId` | draft/pending uniquement, pas de publication |

**Règles clés :**
- Église : ne peut créer que `status == 'draft'` ou `'pending'` avec `published == false`
- Église : ne peut modifier que si `status != 'published'`
- Paroisse : peut valider (pending → published) et publier directement

#### 2. **parish_activities** (Activités)

| Rôle | Action | Filtres | Restrictions |
|------|--------|---------|--------------|
| Super Admin | CRUD complet | Aucun filtre | Accès global |
| Archidiocèse | Lecture seule | Aucun filtre | Pas d'écriture |
| Diocèse | Lecture, publication | `dioceseId == user.dioceseId` | Publication diocésaine |
| Paroisse | CRUD complet | `parishId == user.parishId` | Contrôle total |
| Église | CRUD limité | `parishId == user.parishId AND churchId == user.churchId` | draft/pending uniquement |

**Règles clés :**
- Église : ne peut créer/modifier que `status == 'draft'` ou `'pending'`
- Église : ne peut pas modifier si `status == 'published'`

#### 3. **donation_types** (Types de dons)

| Rôle | Action | Filtres | Restrictions |
|------|--------|---------|--------------|
| Super Admin | CRUD complet | Aucun filtre | Accès global |
| Archidiocèse | Lecture seule | Aucun filtre | Pas d'écriture |
| Diocèse | Lecture seule | `dioceseId == user.dioceseId` | Pas d'écriture |
| Paroisse | CRUD complet | `parishId == user.parishId` | Gestion complète |
| Église | Lecture seule | `parishId == user.parishId` | Pas d'écriture |

**Règles clés :**
- Seule la paroisse peut créer/modifier les types de dons
- Mobile : lit uniquement `isActive == true` ET `parishId == selectedParish`

#### 4. **donations / admin_donations / parish_donations** (Dons)

| Rôle | Action | Filtres | Restrictions |
|------|--------|---------|--------------|
| Super Admin | Lecture complète | Aucun filtre | Accès global |
| Archidiocèse | Lecture complète | Aucun filtre | Lecture seule |
| Diocèse | Lecture | `dioceseId == user.dioceseId` | Lecture seule |
| Paroisse | Lecture seule | `parishId == user.parishId` | **Aucun CRUD autorisé** |
| Église | Lecture seule | `parishId == user.parishId` | **Aucun CRUD autorisé** |

**Règles clés :**
- ⛔ **Aucune écriture autorisée** depuis l'admin (dons créés uniquement via mobile/API)
- Tous les rôles : lecture seule strictement
- Filtrage automatique par `parishId`

#### 5. **notifications**

| Rôle | Action | Filtres | Restrictions |
|------|--------|---------|--------------|
| Super Admin | CRUD complet | Aucun filtre | Accès global |
| Archidiocèse | Lecture, publication | Aucun filtre | Publication archidiocésaine |
| Diocèse | Lecture, publication | `dioceseId == user.dioceseId` | Publication diocésaine |
| Paroisse | CRUD complet | `parishId == user.parishId` | Gestion complète, toggle publish possible |
| Église | CRUD limité | `parishId == user.parishId` | draft/pending uniquement, pas de publication |

**Règles clés :**
- Paroisse : peut modifier même si `published == true` (pour toggle publish)
- Église : ne peut créer/modifier que `status == 'draft'` ou `'pending'` avec `published == false`
- Église : ne peut pas modifier si `status == 'published'`

### 🔒 Sécurité Mobile

**Règles de lecture côté mobile :**

```javascript
// Mobile lit UNIQUEMENT :
// - published == true
// - parishId == selectedParish

// Collections concernées :
// - admin_news: where('published', '==', true) AND where('parishId', '==', selectedParish)
// - notifications: where('published', '==', true) AND where('parishId', '==', selectedParish)
// - donation_types: where('isActive', '==', true) AND where('parishId', '==', selectedParish)
```

**Statuts jamais visibles côté mobile :**
- `draft` → jamais visible
- `pending` → jamais visible
- `rejected` → jamais visible

### 🛡️ Protection des Données

**Filtrage systématique :**
- ✅ `parishId` → toujours pour paroisse et église
- ✅ `churchId` → uniquement pour église
- ✅ `dioceseId` → pour diocèse et archidiocèse

**Interdictions :**
- ❌ Aucun accès aux données d'autres paroisses
- ❌ Aucun accès aux données d'autres églises
- ❌ Aucune écriture sur les dons depuis l'admin
- ❌ Aucune publication directe depuis l'église

### 📊 Workflow de Validation

**Workflow pour admin_news et parish_activities :**

```
1. Église crée contenu
   → status: 'draft' ou 'pending'
   → published: false
   → churchId: user.churchId
   → parishId: user.parishId

2. Paroisse valide
   → status: 'published'
   → published: true
   → validatedBy: user.uid
   → validatedAt: timestamp

3. Mobile lit
   → where('published', '==', true)
   → where('parishId', '==', selectedParish)
```

### ✅ Tests de Sécurité

**À tester pour chaque rôle :**

1. **Super Admin**
   - ✅ Accès global à toutes les collections
   - ✅ CRUD complet partout

2. **Admin Archidiocèse**
   - ✅ Lecture globale
   - ✅ Publication archidiocésaine
   - ❌ Pas d'accès aux données d'autres archidiocèses

3. **Admin Diocèse**
   - ✅ Lecture limitée à son diocèse
   - ✅ Publication diocésaine
   - ❌ Pas d'accès aux données d'autres diocèses

4. **Admin Paroisse**
   - ✅ CRUD limité à sa paroisse
   - ✅ Validation des contenus église
   - ❌ Pas d'accès aux données d'autres paroisses

5. **Admin Église**
   - ✅ Création/modification contenu local (draft/pending)
   - ✅ Lecture seule sur dons
   - ❌ Pas de publication directe
   - ❌ Pas d'accès aux données d'autres églises

### 🚀 Déploiement

**Pour appliquer les règles :**

1. Copier le contenu de `firestore.rules` dans Firebase Console
2. Tester avec l'émulateur Firestore
3. Vérifier chaque rôle avec les tests ci-dessus
4. Déployer en production

**Commandes utiles :**
```bash
# Tester les règles localement
firebase emulators:start --only firestore

# Déployer les règles
firebase deploy --only firestore:rules
```

### 📝 Notes Importantes

1. **Les règles Firestore ne peuvent pas filtrer les requêtes** - le filtrage doit être fait côté client avec `where()`
2. **Les règles vérifient les permissions** - elles autorisent ou refusent l'accès, mais ne filtrent pas automatiquement
3. **Le mobile doit toujours filtrer** - `where('published', '==', true)` ET `where('parishId', '==', selectedParish)`
4. **Les fonctions utilitaires** - simplifient la lecture des règles mais nécessitent des appels `get()` (coût en lecture)

### ✅ Confirmation

- ✅ Filtrage systématique par `parishId` et `churchId`
- ✅ Rôles respectés (super_admin, archdiocese_admin, diocese_admin, parish_admin, church_admin)
- ✅ Statuts gérés (draft, pending, published)
- ✅ Lecture seule pour les dons
- ✅ Workflow de validation fonctionnel
- ✅ Aucun accès aux données d'autres paroisses/églises
- ✅ Mobile lit uniquement `published == true` ET `parishId == selectedParish`
