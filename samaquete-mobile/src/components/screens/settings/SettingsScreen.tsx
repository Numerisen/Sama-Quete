import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../lib/ThemeContext';
import { useParishes } from '../../../../hooks/useParishes';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../../../../lib/auth-service';

interface SettingsScreenProps {
  setCurrentScreen: (screen: string) => void;
  setIsAuthenticated: (auth: boolean) => void;
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

export default function SettingsScreen({
  setCurrentScreen,
  setIsAuthenticated,
  isAuthenticated,
  user,
  profile,
  updateProfile,
  setAuthMode,
}: SettingsScreenProps) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Utiliser le hook des paroisses pour gérer l'église actuelle
  const { parishes, loading: parishesLoading, selectedParish, setSelectedParish } = useParishes();
  
  const [editedProfile, setEditedProfile] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    parish: profile?.parishName || ''
  });

  useEffect(() => {
    // Quand le profil Firebase arrive, on pré-remplit le formulaire.
    setEditedProfile({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
      parish: profile?.parishName || '',
    });
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      if (!user) {
        Alert.alert('Connexion requise', 'Veuillez vous connecter pour modifier votre profil.');
        return;
      }
      setLoading(true);

      const result = await updateProfile({
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        phone: editedProfile.phone,
        parishId: selectedParish?.id,
        parishName: selectedParish?.name || editedProfile.parish,
      });

      if (!result.success) {
        Alert.alert('Erreur', result.error || 'Impossible de sauvegarder le profil');
        return;
      }

      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    } finally {
      setLoading(false);
    }
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

  const handleChurchSelection = async (parish: any) => {
    try {
      setSelectedParish(parish);
      setShowChurchModal(false);
      
      // Mettre à jour le profil avec la nouvelle paroisse
      const updatedProfile = {
        ...editedProfile,
        parish: parish.name
      };
      setEditedProfile(updatedProfile);

      if (user) {
        await updateProfile({
          parishId: parish.id,
          parishName: parish.name,
        });
      }
      
      Alert.alert('Succès', `Église changée pour ${parish.name}`);
    } catch (error) {
      console.error('Erreur lors du changement d\'église:', error);
      Alert.alert('Erreur', 'Impossible de changer d\'église');
    }
  };

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
        {/* Profil Utilisateur / Connexion */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              {!isAuthenticated ? (
                <>
                  <Text style={[styles.userName, { color: colors.text }]}>Connexion</Text>
                  <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
                    Connectez-vous pour synchroniser votre profil et vos dons.
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity
                      style={[styles.authButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setAuthMode('signin');
                        setCurrentScreen('auth');
                      }}
                    >
                      <Text style={styles.authButtonText}>Se connecter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.authButton, { backgroundColor: colors.accent }]}
                      onPress={() => {
                        setAuthMode('signup');
                        setCurrentScreen('auth');
                      }}
                    >
                      <Text style={styles.authButtonText}>S’inscrire</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : isEditing ? (
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
                    editable={false}
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
                    <Text style={[styles.parishName, { color: colors.textSecondary }]}>
                      {selectedParish?.name || editedProfile.parish}
                    </Text>
                  </View>
                </>
              )}
            </View>
            {isAuthenticated && (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: colors.primary }]}
                onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name={isEditing ? "checkmark" : "pencil"} size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Église actuelle */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Votre église</Text>
        
        <TouchableOpacity 
          style={[styles.preferenceCard, { backgroundColor: colors.card }]}
          onPress={() => setShowChurchModal(true)}
        >
          <View style={styles.preferenceItem}>
            <View style={[styles.preferenceIcon, { backgroundColor: colors.border }]}>
              <Ionicons name="business-outline" size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>Église actuelle</Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                {selectedParish?.name || 'Aucune église sélectionnée'}
              </Text>
              {selectedParish?.city && (
                <Text style={[styles.preferenceSubDescription, { color: colors.textSecondary }]}>
                  {selectedParish.city} • {selectedParish.dioceseName}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

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


        


        {/* Bouton de déconnexion (uniquement si connecté) */}
        {isAuthenticated && (
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal de sélection des paroisses */}
      <Modal
        visible={showChurchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChurchModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Changer d'église</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowChurchModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Chargement des paroisses...
              </Text>
            </View>
          )}

          {!loading && (
            <FlatList
              data={parishes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.parishItem,
                    selectedParish?.id === item.id && styles.selectedParishItem
                  ]}
                  onPress={() => handleChurchSelection(item)}
                >
                  <View style={styles.parishItemContent}>
                    <View style={styles.parishItemIcon}>
                      <Ionicons name="business" size={24} color="#f59e0b" />
                    </View>
                    <View style={styles.parishItemInfo}>
                      <Text style={[styles.parishItemName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.parishItemLocation, { color: colors.textSecondary }]}>{item.city}</Text>
                      <Text style={[styles.parishItemDiocese, { color: colors.accent }]}>{item.dioceseName}</Text>
                    </View>
                    {selectedParish?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#f59e0b" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              style={styles.parishList}
            />
          )}
        </SafeAreaView>
      </Modal>
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
    padding: 10,
    borderRadius: 999,
  },
  authButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
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
  preferenceSubDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
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
  
  // Styles pour le modal de sélection d'église
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  parishList: {
    flex: 1,
    padding: 20,
  },
  parishItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedParishItem: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  parishItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  parishItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  parishItemInfo: {
    flex: 1,
  },
  parishItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  parishItemLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  parishItemDiocese: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
