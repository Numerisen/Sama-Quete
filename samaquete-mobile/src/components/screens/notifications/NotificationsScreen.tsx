import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../../../lib/numberFormat';
import { useTheme } from '../../../../lib/ThemeContext';
import { useNotifications } from '../../../../hooks/useNotifications';
import { ChurchStorageService } from '../../../../lib/church-storage';

interface NotificationsScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function NotificationsScreen({ setCurrentScreen }: NotificationsScreenProps) {
  const { colors } = useTheme();
  const [parishId, setParishId] = useState<string>('');
  const [parishName, setParishName] = useState<string>('');
  
  // Récupérer les notifications en temps réel
  const {
    notifications: firebaseNotifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  } = useNotifications(parishId);

  const [notificationSettings, setNotificationSettings] = useState({
    actualites: true,
    textesLiturgiques: true,
    lecturesDuJour: true,
    prieresSemaine: true,
    dons: false,
    evenements: true,
  });

  // Charger la paroisse sélectionnée
  useEffect(() => {
    loadSelectedParish();
  }, []);

  const loadSelectedParish = async () => {
    try {
      const selectedParish = await ChurchStorageService.getSelectedChurch();
      
      if (selectedParish && selectedParish.id) {
        setParishId(selectedParish.id);
        setParishName(selectedParish.name);
        console.log('📱 Paroisse chargée pour notifications:', selectedParish.id, selectedParish.name);
      } else {
        console.warn('⚠️ Aucune paroisse sélectionnée dans NotificationsScreen');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la paroisse:', error);
    }
  };

  const toggleNotification = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Gérer le clic sur une notification
  const handleNotificationPress = async (notification: any) => {
    // Marquer comme lue
    if (notification.id && !notification.read) {
      await markAsRead(notification.id);
    }

    // Rediriger selon le type
    switch (notification.type) {
      case 'prayer':
        setCurrentScreen('prayer');
        break;
      case 'news':
        setCurrentScreen('news');
        break;
      case 'activity':
        setCurrentScreen('dashboard');
        break;
      case 'donation':
        setCurrentScreen('donations');
        break;
      case 'liturgy':
        setCurrentScreen('liturgy');
        break;
      default:
        break;
    }
  };

  // Fonction pour formater le temps relatif
  const getRelativeTime = (date: any): string => {
    if (!date) return 'Récemment';
    
    const now = new Date();
    const notifDate = date.toDate ? date.toDate() : new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return notifDate.toLocaleDateString('fr-FR');
  };

  const notificationTypes = [
    {
      key: 'actualites',
      icon: 'newspaper',
      title: 'Actualités de l\'église',
      description: 'Nouvelles et événements de votre paroisse',
      color: '#10b981',
      enabled: notificationSettings.actualites,
    },
    {
      key: 'textesLiturgiques',
      icon: 'book',
      title: 'Textes liturgiques',
      description: 'Lectures et textes du jour',
      color: '#3b82f6',
      enabled: notificationSettings.textesLiturgiques,
    },
    {
      key: 'lecturesDuJour',
      icon: 'library',
      title: 'Lectures du jour',
      description: 'Évangile et lectures quotidiennes',
      color: '#8b5cf6',
      enabled: notificationSettings.lecturesDuJour,
    },
    {
      key: 'prieresSemaine',
      icon: 'heart',
      title: 'Prières de la semaine',
      description: 'Intentions de prière hebdomadaires',
      color: '#ef4444',
      enabled: notificationSettings.prieresSemaine,
    },
    {
      key: 'dons',
      icon: 'gift',
      title: 'Rappels de dons',
      description: 'Notifications pour les quêtes et offrandes',
      color: '#f59e0b',
      enabled: notificationSettings.dons,
    },
    {
      key: 'evenements',
      icon: 'calendar',
      title: 'Événements paroissiaux',
      description: 'Messes, célébrations et activités',
      color: '#06b6d4',
      enabled: notificationSettings.evenements,
    },
  ];

  // Utiliser les vraies notifications de Firestore
  const recentNotifications = firebaseNotifications.slice(0, 10);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'prayer': return 'time';
      case 'news': return 'newspaper';
      case 'activity': return 'calendar';
      case 'donation': return 'heart';
      case 'liturgy': return 'book';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'prayer': return '#ef4444';
      case 'news': return '#10b981';
      case 'activity': return '#06b6d4';
      case 'donation': return '#f59e0b';
      case 'liturgy': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={colors.header as any} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentScreen('dashboard')}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Notifications récentes */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications récentes</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Chargement des notifications...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            </View>
          ) : recentNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune notification pour le moment
              </Text>
            </View>
          ) : (
            recentNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  { backgroundColor: colors.card },
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationColor(notification.type) }
                ]}>
                  <Ionicons 
                    name={getNotificationIcon(notification.type) as any} 
                    size={20} 
                    color="#ffffff" 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                    {getRelativeTime(notification.createdAt)}
                  </Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Paramètres de notifications */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres de notifications</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Choisissez les types de notifications que vous souhaitez recevoir</Text>
          
          {notificationTypes.map((type) => (
            <View key={type.key} style={[styles.settingItem, { backgroundColor: colors.card }]}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: type.color }]}>
                  <Ionicons name={type.icon as any} size={20} color="#ffffff" />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{type.title}</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{type.description}</Text>
                </View>
              </View>
              <Switch
                value={type.enabled}
                onValueChange={() => toggleNotification(type.key)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={type.enabled ? '#ffffff' : colors.textSecondary}
              />
            </View>
          ))}
        </View>

        {/* Actions rapides */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card }]}
              onPress={() => setCurrentScreen('news')}
            >
              <Ionicons name="newspaper" size={24} color="#10b981" />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Actualités</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card }]}
              onPress={() => setCurrentScreen('liturgy')}
            >
              <Ionicons name="book" size={24} color="#3b82f6" />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Liturgie</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card }]}
              onPress={() => setCurrentScreen('donations')}
            >
              <Ionicons name="heart" size={24} color="#ef4444" />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Dons</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  settingsButton: {
    padding: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
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
});