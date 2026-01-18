import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../lib/ThemeContext';
import { useNews } from '../../../../hooks/useNews';
import { useParishes } from '../../../../hooks/useParishes';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NewsScreenProps {
  setCurrentScreen: (screen: string) => void;
}

interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  date: string;
  location: string | null;
  type: string;
  typeIcon: string;
  typeColor: string;
  image: string | null;
  content?: string;
  category?: string;
}

export default function NewsScreen({ setCurrentScreen }: NewsScreenProps) {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Utiliser le hook useParishes pour gérer la paroisse sélectionnée
  const { selectedParish, loading: parishLoading } = useParishes();
  
  const parishId = selectedParish?.id || '';
  const parishName = selectedParish?.name || 'Ma paroisse';

  // Charger les vraies actualités depuis Firestore
  const { news, loading, error } = useNews(parishId);
  const isLoading = parishLoading || loading;


  const handleRefresh = async () => {
    setRefreshing(true);
    // Le hook useParishes gère déjà le rafraîchissement
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Mapper les catégories aux icônes et couleurs
  const getCategoryStyle = (category: string) => {
    const categoryMap: Record<string, { icon: string; color: string; type: string }> = {
      'Annonce': { icon: '📢', color: '#fbbf24', type: 'announcement' },
      'Événement': { icon: '🎉', color: '#f59e0b', type: 'event' },
      'Célébration': { icon: '✨', color: '#8b5cf6', type: 'celebration' },
      'Formation': { icon: '📚', color: '#10b981', type: 'formation' },
      'Pastorale': { icon: '🙏', color: '#ef4444', type: 'pastoral' },
      'Jeunesse': { icon: '🌟', color: '#06b6d4', type: 'youth' },
      'Caritative': { icon: '❤️', color: '#ec4899', type: 'charity' },
      'Autre': { icon: '📰', color: '#6b7280', type: 'other' },
    };
    return categoryMap[category] || categoryMap['Autre'];
  };

  // Convertir les actualités Firestore au format du design
  const newsItems: NewsItem[] = news.map((item, index) => {
    const categoryStyle = getCategoryStyle(item.category);
    // Afficher l'auteur seulement si showAuthor est true
    // Si showAuthor est false, ne pas afficher du tout (même pas "Paroisse")
    const displayAuthor = item.showAuthor !== false ? (item.author || 'Paroisse') : null;
    
    return {
      id: item.id || index,
      title: item.title,
      description: item.excerpt,
      content: item.content,
      category: item.category,
      date: item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }) : '',
      location: displayAuthor,
      type: categoryStyle.type,
      typeIcon: categoryStyle.icon,
      typeColor: categoryStyle.color,
      image: item.image || null,
    };
  });

  const handleNewsPress = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setModalVisible(true);
  };

  const handleParishChange = () => {
    // En production, cela ouvrirait un modal de sélection de paroisse
    // La sélection de paroisse est maintenant gérée par le hook useParishes
    console.log('Changement de paroisse demandé');
  };

  const handleNotifications = () => {
    setCurrentScreen('notifications');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
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
                <Ionicons name="newspaper" size={24} color="#ffffff" />
                <Text style={styles.newsCardTitle}>
                  {isLoading ? 'Chargement...' : `${newsItems.length} actualité${newsItems.length > 1 ? 's' : ''}`}
                </Text>
                <Text style={styles.newsCardSubtitle}>
                  {parishName}
                </Text>
              </View>
          </View>
        </LinearGradient>

        {/* Sélection de paroisse 
         <View style={[styles.parishSelector, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={[styles.parishButton, { backgroundColor: colors.card }]} onPress={handleParishChange}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[styles.parishText, { color: colors.text }]}>{parishName}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        */}
       

        {/* Liste des actualités */}
        <View style={[styles.newsContainer, { backgroundColor: colors.background }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Chargement des actualités...</Text>
            </View>
          ) : !parishId ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Sélectionnez d'abord une église</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : newsItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Aucune actualité pour le moment</Text>
            </View>
          ) : newsItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.newsItem, { backgroundColor: colors.card }]}
              onPress={() => handleNewsPress(item)}
              activeOpacity={0.7}
            >
              {/* Image réelle ou placeholder */}
              {item.image ? (
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.newsImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.newsImage, { backgroundColor: colors.surface }]}>
                  <Ionicons name="image" size={24} color={colors.textSecondary} />
                </View>
              )}
              
              {/* Contenu de l'actualité */}
              <View style={styles.newsContent}>
                {/* En-tête avec type et icône */}
                <View style={styles.newsHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: item.typeColor }]}>
                    <Text style={styles.typeIcon}>{item.typeIcon}</Text>
                    <Text style={styles.typeText}>
                      {item.category}
                    </Text>
                  </View>
                </View>

                {/* Titre */}
                <Text style={[styles.newsTitle, { color: colors.text }]}>{item.title}</Text>
                
                {/* Description */}
                <Text style={[styles.newsDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                
                {/* Métadonnées */}
                <View style={styles.newsMetadata}>
                  <View style={styles.metadataItem}>
                    <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{item.date}</Text>
                  </View>
                  
                  {item.location && (
                    <View style={styles.metadataItem}>
                      <Ionicons name="location" size={14} color={colors.textSecondary} />
                      <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{item.location}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {!isLoading && !error && newsItems.length === 0 && null}

        {/* Footer pour les notifications 
        <LinearGradient colors={['#10b981', '#059669']} style={styles.footer}>
          <View style={styles.footerContent}>
            <Ionicons name="heart" size={32} color="#ffffff" style={styles.footerIcon} />
            <Text style={styles.footerTitle}>Restez connecté</Text>
            <Text style={styles.footerSubtitle}>
              Activez les notifications pour ne manquer aucune actualité de votre paroisse
            </Text>
            
            <TouchableOpacity style={[styles.notificationsButton, { backgroundColor: colors.surface }]} onPress={handleNotifications}>
              <Text style={[styles.notificationsButtonText, { color: colors.text }]}>Gérer les notifications</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>*/}
      </ScrollView>

      {/* Modal de détails de l'actualité */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ScrollView style={styles.modalScrollView}>
            {/* Header du modal avec image */}
            {selectedNews?.image ? (
              <Image 
                source={{ uri: selectedNews.image }} 
                style={styles.modalImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.modalImagePlaceholder, { backgroundColor: colors.surface }]}>
                <Ionicons name="newspaper" size={64} color={colors.textSecondary} />
              </View>
            )}

            {/* Bouton fermer */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Contenu du modal */}
            <View style={styles.modalContent}>
              {/* Badge catégorie */}
              {selectedNews?.category && (
                <View style={[styles.modalCategoryBadge, { backgroundColor: selectedNews.typeColor }]}>
                  <Text style={styles.modalCategoryText}>{selectedNews.category}</Text>
                </View>
              )}

              {/* Titre */}
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedNews?.title}
              </Text>

              {/* Métadonnées */}
              <View style={styles.modalMetadata}>
                <View style={styles.modalMetadataItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.modalMetadataText, { color: colors.textSecondary }]}>
                    {selectedNews?.date}
                  </Text>
                </View>
                {selectedNews?.location && (
                  <View style={styles.modalMetadataItem}>
                    <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.modalMetadataText, { color: colors.textSecondary }]}>
                      {selectedNews?.location}
                    </Text>
                  </View>
                )}
              </View>

              {/* Séparateur */}
              <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

              {/* Contenu complet */}
              <Text style={[styles.modalContentText, { color: colors.text }]}>
                {selectedNews?.content || selectedNews?.description}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  newsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  newsCardSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  parishSelector: {
    padding: 20,
    alignItems: 'center',
  },
  parishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  parishText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginHorizontal: 8,
  },
  newsContainer: {
    padding: 20,
    gap: 20,
  },
  newsItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  newsImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  typeText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '600',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 20,
  },
  newsDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  newsMetadata: {
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 5,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerIcon: {
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',

  },
  footerSubtitle: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  notificationsButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationsButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#1e293b',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  // Styles du modal
  modalContainer: {
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalCategoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  modalMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  modalMetadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalMetadataText: {
    fontSize: 14,
  },
  modalDivider: {
    height: 1,
    marginVertical: 20,
  },
  modalContentText: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
});
