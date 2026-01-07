import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../lib/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AssistantScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function AssistantScreen({ setCurrentScreen }: AssistantScreenProps) {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');

  const frequentQuestions = [
    'Qu\'est-ce que la Pentecôte ?',
    'Comment prier le rosaire ?',
    'Sens du carême',
    'Saints du Sénégal',
    'Préparation au baptême',
    'Signification de l\'Eucharistie'
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // En production, cela enverrait le message au chatbot IA
      console.log('Message envoyé:', message);
      setMessage('');
    }
  };

  const handleQuestionPress = (question: string) => {
    // En production, cela enverrait automatiquement la question au chatbot
    console.log('Question sélectionnée:', question);
    setMessage(question);
  };

  const handleExploreResources = () => {
    // En production, cela ouvrirait l'écran des ressources spirituelles
    console.log('Explorer les ressources');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header violet avec gradient */}
        <LinearGradient colors={colors.header as any} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>IA spirituelle</Text>
            <Text style={styles.headerSubtitle}>Posez vos questions sur la foi</Text>
          </View>
        </LinearGradient>

        {/* Carte de l'assistant IA */}
        <View style={[styles.assistantCard, { backgroundColor: colors.card }]}>
          <View style={styles.assistantCardLeft}>
            <View style={styles.assistantIcon}>
              <Ionicons name="add" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.assistantInfo}>
              <Text style={[styles.assistantTitle, { color: colors.text }]}>IA spirituelle</Text>
              <Text style={[styles.assistantSubtitle, { color: colors.textSecondary }]}>Alimenté par la sagesse biblique</Text>
            </View>
          </View>
          <View style={styles.assistantCardRight}>
            <Ionicons name="book-outline" size={24} color="#ffffff" />
          </View>
        </View>

        {/* Message de bienvenue du chatbot */}
        <View style={[styles.chatBubble, { backgroundColor: colors.card }]}>
          <View style={styles.chatHeader}>
            <View style={styles.chatIcon}>
              <Ionicons name="add" size={16} color="#8b5cf6" />
            </View>
            <Text style={[styles.chatTitle, { color: colors.text }]}>IA spirituel</Text>
          </View>
          <Text style={[styles.chatMessage, { color: colors.textSecondary }]}>
            Paix du Christ ! Je suis votre assistant spirituel. Comment puis-je vous aider dans votre cheminement de foi aujourd'hui ?
          </Text>
          <Text style={[styles.chatTimestamp, { color: colors.textSecondary }]}>14:30</Text>
        </View>

        {/* Questions fréquentes */}
        <View style={[styles.frequentQuestionsSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Questions fréquentes</Text>
          <View style={styles.questionsGrid}>
            {frequentQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.questionButton, { backgroundColor: colors.card }]}
                onPress={() => handleQuestionPress(question)}
              >
                <Text style={[styles.questionText, { color: colors.text }]}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ressources spirituelles */}
        

        {/* Champ de saisie de message */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.messageInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Posez votre question sur la foi..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Ionicons 
              name="paper-plane" 
              size={20} 
              color={message.trim() ? "#ffffff" : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
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
    textAlign: 'center',
  },
  assistantCard: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  assistantCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assistantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  assistantInfo: {
    flex: 1,
  },
  assistantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  assistantSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  assistantCardRight: {
    padding: 8,
  },
  chatBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  chatMessage: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
    alignSelf: 'flex-end',
  },
  frequentQuestionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  questionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  questionButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  resourcesCard: {
    backgroundColor: '#f97316',
    borderRadius: 16,
    margin: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  resourcesHeader: {
    marginBottom: 16,
  },
  resourcesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  resourcesDescription: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 20,
    marginBottom: 30,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 15,
    fontSize: 16,
    color: '#374151',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
