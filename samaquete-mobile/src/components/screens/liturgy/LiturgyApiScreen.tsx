/**
 * Écran de démonstration de l'intégration API des textes liturgiques
 * Montre comment utiliser le service d'API externe
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch
} from 'react-native';
import { useLiturgyApi } from '../../../../hooks/useLiturgyApi';
import { liturgyConfigManager } from '../../../../lib/liturgyConfig';

interface LiturgyApiScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function LiturgyApiScreen({ setCurrentScreen }: LiturgyApiScreenProps) {
  const {
    todayLiturgy,
    loading,
    error,
    isOnline,
    lastSync,
    refresh,
    forceSync,
    setApiUrl
  } = useLiturgyApi();

  const [apiUrl, setApiUrlInput] = useState('http://localhost:5000');
  const [showConfig, setShowConfig] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Charger la configuration au démarrage
  useEffect(() => {
    const config = liturgyConfigManager.getConfig();
    setApiUrlInput(config.baseUrl);
  }, []);

  // Mettre à jour le statut de synchronisation
  useEffect(() => {
    if (lastSync) {
      const lastSyncDate = new Date(lastSync);
      setSyncStatus(`Dernière sync: ${lastSyncDate.toLocaleString()}`);
    } else {
      setSyncStatus('Jamais synchronisé');
    }
  }, [lastSync]);

  const handleSetApiUrl = async () => {
    try {
      setApiUrl(apiUrl);
      await liturgyConfigManager.setBaseUrl(apiUrl);
      Alert.alert('Succès', 'URL de l\'API mise à jour');
      refresh();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'URL');
    }
  };

  const handleForceSync = async () => {
    try {
      const success = await forceSync();
      if (success) {
        Alert.alert('Succès', 'Synchronisation réussie');
      } else {
        Alert.alert('Erreur', 'Échec de la synchronisation');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la synchronisation');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('liturgy')}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Textes Liturgiques API</Text>
        <TouchableOpacity
          style={styles.configButton}
          onPress={() => setShowConfig(!showConfig)}
        >
          <Text style={styles.configButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Configuration Panel */}
      {showConfig && (
        <View style={styles.configPanel}>
          <Text style={styles.configTitle}>Configuration API</Text>
          
          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrlInput}
            placeholder="URL de l'API (ex: http://localhost:5000)"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSetApiUrl}
            >
              <Text style={styles.buttonText}>Mettre à jour</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setApiUrlInput('http://localhost:5000')}
            >
              <Text style={styles.buttonText}>Local</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Statut:</Text>
          <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
        
        <Text style={styles.syncStatus}>{syncStatus}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.smallButton]}
            onPress={refresh}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔄 Actualiser</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.smallButton, styles.primaryButton]}
            onPress={handleForceSync}
            disabled={loading}
          >
            <Text style={styles.buttonText}>⚡ Sync</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error.message}</Text>
          <Text style={styles.errorCode}>Code: {(error as any).code || 'UNKNOWN'}</Text>
        </View>
      )}

      {/* Liturgy Content */}
      {todayLiturgy && !loading && (
        <View style={styles.content}>
          <View style={styles.liturgyHeader}>
            <Text style={styles.liturgyTitle}>{todayLiturgy.title}</Text>
            <Text style={styles.liturgyDate}>
              {formatDate(todayLiturgy.date)}
            </Text>
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>
                Source: {todayLiturgy.source}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Première Lecture</Text>
            <Text style={styles.sectionText}>{todayLiturgy.firstReading}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Psaume</Text>
            <Text style={styles.sectionText}>{todayLiturgy.psalm}</Text>
          </View>

          {todayLiturgy.secondReading && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deuxième Lecture</Text>
              <Text style={styles.sectionText}>{todayLiturgy.secondReading}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Évangile</Text>
            <Text style={styles.sectionText}>{todayLiturgy.gospel}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Réflexion</Text>
            <Text style={styles.sectionText}>{todayLiturgy.reflection}</Text>
          </View>
        </View>
      )}

      {/* No Data */}
      {!todayLiturgy && !loading && !error && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Aucun texte liturgique disponible
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={refresh}
          >
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  configButton: {
    padding: 8,
  },
  configButtonText: {
    color: 'white',
    fontSize: 20,
  },
  configPanel: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  smallButton: {
    flex: 0,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
  },
  syncStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorCode: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    margin: 16,
  },
  liturgyHeader: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  liturgyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  liturgyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sourceText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});
