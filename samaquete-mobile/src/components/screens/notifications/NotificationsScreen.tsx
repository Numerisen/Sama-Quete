import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../../../lib/numberFormat';
import { useTheme } from '../../../../lib/ThemeContext';
// import { useNotifications } from '../../../../hooks/useFirebaseData'; // Temporairement désactivé

interface NotificationsScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function NotificationsScreen({ setCurrentScreen }: NotificationsScreenProps) {
  const { colors } = useTheme();
  // const { notifications: firebaseNotifications, loading } = useNotifications(); // Temporairement désactivé
  
  // Données statiques par défaut
  const firebaseNotifications: any[] = [];
  const loading = false;
  const [notifications, setNotifications] = useState({
    actualites: true,
    textesLiturgiques: true,
    lecturesDuJour: true,
    prieresSemaine: true,
    dons: false,
    evenements: true,
  });

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationTypes = [
    {
      key: 'actualites',
      icon: 'newspaper',
      title: 'Actualités de l\'église',
      description: 'Nouvelles et événements de votre paroisse',
      color: '#10b981',
      enabled: notifications.actualites,
    },
    {
      key: 'textesLiturgiques',
      icon: 'book',
      title: 'Textes liturgiques',
      description: 'Lectures et textes du jour',
      color: '#3b82f6',
      enabled: notifications.textesLiturgiques,
    },
    {
      key: 'lecturesDuJour',
      icon: 'library',
      title: 'Lectures du jour',
      description: 'Évangile et lectures quotidiennes',
      color: '#8b5cf6',
      enabled: notifications.lecturesDuJour,
    },
    {
      key: 'prieresSemaine',
      icon: 'heart',
      title: 'Prières de la semaine',
      description: 'Intentions de prière hebdomadaires',
      color: '#ef4444',
      enabled: notifications.prieresSemaine,
    },
    {
      key: 'dons',
      icon: 'gift',
      title: 'Rappels de dons',
      description: 'Notifications pour les quêtes et offrandes',
      color: '#f59e0b',
      enabled: notifications.dons,
    },
    {
      key: 'evenements',
      icon: 'calendar',
      title: 'Événements paroissiaux',
      description: 'Messes, célébrations et activités',
      color: '#06b6d4',
      enabled: notifications.evenements,
    },
  ];

  // Utiliser les notifications Firebase ou des données par défaut
  const recentNotifications = firebaseNotifications.length > 0 
    ? firebaseNotifications.slice(0, 4).map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        time: new Date(notif.createdAt.seconds * 1000).toLocaleDateString('fr-FR'),
        read: false,
      }))
    : [
        {
          id: 1,
          type: 'actualites',
          title: 'Nouvelle actualité',
          message: 'Messe de Noël - Programme des célébrations',
          time: 'Il y a 2 heures',
          read: false,
        },
        {
          id: 2,
          type: 'textesLiturgiques',
          title: 'Lectures du jour',
          message: 'Évangile selon Saint Matthieu - Chapitre 2',
          time: 'Il y a 4 heures',
          read: false,
        },
        {
          id: 3,
          type: 'prieresSemaine',
          title: 'Intention de prière',
          message: 'Prière pour les malades et les souffrants',
          time: 'Hier',
          read: true,
        },
        {
          id: 4,
          type: 'evenements',
          title: 'Événement à venir',
          message: 'Messe dominicale - Dimanche 10h00',
          time: 'Il y a 2 jours',
          read: true,
        },
      ];

  const getNotificationIcon = (type: string) => {
    const notificationType = notificationTypes.find(nt => nt.key === type);
    return notificationType ? notificationType.icon : 'notifications';
  };

  const getNotificationColor = (type: string) => {
    const notificationType = notificationTypes.find(nt => nt.key === type);
    return notificationType ? notificationType.color : '#6b7280';
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
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Notifications récentes */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications récentes</Text>
          {recentNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                { backgroundColor: colors.card },
                !notification.read && styles.unreadNotification
              ]}
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
                <Text style={[styles.notificationTitle, { color: colors.text }]}>{notification.title}</Text>
                <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>{notification.message}</Text>
                <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{notification.time}</Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
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
});