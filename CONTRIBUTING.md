# 🤝 Guide de Contribution - SamaQuête

Merci de votre intérêt à contribuer au projet SamaQuête ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## 📋 Table des Matières

- [🎯 Comment Contribuer](#-comment-contribuer)
- [🔧 Configuration de l'Environnement](#-configuration-de-lenvironnement)
- [📝 Standards de Code](#-standards-de-code)
- [🧪 Tests](#-tests)
- [📤 Processus de Contribution](#-processus-de-contribution)
- [🐛 Signaler un Bug](#-signaler-un-bug)
- [✨ Proposer une Fonctionnalité](#-proposer-une-fonctionnalité)

## 🎯 Comment Contribuer

### Types de Contributions

- **🐛 Correction de bugs**
- **✨ Nouvelles fonctionnalités**
- **📚 Amélioration de la documentation**
- **🎨 Amélioration de l'interface utilisateur**
- **⚡ Optimisation des performances**
- **🧪 Ajout de tests**

### Avant de Commencer

1. Vérifiez les [Issues existantes](https://github.com/votre-username/samaquete/issues)
2. Assurez-vous qu'il n'y a pas déjà une PR en cours pour la même fonctionnalité
3. Discutez de votre idée dans une Issue si c'est une grande fonctionnalité

## 🔧 Configuration de l'Environnement

### 1. Fork et Clone

```bash
# Fork le repository sur GitHub, puis :
git clone https://github.com/VOTRE-USERNAME/samaquete.git
cd samaquete
git remote add upstream https://github.com/ORIGINAL-OWNER/samaquete.git
```

### 2. Installation des Dépendances

#### Mobile
```bash
cd samaquete-mobile
npm install
```

#### Web
```bash
cd samaquete-admin
npm install
```

### 3. Configuration Firebase

1. Créez un projet Firebase de test
2. Copiez `firebase-config.example.js` vers `lib/firebase.ts`
3. Ajoutez vos clés de configuration

### 4. Branches de Développement

```bash
# Créer une nouvelle branche
git checkout -b feature/nom-de-la-fonctionnalite

# Ou pour un bug fix
git checkout -b fix/description-du-bug
```

## 📝 Standards de Code

### TypeScript

- Utilisez **TypeScript** pour tous les nouveaux fichiers
- Définissez des interfaces pour les props et états
- Évitez `any`, utilisez des types spécifiques

```typescript
// ✅ Bon
interface UserProps {
  id: string;
  name: string;
  email: string;
}

// ❌ Éviter
const user: any = { ... };
```

### Nommage

- **Variables et fonctions** : `camelCase`
- **Composants** : `PascalCase`
- **Fichiers** : `PascalCase.tsx` pour les composants
- **Constantes** : `UPPER_SNAKE_CASE`

```typescript
// ✅ Bon
const userName = 'Jean';
const UserProfile = () => { ... };
const API_BASE_URL = 'https://api.example.com';

// ❌ Éviter
const user_name = 'Jean';
const userprofile = () => { ... };
```

### Structure des Composants

```typescript
// ✅ Structure recommandée
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentProps {
  title: string;
  onPress: () => void;
}

export default function MyComponent({ title, onPress }: ComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Effets de bord
  }, []);

  const handlePress = () => {
    // Logique de gestion
    onPress();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### Commentaires

```typescript
// ✅ Bon - Explique le "pourquoi"
// Vérifier si l'utilisateur a les permissions nécessaires
// avant d'afficher le bouton de suppression
if (user.hasPermission('delete')) {
  // ...
}

// ❌ Éviter - Explique le "quoi"
// Incrémenter le compteur
counter++;
```

## 🧪 Tests

### Tests Unitaires

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

### Tests d'Intégration

```bash
# Tests E2E
npm run test:e2e
```

### Tests Manuels

1. **Mobile** : Tester sur différents appareils et tailles d'écran
2. **Web** : Tester sur différents navigateurs
3. **Thèmes** : Vérifier le mode sombre/clair
4. **Accessibilité** : Tester avec les lecteurs d'écran

## 📤 Processus de Contribution

### 1. Préparer vos Changements

```bash
# Ajouter vos fichiers
git add .

# Commiter avec un message descriptif
git commit -m "feat: ajouter la fonctionnalité de recherche"

# Types de commits :
# feat: nouvelle fonctionnalité
# fix: correction de bug
# docs: documentation
# style: formatage, point-virgules manquants, etc.
# refactor: refactoring du code
# test: ajout de tests
# chore: tâches de maintenance
```

### 2. Pousser et Créer une PR

```bash
# Pousser vers votre fork
git push origin feature/nom-de-la-fonctionnalite

# Créer une Pull Request sur GitHub
```

### 3. Template de Pull Request

```markdown
## 📝 Description

Brève description des changements apportés.

## 🔗 Issue Liée

Fixes #(numéro de l'issue)

## 🧪 Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests manuels effectués

## 📱 Screenshots (si applicable)

Ajoutez des captures d'écran pour les changements UI.

## ✅ Checklist

- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué une auto-révision de mon code
- [ ] J'ai commenté mon code, particulièrement dans les zones difficiles à comprendre
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests qui prouvent que mon fix est efficace ou que ma fonctionnalité fonctionne
- [ ] Les tests nouveaux et existants passent localement avec mes changements
```

## 🐛 Signaler un Bug

### Avant de Signaler

1. Vérifiez que le bug n'a pas déjà été signalé
2. Testez avec la dernière version
3. Vérifiez la documentation

### Template de Bug Report

```markdown
## 🐛 Description du Bug

Description claire et concise du problème.

## 🔄 Étapes pour Reproduire

1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler vers '...'
4. Voir l'erreur

## 🎯 Comportement Attendu

Description claire et concise de ce qui devrait se passer.

## 📱 Environnement

- OS: [ex. iOS 15.0, Android 11]
- Navigateur: [ex. Chrome 91, Safari 14]
- Version de l'app: [ex. 1.0.0]

## 📸 Screenshots

Ajoutez des captures d'écran si applicable.

## 📋 Informations Supplémentaires

Ajoutez tout autre contexte sur le problème ici.
```

## ✨ Proposer une Fonctionnalité

### Template de Feature Request

```markdown
## ✨ Fonctionnalité Demandée

Description claire et concise de la fonctionnalité souhaitée.

## 🎯 Problème à Résoudre

Description claire et concise du problème que cette fonctionnalité résoudrait.

## 💡 Solution Proposée

Description claire et concise de la solution que vous aimeriez voir.

## 🔄 Alternatives Considérées

Description claire et concise de toute solution alternative ou fonctionnalité que vous avez considérée.

## 📋 Informations Supplémentaires

Ajoutez tout autre contexte ou captures d'écran sur la fonctionnalité demandée ici.
```

## 🏷️ Labels et Milestones

### Labels Utilisés

- `bug` : Quelque chose ne fonctionne pas
- `enhancement` : Nouvelle fonctionnalité ou amélioration
- `documentation` : Amélioration de la documentation
- `good first issue` : Bon pour les nouveaux contributeurs
- `help wanted` : Besoin d'aide de la communauté
- `priority: high` : Priorité élevée
- `priority: medium` : Priorité moyenne
- `priority: low` : Priorité faible

## 📞 Support

- **Discord** : [Lien vers le serveur Discord]
- **Email** : dev@samaquete.sn
- **Issues** : [GitHub Issues](https://github.com/votre-username/samaquete/issues)

## 🙏 Reconnaissance

Tous les contributeurs seront reconnus dans le fichier `CONTRIBUTORS.md` et sur la page des remerciements de l'application.

---

Merci de contribuer à SamaQuête ! 🕊️
