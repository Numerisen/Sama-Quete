# 🧪 Guide de Test - Intégration API Textes Liturgiques

## 🎯 Vue d'ensemble

Ce guide vous accompagne pour tester l'intégration complète de votre API de textes liturgiques avec votre application mobile Sama-Quete.

## 📋 Prérequis

- ✅ API Python TextOfTheDay clonée et fonctionnelle
- ✅ ngrok installé
- ✅ Application mobile Sama-Quete configurée
- ✅ Connexion Internet

## 🚀 Étapes de Test

### 1. **Test de l'API Python**

```bash
# Terminal 1 - Lancer l'API Python
cd TextOfTheDay
python3 app.py
```

**Résultat attendu :**
```
* Serving Flask app 'app'
* Running on http://127.0.0.1:5000
```

### 2. **Test de l'API avec curl**

```bash
# Terminal 2 - Tester l'API
curl http://127.0.0.1:5000/api/text-of-the-day
```

**Résultat attendu :**
```json
{
  "date": "2024-01-17",
  "title": "2ème dimanche du temps ordinaire",
  "lectures": [
    {
      "type": "Première lecture",
      "reference": "1 S 3, 3b-10.19",
      "contenu": "En ces jours-là, le jeune Samuel était au service du Seigneur..."
    }
  ]
}
```

### 3. **Test avec ngrok**

```bash
# Terminal 3 - Exposer l'API
ngrok http 5000
```

**Résultat attendu :**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

### 4. **Test de l'Application Mobile**

```bash
# Terminal 4 - Tester l'intégration
cd samaquete-mobile
node test-api-simple.js
```

**Résultat attendu :**
```
✅ Données reçues:
Date: 2024-01-17
Titre: 2ème dimanche du temps ordinaire
Nombre de lectures: 4
```

## 📱 Test dans l'Application

### **Configuration de l'URL**

1. **Ouvrez l'écran de liturgie** dans votre app
2. **Modifiez l'URL** dans `LiturgyScreen.tsx` :
   ```typescript
   // Ligne 27-28
   setApiUrl('http://127.0.0.1:5000'); // Local
   // ou
   setApiUrl('https://votre-url-ngrok.ngrok.io'); // ngrok
   ```

### **Fonctionnalités à Tester**

#### ✅ **Chargement Automatique**
- L'app charge les textes au démarrage
- Indicateur de chargement visible
- Données affichées correctement

#### ✅ **Indicateurs de Statut**
- Point vert = En ligne
- Point rouge = Hors ligne
- Source affichée (api/cache/firestore)

#### ✅ **Boutons de Contrôle**
- **Actualiser** : Recharge les données
- **Sync** : Force la synchronisation

#### ✅ **Gestion des Erreurs**
- Message d'erreur si API indisponible
- Fallback vers données statiques
- Retry automatique

#### ✅ **Cache Local**
- Données sauvegardées localement
- Fonctionnement hors ligne
- Synchronisation différée

## 🔧 Tests de Scénarios

### **Scénario 1 : API Disponible**
1. Lancez l'API Python
2. Ouvrez l'app mobile
3. **Résultat attendu :** Textes chargés depuis l'API

### **Scénario 2 : API Indisponible**
1. Arrêtez l'API Python
2. Ouvrez l'app mobile
3. **Résultat attendu :** Données de fallback affichées

### **Scénario 3 : Reconnexion**
1. API arrêtée → App ouverte
2. Relancez l'API Python
3. Appuyez sur "Sync"
4. **Résultat attendu :** Données mises à jour

### **Scénario 4 : Changement d'URL**
1. Changez l'URL dans le code
2. Redémarrez l'app
3. **Résultat attendu :** Nouvelle URL utilisée

## 🐛 Dépannage

### **Problème : API non accessible**

**Symptômes :**
- Point rouge dans l'app
- Message d'erreur
- Données de fallback

**Solutions :**
1. Vérifiez que l'API Python fonctionne :
   ```bash
   curl http://127.0.0.1:5000/api/text-of-the-day
   ```

2. Vérifiez l'URL dans l'app :
   ```typescript
   setApiUrl('http://127.0.0.1:5000');
   ```

3. Vérifiez les logs de l'API Python

### **Problème : Données vides**

**Symptômes :**
- API accessible mais pas de textes
- Lectures vides

**Solutions :**
1. Vérifiez la connexion Internet
2. Testez l'API directement avec curl
3. Vérifiez les logs de l'API

### **Problème : ngrok ne fonctionne pas**

**Symptômes :**
- URL ngrok non accessible
- Timeout des requêtes

**Solutions :**
1. Vérifiez que ngrok fonctionne :
   ```bash
   curl https://votre-url.ngrok.io/api/text-of-the-day
   ```

2. Redémarrez ngrok :
   ```bash
   ngrok http 5000
   ```

3. Mettez à jour l'URL dans l'app

## 📊 Métriques de Succès

### **Fonctionnalités Principales**
- ✅ Chargement automatique des textes
- ✅ Gestion des erreurs robuste
- ✅ Cache local fonctionnel
- ✅ Synchronisation manuelle
- ✅ Interface utilisateur intuitive

### **Performance**
- ✅ Temps de chargement < 3 secondes
- ✅ Fonctionnement hors ligne
- ✅ Synchronisation en arrière-plan

### **Fiabilité**
- ✅ Fallback automatique
- ✅ Retry en cas d'échec
- ✅ Gestion des timeouts

## 🎉 Validation Finale

### **Checklist de Validation**

- [ ] API Python fonctionne en local
- [ ] ngrok expose l'API correctement
- [ ] App mobile charge les textes
- [ ] Indicateurs de statut corrects
- [ ] Boutons de contrôle fonctionnels
- [ ] Gestion d'erreurs appropriée
- [ ] Cache local opérationnel
- [ ] Synchronisation manuelle réussie
- [ ] Interface utilisateur responsive

### **Tests de Régression**

1. **Redémarrage de l'app** → Données persistantes
2. **Changement d'URL** → Nouvelle configuration
3. **Perte de connexion** → Fallback automatique
4. **Reconnexion** → Synchronisation réussie

## 📞 Support

En cas de problème :

1. **Vérifiez les logs** de l'API Python
2. **Testez avec curl** pour isoler le problème
3. **Vérifiez la configuration** ngrok
4. **Consultez les logs** de l'app mobile

---

**🎊 Félicitations !** Votre intégration API des textes liturgiques est maintenant opérationnelle et testée.
