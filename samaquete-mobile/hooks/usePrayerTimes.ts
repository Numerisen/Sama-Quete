import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PrayerTime {
  id: string;
  name: string;
  time: string;
  days: string[];
  active: boolean;
  description?: string;
  parishId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UsePrayerTimesResult {
  prayerTimes: PrayerTime[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePrayerTimes(parishId: string): UsePrayerTimesResult {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!parishId) {
      setLoading(false);
      return;
    }

    console.log('🔍 Recherche des heures de prières pour parishId:', parishId);

    setLoading(true);
    setError(null);

    // Créer une requête pour les heures de prières de la paroisse
    // Note: On filtre par parishId uniquement, puis on filtre active côté client
    // pour éviter de créer un index composite
    const q = query(
      collection(db, 'parish_prayer_times'),
      where('parishId', '==', parishId)
    );

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📊 Nombre de documents trouvés:', snapshot.size);
        
        const times: PrayerTime[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as PrayerTime;
          console.log('📝 Heure de prière trouvée:', {
            id: doc.id,
            name: data.name,
            time: data.time,
            active: data.active,
            parishId: data.parishId
          });
          
          // Filtrer uniquement les heures actives côté client
          if (data.active) {
            times.push({
              ...data,
              id: doc.id,
            });
          }
        });

        // Trier par heure côté client
        times.sort((a, b) => {
          if (a.time < b.time) return -1;
          if (a.time > b.time) return 1;
          return 0;
        });

        console.log('✅ Heures de prières actives:', times.length);
        setPrayerTimes(times);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur lors de la récupération des heures de prières:', err);
        setError('Impossible de charger les heures de prières');
        setLoading(false);
      }
    );

    // Nettoyer l'abonnement quand le composant est démonté
    return () => unsubscribe();
  }, [parishId, refreshKey]);

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    prayerTimes,
    loading,
    error,
    refresh
  };
}

// Fonction utilitaire pour obtenir les heures de prières d'un jour spécifique
export function getPrayerTimesForDay(prayerTimes: PrayerTime[], dayName: string): PrayerTime[] {
  return prayerTimes.filter(prayer => prayer.days.includes(dayName));
}

// Fonction utilitaire pour obtenir le programme de la semaine
export function getWeeklySchedule(prayerTimes: PrayerTime[]): {
  day: string;
  time: string;
  type: string;
  description?: string;
  isToday: boolean;
}[] {
  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = new Date().getDay();
  const todayName = daysOfWeek[today];

  const schedule: {
    day: string;
    time: string;
    type: string;
    description?: string;
    isToday: boolean;
  }[] = [];

  daysOfWeek.forEach((day) => {
    const dayPrayers = getPrayerTimesForDay(prayerTimes, day);
    
    if (dayPrayers.length > 0) {
      dayPrayers.forEach(prayer => {
        schedule.push({
          day,
          time: prayer.time,
          type: prayer.name,
          description: prayer.description,
          isToday: day === todayName
        });
      });
    }
  });

  return schedule;
}
