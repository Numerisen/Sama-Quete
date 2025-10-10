# 🔥 Index Firestore Requis pour les Types de Dons

## ❌ Erreur

L'application mobile affiche ces erreurs :
```
ERROR: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## ✅ Solution Rapide

### Option 1 : Créer les index automatiquement (RECOMMANDÉ)

**Cliquez sur ces liens pour créer automatiquement les index :**

1. **Index pour les types de dons actifs (sans paroisse)** :
   👉 https://console.firebase.google.com/v1/r/project/numerisen-14a03/firestore/indexes?create_composite=ClZwcm9qZWN0cy9udW1lcmlzZW4tMTRhMDMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2RvbmF0aW9uX3R5cGVzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaCQoFb3JkZXIQARoMCghfX25hbWVfXxAB

2. **Index pour les types de dons actifs par paroisse** :
   👉 https://console.firebase.google.com/v1/r/project/numerisen-14a03/firestore/indexes?create_composite=ClZwcm9qZWN0cy9udW1lcmlzZW4tMTRhMDMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2RvbmF0aW9uX3R5cGVzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDAoIcGFyaXNoSWQQARoJCgVvcmRlchABGgwKCF9fbmFtZV9fEAE

**Étapes :**
1. Cliquez sur chaque lien (vous serez redirigé vers Firebase Console)
2. Vérifiez que vous êtes connecté à Firebase
3. Cliquez sur **"Créer l'index"**
4. Attendez quelques minutes que l'index soit créé (statut "En cours de création" → "Activé")
5. Rechargez l'application mobile

---

### Option 2 : Créer les index manuellement

Si les liens ne fonctionnent pas, suivez ces étapes :

#### 1. Accéder à Firebase Console
- Allez sur https://console.firebase.google.com
- Sélectionnez votre projet **"numerisen-14a03"**
- Allez dans **Firestore Database** → **Index**

#### 2. Créer le premier index

Cliquez sur **"Créer un index composite"** et configurez :

```
Collection: donation_types
Champs à indexer:
  - isActive (Croissant)
  - order (Croissant)
```

**Détails complets :**
- **Collection ID**: `donation_types`
- **Scope de la requête**: Collection
- **Champs**:
  1. `isActive` - Croissant (Ascending)
  2. `order` - Croissant (Ascending)

#### 3. Créer le deuxième index

Cliquez à nouveau sur **"Créer un index composite"** et configurez :

```
Collection: donation_types
Champs à indexer:
  - isActive (Croissant)
  - parishId (Croissant)
  - order (Croissant)
```

**Détails complets :**
- **Collection ID**: `donation_types`
- **Scope de la requête**: Collection
- **Champs**:
  1. `isActive` - Croissant (Ascending)
  2. `parishId` - Croissant (Ascending)
  3. `order` - Croissant (Ascending)

#### 4. Attendre la création

⏳ La création des index peut prendre **2-5 minutes**. 

Vous verrez le statut passer de :
- 🟡 "En cours de création" (Building)
- 🟢 "Activé" (Enabled)

---

## 📋 Pourquoi ces index sont nécessaires ?

Firestore requiert des index composites quand vous :
1. Utilisez plusieurs `where()` dans une requête
2. Combinez `where()` avec `orderBy()`

Notre application fait ces requêtes :
```typescript
// Requête 1 : Types actifs triés par ordre
where('isActive', '==', true) + orderBy('order', 'asc')

// Requête 2 : Types actifs par paroisse triés par ordre
where('parishId', '==', parishId) + 
where('isActive', '==', true) + 
orderBy('order', 'asc')
```

---

## ✅ Vérification

Après avoir créé les index :

1. **Attendez 2-5 minutes** que les index soient activés
2. **Rechargez l'application mobile**
3. **Allez dans "Faire un don"**
4. **Vérifiez qu'il n'y a plus d'erreurs** dans les logs

Les types de dons devraient maintenant s'afficher correctement !

---

## 🔧 Alternative Temporaire (Sans Index)

Si vous ne pouvez pas créer les index immédiatement, modifiez temporairement les requêtes pour ne pas utiliser `orderBy` :

**Dans `samaquete-mobile/lib/donationTypeService.ts`** :

Remplacez temporairement les queries :
```typescript
// Au lieu de :
const q = query(
  collection(db, this.collection),
  where('isActive', '==', true),
  orderBy('order', 'asc')  // ← Commentez cette ligne
);

// Utilisez :
const q = query(
  collection(db, this.collection),
  where('isActive', '==', true)
);
// Puis triez manuellement en JavaScript
const types = querySnapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .sort((a, b) => (a.order || 0) - (b.order || 0));
```

⚠️ **Cette solution est temporaire** - Créez les index dès que possible pour de meilleures performances.

---

## 📞 Besoin d'aide ?

Si les index ne se créent pas :
1. Vérifiez que vous avez les droits d'administration sur le projet Firebase
2. Vérifiez que Firestore est bien activé
3. Essayez de vous déconnecter et reconnecter à Firebase Console
4. Contactez le propriétaire du projet Firebase

---

**🎯 Liens rapides :**
- Firebase Console : https://console.firebase.google.com
- Documentation Index Firestore : https://firebase.google.com/docs/firestore/query-data/index-overview

