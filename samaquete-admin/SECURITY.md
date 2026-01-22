# Notes de sécurité

## Vulnérabilité xlsx

Le package `xlsx` apparaît dans les audits npm mais **n'est pas utilisé** dans ce projet.

### Statut
- ❌ Non présent dans `package.json`
- ❌ Non utilisé dans le code source
- ⚠️ Peut apparaître comme dépendance transitive

### Actions recommandées

1. **Si xlsx n'est pas nécessaire** (cas actuel) :
   - Ignorer l'alerte : `npm audit --production` pour voir uniquement les dépendances de production
   - Ou utiliser : `npm audit fix --force` (attention, peut casser des choses)

2. **Si vous avez besoin d'exporter en Excel** :
   - Utiliser une alternative plus sûre comme `exceljs` ou `xlsx-populate`
   - Ou générer des CSV avec des bibliothèques natives

### Vérification

Pour vérifier d'où vient xlsx :
```bash
npm list xlsx
```

Si c'est une dépendance transitive, vous pouvez l'ignorer en toute sécurité car elle n'est pas utilisée dans le code.
