import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NewsScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function NewsScreen({ setCurrentScreen }: NewsScreenProps) {
  const [selectedParish, setSelectedParish] = useState('Paroisse Saint-Joseph');

  const newsItems = [
    {
      id: 1,
      title: 'Célébration de la Journée Mondiale de la Jeunesse',
      description: 'Rejoignez-nous pour une journée spéciale dédiée aux jeunes de notre paroisse avec des activités spirituelles et culturelles.',
      date: '25 Janvier 2024',
      time: '14:00',
      location: 'Salle paroissiale',
      type: 'event',
      typeIcon: '🔥',
      typeColor: '#f59e0b',
      image: null,
    },
    {
      id: 2,
      title: 'Collecte pour les familles nécessiteuses',
      description: 'Notre paroisse organise une collecte de vivres et de vêtements pour soutenir le...',
      date: '20 Janvier 2024',
      location: 'Entrée de l\'église',
      type: 'star',
      typeIcon: '⭐',
      typeColor: '#fbbf24',
      image: null,
    },
    {
      id: 3,
      title: 'Retraite spirituelle de Carême',
      description: 'Préparez-vous au temps du Carême avec une retraite spirituelle de trois jou...',
      date: '10 Février 2024',
      location: 'Centre spirituel',
      type: 'event',
      typeIcon: '🔥',
      typeColor: '#f59e0b',
      image: null,
    },
    {
      id: 4,
      title: 'Nouveau groupe de prière des mères',
      description: 'Formation d\'un nouveau groupe de prière dédié aux mères de famille....',
      date: '27 Janvier 2024',
      location: 'Salle de catéchisme',
      type: 'star',
      typeIcon: '⭐',
      typeColor: '#fbbf24',
      image: null,
    },
    {
      id: 5,
      title: 'Travaux de rénovation de l\'église',
      description: 'Début des travaux de rénovation de la toiture de l\'église. Merci pour votre...',
      date: '15 Janvier 2024',
      location: 'Église principale',
      type: 'work',
      typeIcon: '🔨',
      typeColor: '#6b7280',
      image: null,
    },
  ];

  const handleParishChange = () => {
    // En production, cela ouvrirait un modal de sélection de paroisse
    setSelectedParish('Paroisse Sainte-Anne');
  };

  const handleNotifications = () => {
    setCurrentScreen('notifications');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header vert avec gradient */}
        <LinearGradient colors={['#10b981', '#059669']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Actualités</Text>
            <Text style={styles.headerSubtitle}>Vie paroissiale</Text>
            
            {/* Carte des nouvelles */}
            <View style={styles.newsCard}>
              <Ionicons name="people" size={24} color="#ffffff" />
              <Text style={styles.newsCardTitle}>5 nouvelles actualités</Text>
              <Text style={styles.newsCardSubtitle}>Cette semaine</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Sélection de paroisse */}
        <View style={styles.parishSelector}>
          <TouchableOpacity style={styles.parishButton} onPress={handleParishChange}>
            <Ionicons name="location" size={16} color="#10b981" />
            <Text style={styles.parishText}>{selectedParish}</Text>
            <Ionicons name="chevron-down" size={16} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* Liste des actualités */}
        <View style={styles.newsContainer}>
          {newsItems.map((item) => (
            <View key={item.id} style={styles.newsItem}>
              {/* Image placeholder */}
              <View style={styles.newsImage}>
                <Ionicons name="image" size={24} color="#9ca3af" />
              </View>
              
              {/* Contenu de l'actualité */}
              <View style={styles.newsContent}>
                {/* En-tête avec type et icône */}
                <View style={styles.newsHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: item.typeColor }]}>
                    <Text style={styles.typeIcon}>{item.typeIcon}</Text>
                    <Text style={styles.typeText}>
                      {item.type === 'event' ? 'Événement' : 
                       item.type === 'star' ? 'Important' : 'Travaux'}
                    </Text>
                  </View>
                </View>

                {/* Titre */}
                <Text style={styles.newsTitle}>{item.title}</Text>
                
                {/* Description */}
                <Text style={styles.newsDescription}>{item.description}</Text>
                
                {/* Métadonnées */}
                <View style={styles.newsMetadata}>
                  <View style={styles.metadataItem}>
                    <Ionicons name="calendar" size={14} color="#6b7280" />
                    <Text style={styles.metadataText}>{item.date}</Text>
                  </View>
                  
                  {item.time && (
                    <View style={styles.metadataItem}>
                      <Ionicons name="time" size={14} color="#6b7280" />
                      <Text style={styles.metadataText}>{item.time}</Text>
                    </View>
                  )}
                  
                  <View style={styles.metadataItem}>
                    <Ionicons name="location" size={14} color="#6b7280" />
                    <Text style={styles.metadataText}>{item.location}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Footer pour les notifications */}
        <LinearGradient colors={['#10b981', '#059669']} style={styles.footer}>
          <View style={styles.footerContent}>
            <Ionicons name="heart" size={32} color="#ffffff" style={styles.footerIcon} />
            <Text style={styles.footerTitle}>Restez connecté</Text>
            <Text style={styles.footerSubtitle}>
              Activez les notifications pour ne manquer aucune actualité de votre paroisse
            </Text>
            
            <TouchableOpacity style={styles.notificationsButton} onPress={handleNotifications}>
              <Text style={styles.notificationsButtonText}>Gérer les notifications</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 20,
  },
  newsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  newsCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 4,
    textAlign: 'center',
  },
  newsCardSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  parishSelector: {
    padding: 20,
    alignItems: 'center',
  },
  parishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  parishText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginHorizontal: 10,
  },
  newsContainer: {
    padding: 20,
    gap: 20,
  },
  newsItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  newsContent: {
    flex: 1,
  },
  newsHeader: {
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  typeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 15,
  },
  newsMetadata: {
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerIcon: {
    marginBottom: 15,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  footerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  notificationsButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationsButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
});
