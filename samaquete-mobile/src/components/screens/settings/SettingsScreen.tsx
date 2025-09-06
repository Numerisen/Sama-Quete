import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../lib/ThemeContext';

interface SettingsScreenProps {
  setCurrentScreen: (screen: string) => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  setIsAuthenticated: (auth: boolean) => void;
}

export default function SettingsScreen({ setCurrentScreen, userProfile, setUserProfile, setIsAuthenticated }: SettingsScreenProps) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  
  const [editedProfile, setEditedProfile] = useState({
    firstName: userProfile?.firstName || 'Jean',
    lastName: userProfile?.lastName || 'Baptiste',
    phone: userProfile?.phone || '+221 77 123 45 67',
    email: userProfile?.email || 'jean.baptiste@example.com',
    parish: userProfile?.parish || 'Paroisse Sainte-Anne'
  });

  const handleSaveProfile = () => {
    setUserProfile(editedProfile);
    setIsEditing(false);
    Alert.alert('Succès', 'Profil mis à jour avec succès');
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: () => setIsAuthenticated(false) }
      ]
    );
  };

  const recentActivities = [
    { id: 1, title: 'Lecture spirituelle', icon: 'book-outline', time: 'Aujourd\'hui' },
    { id: 2, title: 'Prière du matin', icon: 'star-outline', time: 'Aujourd\'hui' },
    { id: 3, title: 'Méditation', icon: 'chatbubble-outline', time: 'Hier' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.header as any} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Paramètres</Text>
            <Text style={styles.headerSubtitle}>Personnalisez votre expérience</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profil Utilisateur */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              {isEditing ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={[styles.editInput, { color: colors.text, backgroundColor: colors.surface }]}
                    value={editedProfile.firstName}
                    onChangeText={(text) => setEditedProfile({...editedProfile, firstName: text})}
                    placeholder="Prénom"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.editInput, { color: colors.text, backgroundColor: colors.surface }]}
                    value={editedProfile.lastName}
                    onChangeText={(text) => setEditedProfile({...editedProfile, lastName: text})}
                    placeholder="Nom"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.editInput, { color: colors.text, backgroundColor: colors.surface }]}
                    value={editedProfile.phone}
                    onChangeText={(text) => setEditedProfile({...editedProfile, phone: text})}
                    placeholder="Téléphone"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.editInput, { color: colors.text, backgroundColor: colors.surface }]}
                    value={editedProfile.email}
                    onChangeText={(text) => setEditedProfile({...editedProfile, email: text})}
                    placeholder="Email"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.editInput, { color: colors.text, backgroundColor: colors.surface }]}
                    value={editedProfile.parish}
                    onChangeText={(text) => setEditedProfile({...editedProfile, parish: text})}
                    placeholder="Paroisse"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              ) : (
                <>
                  <Text style={[styles.userName, { color: colors.text }]}>{editedProfile.firstName} {editedProfile.lastName}</Text>
                  <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{editedProfile.phone}</Text>
                  <View style={styles.parishInfo}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.parishName, { color: colors.textSecondary }]}>{editedProfile.parish}</Text>
                  </View>
                </>
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            >
              <Ionicons name={isEditing ? "checkmark" : "pencil"} size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Préférences */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Préférences</Text>
        
        <View style={[styles.preferenceCard, { backgroundColor: colors.card }]}>
          <View style={styles.preferenceItem}>
            <View style={[styles.preferenceIcon, { backgroundColor: colors.border }]}>
              <Ionicons name="color-palette-outline" size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>Mode sombre</Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>Améliore le confort visuel</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={isDarkMode ? '#ffffff' : '#ffffff'}
            />
          </View>
        </View>

        <View style={[styles.preferenceCard, { backgroundColor: colors.card }, pushNotifications && styles.activePreferenceCard]}>
          <View style={styles.preferenceItem}>
            <View style={[styles.preferenceIcon, { backgroundColor: colors.border }]}>
              <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>Notifications push</Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>Recevez des alertes en temps réel</Text>
            </View>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
            </View>
          </View>
        </View>

        <View style={[styles.preferenceCard, { backgroundColor: colors.card }]}>
          <View style={styles.preferenceItem}>
            <View style={[styles.preferenceIcon, { backgroundColor: colors.border }]}>
              <Ionicons name="shield-outline" size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>Authentification biométrique</Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>Déverrouillez l'app avec Touch/Face ID</Text>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={biometricAuth ? '#ffffff' : '#ffffff'}
            />
          </View>
        </View>

        {/* Activité récente */}
        <View style={styles.activityHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activité récente</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.accent }]}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {recentActivities.map((activity) => (
          <View key={activity.id} style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <View style={styles.activityIcon}>
              <Ionicons name={activity.icon as any} size={24} color="#ffffff" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
              <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{activity.time}</Text>
            </View>
          </View>
        ))}

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Profil Utilisateur
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  parishInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parishName: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
  editForm: {
    flex: 1,
  },
  editInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  
  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Préférences
  preferenceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activePreferenceCard: {
    borderWidth: 1,
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
  },
  checkmarkContainer: {
    padding: 4,
  },
  
  // Activité récente
  activityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
  },
  
  // Déconnexion
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
