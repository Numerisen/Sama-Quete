import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../lib/ThemeContext';
import { assistantService, AssistantResponse } from '../../../../lib/assistantService';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  confidence?: number;
  sources?: string[];
}

interface AssistantScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export default function AssistantScreenEnhanced({ setCurrentScreen }: AssistantScreenProps) {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Message de bienvenue initial
  useEffect(() => {
    // Configurer l'URL de l'API assistant (ngrok ou production)
    const apiUrl = process.env.EXPO_PUBLIC_ASSISTANT_API_URL || 'https://16ebbdd7cdcb.ngrok-free.app';
    assistantService.setBaseUrl(apiUrl);
    console.log('🔗 Assistant API URL configurée:', apiUrl);
    
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Paix du Christ ! Je suis votre assistant spirituel. Comment puis-je vous aider dans votre cheminement de foi aujourd'hui ?",
      isUser: false,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
    
    // Charger les suggestions
    loadSuggestions();
    
    // Vérifier la connexion
    checkConnection();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await assistantService.getSuggestions();
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error);
      // Suggestions par défaut
      setSuggestions([
        "Qu'est-ce que la Pentecôte ?",
        "Comment prier le rosaire ?",
        "Sens du carême",
        "Saints du Sénégal",
        "Préparation au baptême",
        "Signification de l'Eucharistie"
      ]);
    }
  };

  const checkConnection = async () => {
    try {
      const isHealthy = await assistantService.checkHealth();
      setIsConnected(isHealthy);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setIsConnected(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response: AssistantResponse = await assistantService.askQuestion(message.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        isUser: false,
        timestamp: response.timestamp,
        confidence: response.confidence,
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je ne peux pas répondre pour le moment. Veuillez vérifier votre connexion ou réessayer plus tard.",
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      Alert.alert(
        'Erreur',
        'Impossible de contacter l\'assistant IA. Vérifiez votre connexion internet.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionPress = (question: string) => {
    setMessage(question);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (msg: Message) => (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.isUser ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: msg.isUser ? colors.primary : colors.card,
            alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: msg.isUser ? '#ffffff' : colors.text },
          ]}
        >
          {msg.text}
        </Text>
        
        {!msg.isUser && msg.confidence && (
          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
              Confiance: {Math.round(msg.confidence * 100)}%
            </Text>
          </View>
        )}
        
        {!msg.isUser && msg.sources && msg.sources.length > 0 && (
          <View style={styles.sourcesContainer}>
            <Text style={[styles.sourcesTitle, { color: colors.textSecondary }]}>
              Sources:
            </Text>
            {msg.sources.map((source, index) => (
              <Text key={index} style={[styles.sourceText, { color: colors.textSecondary }]}>
                • {source}
              </Text>
            ))}
          </View>
        )}
        
        <Text
          style={[
            styles.messageTime,
            { color: msg.isUser ? '#ffffff' : colors.textSecondary },
          ]}
        >
          {formatTime(msg.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={colors.header as any} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>IA spirituelle</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? '#10b981' : '#ef4444' },
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ref={(ref) => {
            if (ref) {
              setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
            }
          }}
        >
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={[styles.messageBubble, { backgroundColor: colors.card }]}>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    L'assistant réfléchit...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {suggestions.length > 0 && messages.length <= 1 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.suggestionsTitle, { color: colors.text }]}>
              Questions fréquentes
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.suggestionsList}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionButton, { backgroundColor: colors.card }]}
                    onPress={() => handleQuestionPress(suggestion)}
                  >
                    <Text style={[styles.suggestionText, { color: colors.text }]}>
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Posez votre question sur la foi..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: message.trim() && !isLoading ? colors.primary : colors.border,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons
                name="paper-plane"
                size={20}
                color={message.trim() && !isLoading ? "#ffffff" : colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
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
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  confidenceContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  confidenceText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sourcesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    marginLeft: 8,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  messageInput: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
});
