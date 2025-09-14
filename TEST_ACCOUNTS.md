# 🧪 Comptes de Test - SamaQuête

## 🔐 Comptes d'Administration

### Super Administrateur
- **Email**: `admin@admin.com`
- **Mot de passe**: `admin123`
- **Rôle**: `super_admin`
- **Permissions**: Toutes les permissions
- **UID Firebase**: `IhVf2ekzGNPX5LWzaaTGHQHzMTk1`

### Administrateur Diocèse
- **Email**: `diocese@diocese.com`
- **Mot de passe**: `diocese123`
- **Rôle**: `diocese_admin`
- **Permissions**: Gestion des paroisses et contenu
- **UID Firebase**: `aC9QNeVKXFNKlMQvtTyO1YyAnsi2`

## 🏛️ Données de Test

### Diocèses
1. **Archidiocèse de Dakar**
   - Évêque: Mgr Benjamin Ndiaye
   - Ville: Dakar
   - Type: Archidiocèse

2. **Diocèse de Thiès**
   - Évêque: Mgr André Gueye
   - Ville: Thiès
   - Type: Diocèse

3. **Diocèse de Ziguinchor**
   - Évêque: Mgr Paul Abel Mamba
   - Ville: Ziguinchor
   - Type: Diocèse

### Paroisses
1. **Paroisse Notre-Dame de la Paix**
   - Diocèse: Archidiocèse de Dakar
   - Prêtre: Père Jean Baptiste
   - Ville: Dakar

2. **Paroisse Saint-Joseph**
   - Diocèse: Diocèse de Thiès
   - Prêtre: Père Pierre Sarr
   - Ville: Thiès

3. **Paroisse Sainte-Marie**
   - Diocèse: Diocèse de Ziguinchor
   - Prêtre: Père Michel Diatta
   - Ville: Ziguinchor

### Événements de Dons
1. **Quête pour la construction de l'église**
   - Type: Quête
   - Montant cible: 5,000,000 FCFA
   - Paroisse: Notre-Dame de la Paix

2. **Denier du culte**
   - Type: Denier
   - Montant cible: 1,000,000 FCFA
   - Paroisse: Saint-Joseph

3. **Achat de cierges**
   - Type: Cierge
   - Montant cible: 500,000 FCFA
   - Paroisse: Sainte-Marie

## 🧪 Scripts de Test

### Créer les Comptes
```bash
cd samaquete-admin
node lib/create-profiles.js
```

### Initialiser les Diocèses
```bash
node lib/init-dioceses.js
```

### Créer des Données de Test
```bash
node lib/init-donation-data.js
```

### Tester la Connexion Admin
```bash
node lib/test-firebase-data.js
```

### Tester la Connexion Mobile
```bash
cd ../samaquete-mobile
node lib/test-mobile-parishes.js
```

## 🔍 Vérifications

### Panel d'Administration
1. Se connecter avec `admin@admin.com`
2. Vérifier le dashboard
3. Créer une nouvelle paroisse
4. Créer un événement de don
5. Voir les statistiques

### Application Mobile
1. Lancer avec `npx expo start`
2. Scanner le QR code
3. Sélectionner une paroisse
4. Naviguer dans les dons
5. Voir les actualités

## 🚨 Résolution de Problèmes

### Erreur de Connexion
- Vérifier les clés Firebase
- Vérifier la connexion internet
- Vérifier les règles Firestore

### Données Manquantes
- Exécuter les scripts d'initialisation
- Vérifier la console Firebase
- Vérifier les logs

### Erreurs d'Index
- Cliquer sur les liens d'erreur
- Attendre la création des index
- Utiliser les requêtes sans `orderBy`

---

**🎯 Utilisez ces comptes pour tester toutes les fonctionnalités !**