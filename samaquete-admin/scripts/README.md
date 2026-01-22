# Scripts d'administration

## Créer un utilisateur admin

### Prérequis

1. **Service Account Firebase** (recommandé) :
   - Téléchargez votre service account depuis Firebase Console
   - Projet > Paramètres > Comptes de service > Générer une nouvelle clé privée
   - Ajoutez les variables dans `.env.local` :

```env
FIREBASE_PROJECT_ID=numerisen-14a03
FIREBASE_CLIENT_EMAIL=votre-client-email@numerisen-14a03.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

2. **Alternative** : Utiliser Application Default Credentials (si vous êtes sur Google Cloud)

### Utilisation

```bash
npm run create-admin [role] [email] [password] [dioceseId] [parishId] [churchId]
```

### Exemples

#### Super Admin (accès total)
```bash
npm run create-admin super_admin admin@test.com password123
```

#### Admin Diocèse
```bash
npm run create-admin diocese_admin diocese@test.com password123 THIES
```

#### Admin Paroisse
```bash
npm run create-admin parish_admin parish@test.com password123 THIES PAR_001
```

#### Admin Église
```bash
npm run create-admin church_admin church@test.com password123 THIES PAR_001 CH_001
```

### Rôles disponibles

- `super_admin` : Accès total, peut tout gérer
- `archdiocese_admin` : Voit tout le Sénégal (lecture seule hors Dakar)
- `diocese_admin` : Gère son diocèse uniquement
- `parish_admin` : Gère sa paroisse uniquement
- `church_admin` : Crée du contenu pour sa paroisse (validation requise)

### Notes

- Si l'utilisateur existe déjà, le script mettra à jour ses claims
- Les IDs (dioceseId, parishId, churchId) doivent correspondre à ceux dans Firestore
- Après création, vous pouvez vous connecter à l'interface admin avec ces identifiants
