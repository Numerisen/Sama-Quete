/**
 * Composant pour formater le texte liturgique exactement comme sur aelf.org
 * Parse le texte et applique les styles appropriés (citations, responsories, acclamations, etc.)
 */

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

interface FormattedLiturgyTextProps {
  text: string;
  style?: any;
}

interface TextSegment {
  text: string;
  style: 'normal' | 'bold' | 'italic' | 'citation' | 'responsory' | 'acclamation' | 'reference';
}

export const FormattedLiturgyText: React.FC<FormattedLiturgyTextProps> = ({ text, style }) => {
  /**
   * Parse le texte et identifie les segments à formater
   * Implémente la même logique de formatage que aelf.org
   */
  const parseText = (input: string): TextSegment[] => {
    const segments: TextSegment[] = [];
    let remaining = input;

    // Pattern pour les citations avec guillemets français (comme sur aelf.org)
    const citationPattern = /«([^»]+)»/g;
    // Pattern pour les responsories (R/ ... jusqu'à la fin de la ligne ou jusqu'à "ou :")
    const responsoryPattern = /(R\/\s*[^\n]+?(?:\n|ou\s*:|$))/gi;
    // Pattern pour les acclamations (Alléluia, Alléluia.)
    const acclamationPattern = /(Alléluia[.,!]?)/gi;
    // Pattern pour les références bibliques entre parenthèses (comme (Is 30, 19-21.23-26))
    const referencePattern = /(\([A-Za-z0-9\s,.:;–-]+\))/g;
    // Pattern pour les introductions (Lecture du livre..., Évangile de Jésus Christ...)
    const introductionPattern = /(Lecture du [^\.]+\.|Évangile de Jésus Christ[^\.]+\.)/g;
    // Pattern pour "En ce temps-là," qui doit être en italique
    const timePattern = /(En ce temps-là,)/g;
    // Pattern pour "– Parole du Seigneur." et "– Acclamons la Parole de Dieu."
    const endingPattern = /(–\s*(?:Parole du Seigneur|Acclamons la Parole de Dieu)\.)/g;

    // Créer une liste de tous les matches avec leurs positions
    const matches: Array<{ start: number; end: number; type: TextSegment['style']; text: string }> = [];

    // Citations (priorité haute - ne pas chevaucher)
    let match: RegExpExecArray | null;
    while ((match = citationPattern.exec(remaining)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'citation',
        text: match[0]
      });
    }

    // Responsories
    while ((match = responsoryPattern.exec(remaining)) !== null) {
      // Vérifier qu'on ne chevauche pas une citation
      const matchData = match;
      const overlaps = matches.some(m => 
        (matchData.index >= m.start && matchData.index < m.end) ||
        (matchData.index + matchData[0].length > m.start && matchData.index + matchData[0].length <= m.end)
      );
      if (!overlaps) {
        matches.push({
          start: matchData.index,
          end: matchData.index + matchData[0].length,
          type: 'responsory',
          text: matchData[0]
        });
      }
    }

    // Acclamations
    while ((match = acclamationPattern.exec(remaining)) !== null) {
      const matchData = match;
      const overlaps = matches.some(m => 
        (matchData.index >= m.start && matchData.index < m.end) ||
        (matchData.index + matchData[0].length > m.start && matchData.index + matchData[0].length <= m.end)
      );
      if (!overlaps) {
        matches.push({
          start: matchData.index,
          end: matchData.index + matchData[0].length,
          type: 'acclamation',
          text: matchData[0]
        });
      }
    }

    // Références bibliques
    while ((match = referencePattern.exec(remaining)) !== null) {
      const matchData = match;
      const overlaps = matches.some(m => 
        (matchData.index >= m.start && matchData.index < m.end) ||
        (matchData.index + matchData[0].length > m.start && matchData.index + matchData[0].length <= m.end)
      );
      if (!overlaps) {
        matches.push({
          start: matchData.index,
          end: matchData.index + matchData[0].length,
          type: 'reference',
          text: matchData[0]
        });
      }
    }

    // Introductions
    while ((match = introductionPattern.exec(remaining)) !== null) {
      const matchData = match;
      const overlaps = matches.some(m => 
        (matchData.index >= m.start && matchData.index < m.end) ||
        (matchData.index + matchData[0].length > m.start && matchData.index + matchData[0].length <= m.end)
      );
      if (!overlaps) {
        matches.push({
          start: matchData.index,
          end: matchData.index + matchData[0].length,
          type: 'italic',
          text: matchData[0]
        });
      }
    }

    // "En ce temps-là,"
    while ((match = timePattern.exec(remaining)) !== null) {
      const matchData = match;
      const overlaps = matches.some(m => 
        (matchData.index >= m.start && matchData.index < m.end) ||
        (matchData.index + matchData[0].length > m.start && matchData.index + matchData[0].length <= m.end)
      );
      if (!overlaps) {
        matches.push({
          start: matchData.index,
          end: matchData.index + matchData[0].length,
          type: 'italic',
          text: matchData[0]
        });
      }
    }

    // Fin de lecture
    while ((match = endingPattern.exec(remaining)) !== null) {
      const matchData = match;
      const overlaps = matches.some(m => 
        (matchData.index >= m.start && matchData.index < m.end) ||
        (matchData.index + matchData[0].length > m.start && matchData.index + matchData[0].length <= m.end)
      );
      if (!overlaps) {
        matches.push({
          start: matchData.index,
          end: matchData.index + matchData[0].length,
          type: 'italic',
          text: matchData[0]
        });
      }
    }

    // Trier les matches par position
    matches.sort((a, b) => a.start - b.start);

    // Construire les segments en préservant les sauts de ligne
    let lastIndex = 0;
    for (const match of matches) {
      // Texte normal avant le match (PRÉSERVER les sauts de ligne)
      if (match.start > lastIndex) {
        const normalText = remaining.substring(lastIndex, match.start);
        if (normalText) {
          segments.push({ text: normalText, style: 'normal' });
        }
      }

      // Le match formaté
      segments.push({ text: match.text, style: match.type });

      lastIndex = match.end;
    }

    // Texte normal après le dernier match (PRÉSERVER les sauts de ligne)
    if (lastIndex < remaining.length) {
      const normalText = remaining.substring(lastIndex);
      if (normalText) {
        segments.push({ text: normalText, style: 'normal' });
      }
    }

    // Si aucun match trouvé, retourner tout le texte comme normal
    if (segments.length === 0) {
      segments.push({ text: remaining, style: 'normal' });
    }

    return segments;
  };

  const segments = parseText(text);

  return (
    <View>
      {segments.map((segment, index) => {
        let segmentStyle = styles.normal;

        switch (segment.style) {
          case 'citation':
            segmentStyle = styles.citation;
            break;
          case 'responsory':
            segmentStyle = styles.responsory;
            break;
          case 'acclamation':
            segmentStyle = styles.acclamation;
            break;
          case 'reference':
            segmentStyle = styles.reference;
            break;
          case 'italic':
            segmentStyle = styles.italic;
            break;
          case 'bold':
            segmentStyle = styles.bold;
            break;
          default:
            segmentStyle = styles.normal;
        }

        // Diviser par sauts de ligne pour préserver la structure
        const lines = segment.text.split('\n');
        
        return (
          <React.Fragment key={index}>
            {lines.map((line, lineIndex) => {
              // Si la ligne est vide, créer un espacement (séparation de paragraphe)
              if (!line.trim() && lineIndex < lines.length - 1) {
                return <View key={lineIndex} style={styles.lineSpacing} />;
              }
              
              // Afficher la ligne avec le style approprié
              return (
                <Text key={lineIndex} style={segmentStyle}>
                  {line}
                  {lineIndex < lines.length - 1 && '\n'}
                </Text>
              );
            })}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  baseText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 22,
    textAlign: 'left',
  },
  normal: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 22,
  },
  citation: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  responsory: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  acclamation: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  reference: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  italic: {
    fontSize: 15,
    color: '#1f2937',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  bold: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  lineSpacing: {
    height: 8,
  },
});

