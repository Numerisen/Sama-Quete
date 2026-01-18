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
  const [isWarmingUp, setIsWarmingUp] = useState(true);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Message de bienvenue initial
  useEffect(() => {
    // Configurer l'URL de l'API RAG FastAPI (ngrok ou production)
    // Par défaut: URL Render stable (localhost n'est pas accessible depuis un téléphone)
    const apiUrl = process.env.EXPO_PUBLIC_ASSISTANT_API_URL || 'https://sama-quete.onrender.com';
    assistantService.setBaseUrl(apiUrl);
    console.log('🔗 RAG FastAPI URL configurée:', apiUrl);
    
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Bonjour ! Je suis votre assistant spirituel. Comment puis-je vous aider dans votre cheminement de foi aujourd'hui ?",
      isUser: false,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
    
    // Charger les suggestions
    loadSuggestions();
    
    // Warmup Render Free: pré-initialiser en arrière-plan pour éviter les 502 au 1er message
    // Warmup best-effort: même si ça échoue, on ne bloque pas l'UI indéfiniment.
    assistantService
      .warmup()
      .finally(() => {
        setIsWarmingUp(false);
        checkConnection();
      });
  }, []);

  // Scroller automatiquement vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

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

  // Détecter si c'est une simple salutation
  const isSimpleGreeting = (text: string): boolean => {
    const greetings = ['bonjour', 'salut', 'bonsoir', 'bonne nuit', 'hello', 'hi', 'hey', 'coucou'];
    const normalizedText = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // enlever les accents
      .replace(/[^\p{L}\p{N}\s]/gu, '') // enlever ponctuation/emoji
      .replace(/\s+/g, ' ')
      .trim();
    // ex: "Bonjouurrr" -> "bonjour"
    const collapsed = normalizedText.replace(/(.)\1+/g, '$1');
    return greetings.some(greeting => collapsed === greeting || collapsed.startsWith(greeting + ' '));
  };

  // Si une question est en attente, l'envoyer automatiquement dès que le warmup est fini
  useEffect(() => {
    const run = async () => {
      if (!pendingQuestion) return;
      if (isLoading) return;

      // Si on est encore en warmup, on tente un warmup best-effort puis on continue.
      // On ne doit jamais rester bloqué indéfiniment sur "j'initialise...".
      if (isWarmingUp) {
        await assistantService.warmup();
        setIsWarmingUp(false);
      }

      const q = pendingQuestion;
      setPendingQuestion(null);
      setIsLoading(true);
      try {
        const response: AssistantResponse = await assistantService.askQuestion(q);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.answer || 'Aucune réponse reçue',
          isUser: false,
          timestamp: response.timestamp,
          sources: response.sources,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: errorMsg || "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer.",
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [isWarmingUp, pendingQuestion, isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Stocker la question avant de vider le champ
    const questionText = message.trim();
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: questionText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Si c'est une simple salutation, répondre directement sans appeler le RAG
      if (isSimpleGreeting(questionText)) {
        const greetingResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Bonjour ! Je suis là pour vous aider dans votre cheminement de foi. Posez-moi une question sur la Bible, la foi chrétienne, ou tout autre sujet spirituel.",
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, greetingResponse]);
        setIsLoading(false);
        return;
      }

      // Si le warmup est encore en cours, éviter d'appeler /query trop tôt (cause de 502 sur Render Free)
      if (isWarmingUp) {
        // Ne pas spammer le chat si l'utilisateur tape plusieurs fois.
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.text?.includes("J'initialise le service")) return prev;
          return [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              text: "J'initialise le service… j'envoie votre question dès que c'est prêt.",
              isUser: false,
              timestamp: new Date().toISOString(),
            },
          ];
        });
        // Écraser la pending question par la dernière (la plus récente)
        setPendingQuestion(questionText);
        setIsLoading(false);
        return;
      }

      console.log('📤 Envoi de la question depuis handleSendMessage:', questionText);
      const response: AssistantResponse = await assistantService.askQuestion(questionText);
      
      console.log('✅ Réponse reçue dans handleSendMessage:', {
        hasAnswer: !!response.answer,
        answerLength: response.answer?.length || 0,
        sourcesCount: response.sources?.length || 0
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer || 'Aucune réponse reçue',
        isUser: false,
        timestamp: response.timestamp,
        sources: response.sources,
      };

      console.log('📝 Ajout du message assistant à l\'état:', {
        id: assistantMessage.id,
        textLength: assistantMessage.text.length,
        textPreview: assistantMessage.text.substring(0, 50) + '...'
      });

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        console.log('📋 Total de messages après ajout:', newMessages.length);
        return newMessages;
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Erreur lors de l\'envoi du message:', {
        error: errorMsg,
        fullError: error,
        apiUrl: assistantService.getBaseUrl()
      });
      
      // Message d'erreur user-friendly (déjà nettoyé par assistantService en production)
      // En développement, on peut afficher plus de détails
      const isProdMode = !__DEV__ || (!assistantService.getBaseUrl().includes('localhost') && !assistantService.getBaseUrl().includes('ngrok'));
      
      let userErrorMessage = "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer.";
      
      // En production, le message est déjà nettoyé par assistantService
      // En développement, on peut être plus spécifique
      if (!isProdMode) {
        if (errorMsg.includes('ERR_NGROK') || errorMsg.includes('offline') || errorMsg.includes('ngrok')) {
          userErrorMessage = "Le tunnel ngrok n'est pas actif. Veuillez redémarrer ngrok ou utiliser une autre URL.";
        } else if (errorMsg.includes('503') || errorMsg.includes('temporairement indisponible')) {
          userErrorMessage = "Le service est temporairement surchargé. Veuillez réessayer dans quelques instants.";
        } else if (errorMsg.includes('429') || errorMsg.includes('Trop de requêtes')) {
          userErrorMessage = "Trop de requêtes. Veuillez patienter un moment avant de réessayer.";
        } else if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
          userErrorMessage = "Erreur de connexion réseau. Vérifiez votre connexion internet.";
        } else if (errorMsg.includes('404')) {
          userErrorMessage = "L'API RAG n'est pas accessible. Vérifiez la configuration.";
        } else if (errorMsg.includes('500')) {
          userErrorMessage = "Erreur interne du serveur. Veuillez réessayer plus tard.";
        } else if (errorMsg) {
          // Limiter la longueur et nettoyer
          userErrorMessage = errorMsg.length > 150 ? errorMsg.substring(0, 150) + '...' : errorMsg;
        }
      } else {
        // En production, utiliser directement le message (déjà nettoyé)
        userErrorMessage = errorMsg || userErrorMessage;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: userErrorMessage,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      // En production, ne pas afficher l'URL de l'API dans l'alerte
      const alertMessage = isProdMode 
        ? userErrorMessage 
        : `${userErrorMessage}\n\nURL API: ${assistantService.getBaseUrl()}`;
      
      Alert.alert(
        'Erreur de connexion',
        alertMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionPress = async (question: string) => {
    console.log('🔘 Question sélectionnée (Enhanced):', question);
    // Mettre la question dans le champ ET l'envoyer automatiquement
    setMessage(question);
    
    // Attendre un court instant pour que le state se mette à jour, puis envoyer
    setTimeout(async () => {
      // Créer le message utilisateur
      const userMessage: Message = {
        id: Date.now().toString(),
        text: question,
        isUser: true,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsLoading(true);

      try {
        // Si c'est une simple salutation, répondre directement sans appeler le RAG
        if (isSimpleGreeting(question)) {
          const greetingResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: "Bonjour ! Je suis là pour vous aider dans votre cheminement de foi. Posez-moi une question sur la Bible, la foi chrétienne, ou tout autre sujet spirituel.",
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, greetingResponse]);
          setIsLoading(false);
          return;
        }

        if (isWarmingUp) {
          const waitMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "J'initialise le service… j'envoie votre question dès que c'est prêt.",
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, waitMessage]);
          setPendingQuestion(question);
          setIsLoading(false);
          return;
        }

        console.log('📤 Envoi automatique de la question:', question);
        const response: AssistantResponse = await assistantService.askQuestion(question);
        
        console.log('✅ Réponse reçue (auto-send):', {
          hasAnswer: !!response.answer,
          answerLength: response.answer?.length || 0,
        });
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.answer || 'Aucune réponse reçue',
          isUser: false,
          timestamp: response.timestamp,
          sources: response.sources,
        };

        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          console.log('📋 Total de messages (auto-send):', newMessages.length);
          return newMessages;
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ Erreur (auto-send):', errorMsg);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Erreur: ${errorMsg.substring(0, 100)}`,
          isUser: false,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, 100);
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
        </View>
      </LinearGradient>

      {/* Messages et Input avec KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContent}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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

          {/* Input - Toujours visible en bas */}
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
              returnKeyType="send"
              blurOnSubmit={false}
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
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    minHeight: 70,
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
