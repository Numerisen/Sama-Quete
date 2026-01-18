import { useState, useEffect, useCallback } from 'react';
import { liturgyApiService, CachedLiturgyData } from '../lib/liturgyApiService';

export function useLiturgyApi() {
  const [todayLiturgy, setTodayLiturgy] = useState<CachedLiturgyData | null>(null);
  // On démarre en "loading" pour éviter le flash "Aucune donnée..." au premier rendu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await liturgyApiService.getTodayLiturgy();
      setTodayLiturgy(data);
      setLastSync(new Date().toISOString());
      setIsOnline(true);
    } catch (err) {
      setError(err as Error);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const forceSync = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await liturgyApiService.forceSync();
      if (success) {
        const data = await liturgyApiService.getTodayLiturgy();
        setTodayLiturgy(data);
        setLastSync(new Date().toISOString());
        setIsOnline(true);
        return true;
      }
      return false;
    } catch (err) {
      setError(err as Error);
      setIsOnline(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const setApiUrl = useCallback((url: string) => {
    liturgyApiService.setBaseUrl(url);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    todayLiturgy,
    loading,
    error,
    isOnline,
    lastSync,
    refresh,
    forceSync,
    setApiUrl
  };
}