import { useState, useEffect, useCallback } from 'react';
import { 
  ParishService, 
  NewsService, 
  LiturgyService, 
  NotificationService,
  DataSyncService,
  Parish,
  News,
  Liturgy,
  Notification
} from '../lib/dataServices';

// Hook pour gérer les paroisses
export const useParishes = () => {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = ParishService.subscribeToParishes((data) => {
      setParishes(data);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const getParishById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const parish = await ParishService.getParishById(id);
      return parish;
    } catch (err) {
      setError('Erreur lors de la récupération de la paroisse');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { parishes, loading, error, getParishById };
};

// Hook pour gérer les actualités
export const useNews = (parishId?: string) => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NewsService.subscribeToNews((data) => {
      setNews(data);
      setLoading(false);
      setError(null);
    }, parishId);

    return unsubscribe;
  }, [parishId]);

  return { news, loading, error };
};

// Hook pour gérer la liturgie
export const useLiturgy = (parishId?: string) => {
  const [todayLiturgy, setTodayLiturgy] = useState<Liturgy | null>(null);
  const [weeklyLiturgy, setWeeklyLiturgy] = useState<Liturgy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodayLiturgy = useCallback(async () => {
    try {
      setLoading(true);
      const liturgy = await LiturgyService.getTodayLiturgy(parishId);
      setTodayLiturgy(liturgy);
    } catch (err) {
      setError('Erreur lors de la récupération de la liturgie du jour');
    } finally {
      setLoading(false);
    }
  }, [parishId]);

  const loadWeeklyLiturgy = useCallback(async () => {
    try {
      setLoading(true);
      const liturgy = await LiturgyService.getWeeklyLiturgy(parishId);
      setWeeklyLiturgy(liturgy);
    } catch (err) {
      setError('Erreur lors de la récupération de la liturgie hebdomadaire');
    } finally {
      setLoading(false);
    }
  }, [parishId]);

  useEffect(() => {
    loadTodayLiturgy();
    loadWeeklyLiturgy();
  }, [loadTodayLiturgy, loadWeeklyLiturgy]);

  return { 
    todayLiturgy, 
    weeklyLiturgy, 
    loading, 
    error, 
    refreshToday: loadTodayLiturgy,
    refreshWeekly: loadWeeklyLiturgy
  };
};

// Hook pour gérer les notifications
export const useNotifications = (parishId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NotificationService.subscribeToNotifications((data) => {
      setNotifications(data);
      setLoading(false);
      setError(null);
    }, parishId);

    return unsubscribe;
  }, [parishId]);

  return { notifications, loading, error };
};

// Hook principal pour la synchronisation des données
export const useDataSync = (parishId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSync = async () => {
      try {
        const unsubscribe = await DataSyncService.initializeDataSync(parishId);
        setIsConnected(true);
        setError(null);

        return unsubscribe;
      } catch (err) {
        setError('Erreur de connexion aux données');
        setIsConnected(false);
        return () => {};
      }
    };

    const cleanup = initializeSync();
    
    return () => {
      cleanup.then(unsubscribe => unsubscribe());
    };
  }, [parishId]);

  return { isConnected, error };
};

// Hook pour gérer l'état global de l'application
export const useAppData = (selectedParishId?: string) => {
  const { parishes, loading: parishesLoading, error: parishesError } = useParishes();
  const { news, loading: newsLoading, error: newsError } = useNews(selectedParishId);
  const { todayLiturgy, weeklyLiturgy, loading: liturgyLoading, error: liturgyError } = useLiturgy(selectedParishId);
  const { notifications, loading: notificationsLoading, error: notificationsError } = useNotifications(selectedParishId);
  const { isConnected, error: syncError } = useDataSync(selectedParishId);

  const loading = parishesLoading || newsLoading || liturgyLoading || notificationsLoading;
  const error = parishesError || newsError || liturgyError || notificationsError || syncError;

  return {
    // Données
    parishes,
    news,
    todayLiturgy,
    weeklyLiturgy,
    notifications,
    
    // État
    loading,
    error,
    isConnected,
    
    // Paroisse sélectionnée
    selectedParish: parishes.find(p => p.id === selectedParishId),
  };
};
