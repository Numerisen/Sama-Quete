# Affichage des Textes Liturgiques dans le Terminal

Ce script permet d'afficher les textes liturgiques du jour dans le terminal avec un formatage similaire à celui de l'application mobile.

## Utilisation

### Afficher les textes du jour (date actuelle)
```bash
node test-liturgy-display.js
```

### Afficher les textes pour une date spécifique
```bash
node test-liturgy-display.js 2025-12-25
```

## Formatage

Le script applique le même formatage que le composant `FormattedLiturgyText.tsx` :

- **Citations** (entre guillemets français « ») : en gras
- **Responsories** (R/ ...) : en gras et cyan
- **Acclamations** (Alléluia) : en gras et jaune
- **Références bibliques** (entre parenthèses) : en italique et gris
- **Introductions** (Lecture du livre..., Évangile...) : en italique
- **Adresses directes** (Peuple de Sion, En ce temps-là...) : en italique

## Structure de l'affichage

Le script affiche :
1. **En-tête** : Date, Titre, Saison liturgique
2. **Première lecture** : avec référence biblique
3. **Psaume** : avec référence
4. **Deuxième lecture** (si présente) : avec référence
5. **Évangile** : avec référence
6. **Réflexion** (si disponible)

## Exemple de sortie

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    TEXTES LITURGIQUES DU JOUR                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

📅 Date: 2025-12-06
📖 Titre: Lectures de la messe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PREMIÈRE LECTURE - (Is 30, 19-21.23-26)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lecture du livre du prophète Isaïe

Ainsi parle le Seigneur, le Dieu saint d'Israël :

Peuple de Sion,
toi qui habites Jérusalem,
tu ne pleureras jamais plus.

« Voici le chemin, prends-le ! »

– Parole du Seigneur.
```

## Notes

- Le script utilise directement le scraping depuis aelf.org
- Les couleurs ANSI sont utilisées pour le formatage (si votre terminal les supporte)
- Le script préserve les sauts de ligne et la structure originale du texte
- Les données sont récupérées en temps réel depuis aelf.org

