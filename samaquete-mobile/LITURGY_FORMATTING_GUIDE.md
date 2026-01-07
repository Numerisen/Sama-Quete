# Guide de Formatage des Textes Liturgiques

## Vue d'ensemble

L'application mobile formate maintenant les textes liturgiques **exactement comme sur aelf.org**, avec :
- Citations en gras avec guillemets français
- Responsories "R/" en gras
- Acclamations "Alléluia" en gras
- Références bibliques en italique
- Introductions en italique
- Mise en page identique à aelf.org

## Composant FormattedLiturgyText

Le composant `FormattedLiturgyText` parse automatiquement le texte et applique les styles appropriés.

### Utilisation

```typescript
import { FormattedLiturgyText } from '../../ui/FormattedLiturgyText';

<FormattedLiturgyText 
  text={reading.excerpt} 
  style={styles.readingText}
/>
```

### Formatage automatique

Le composant identifie et formate automatiquement :

1. **Citations** : `« Le Seigneur te fera grâce... »` → **Gras**
2. **Responsories** : `R/ Heureux tous ceux...` → **Gras**
3. **Acclamations** : `Alléluia` → **Gras**
4. **Références bibliques** : `(Is 30, 19-21.23-26)` → *Italique*
5. **Introductions** : `Lecture du livre du prophète Isaïe` → *Italique*
6. **Temps** : `En ce temps-là,` → *Italique*
7. **Fin de lecture** : `– Parole du Seigneur.` → *Italique*

## Structure de l'affichage

L'affichage suit exactement la structure d'aelf.org :

```
LECTURES DE LA MESSE

PREMIÈRE LECTURE (en rouge)
(Is 30, 19-21.23-26) (en italique)
« Le Seigneur te fera grâce... » (en gras)
Texte normal...

PSAUME (en rouge)
(146 (147A), 1-2, 3-4, 5-6) (en italique)
R/ Heureux tous ceux... (en gras)
Texte normal...

ÉVANGILE (en rouge)
(Mt 9, 35 – 10, 1.5a.6-8) (en italique)
Alléluia, Alléluia. (en gras)
Évangile de Jésus Christ... (en italique)
En ce temps-là, (en italique)
Texte normal...
– Acclamons la Parole de Dieu. (en italique)
```

## Styles appliqués

### Couleurs
- **Titres des lectures** : Rouge (`#dc2626`) - comme sur aelf.org
- **Texte normal** : Gris foncé (`#1f2937`)
- **Références** : Gris moyen (`#374151`)

### Formatage
- **Gras** : Citations, responsories, acclamations
- **Italique** : Références, introductions, temps, fins de lecture
- **Normal** : Texte du corps de la lecture

## Exemple complet

```typescript
import { FormattedLiturgyText } from '../../ui/FormattedLiturgyText';

{todayReadings.readings.map((reading, index) => (
  <View key={index} style={styles.readingSection}>
    {/* Titre en rouge */}
    <Text style={styles.readingTitle}>
      {reading.title.toUpperCase()}
    </Text>
    
    {/* Référence en italique */}
    {reading.reference && (
      <Text style={styles.readingReference}>
        {reading.reference}
      </Text>
    )}
    
    {/* Texte formaté automatiquement */}
    <FormattedLiturgyText 
      text={reading.excerpt} 
      style={styles.readingText}
    />
  </View>
))}
```

## Avantages

✅ **Formatage automatique** - Pas besoin de parser manuellement  
✅ **Identique à aelf.org** - Même mise en page visuelle  
✅ **Réutilisable** - Utilisable partout dans l'app  
✅ **Maintenable** - Logique centralisée dans un composant  

## Personnalisation

Si vous voulez modifier les styles, éditez `FormattedLiturgyText.tsx` :

```typescript
const styles = StyleSheet.create({
  citation: {
    fontWeight: 'bold',
    // Ajoutez vos styles personnalisés
  },
  // ...
});
```

## Notes importantes

1. Le formatage est **automatique** - le composant parse le texte et applique les styles
2. Les données viennent de Flask ou du scraper direct - le formatage est fait côté mobile
3. Le formatage fonctionne avec **tous les textes** scrapés depuis aelf.org
4. Les patterns de formatage sont basés sur la structure standard d'aelf.org

## Dépannage

### Le formatage ne fonctionne pas
- Vérifiez que le texte contient bien les patterns (citations, responsories, etc.)
- Vérifiez que le composant `FormattedLiturgyText` est bien importé

### Styles incorrects
- Vérifiez les styles dans `FormattedLiturgyText.tsx`
- Vérifiez que les patterns regex correspondent à votre texte

### Performance
- Le parsing est fait à chaque rendu
- Pour de très longs textes, considérez la mise en cache du parsing

