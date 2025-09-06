import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Types de données
export interface Parish {
  id: string;
  name: string;
  location: string;
  diocese: string;
  pricing: {
    quete: string[];
    denier: string[];
    cierge: string[];
    messe: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  parishId?: string;
  dioceseId?: string;
  imageUrl?: string;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Liturgy {
  id: string;
  date: string;
  title: string;
  firstReading: string;
  psalm: string;
  secondReading?: string;
  gospel: string;
  reflection: string;
  parishId?: string;
  dioceseId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Donation {
  id: string;
  userId: string;
  parishId: string;
  type: 'quete' | 'denier' | 'cierge' | 'messe';
  amount: number;
  customAmount?: number;
  message?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'actualites' | 'textesLiturgiques' | 'lecturesDuJour' | 'prieresSemaine' | 'dons' | 'evenements';
  parishId?: string;
  dioceseId?: string;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Service pour les paroisses
export class ParishService {
  static async getAllParishes(): Promise<Parish[]> {
    try {
      const parishesRef = collection(db, 'parishes');
      const snapshot = await getDocs(parishesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Parish[];
    } catch (error) {
      console.error('Erreur lors de la récupération des paroisses:', error);
      return [];
    }
  }

  static async getParishById(id: string): Promise<Parish | null> {
    try {
      const parishRef = doc(db, 'parishes', id);
      const snapshot = await getDoc(parishRef);
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Parish;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la paroisse:', error);
      return null;
    }
  }

  static subscribeToParishes(callback: (parishes: Parish[]) => void) {
    const parishesRef = collection(db, 'parishes');
    const q = query(parishesRef, orderBy('name'));
    
    return onSnapshot(q, (snapshot) => {
      const parishes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Parish[];
      callback(parishes);
    });
  }
}

// Service pour les actualités
export class NewsService {
  static async getPublishedNews(parishId?: string): Promise<News[]> {
    try {
      const newsRef = collection(db, 'news');
      let q = query(
        newsRef, 
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      if (parishId) {
        q = query(
          newsRef,
          where('published', '==', true),
          where('parishId', '==', parishId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as News[];
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error);
      return [];
    }
  }

  static subscribeToNews(callback: (news: News[]) => void, parishId?: string) {
    const newsRef = collection(db, 'news');
    let q = query(
      newsRef,
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    if (parishId) {
      q = query(
        newsRef,
        where('published', '==', true),
        where('parishId', '==', parishId),
        orderBy('createdAt', 'desc')
      );
    }
    
    return onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as News[];
      callback(news);
    });
  }
}

// Service pour la liturgie
export class LiturgyService {
  static async getTodayLiturgy(parishId?: string): Promise<Liturgy | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const liturgyRef = collection(db, 'liturgy');
      let q = query(
        liturgyRef,
        where('date', '==', today)
      );
      
      if (parishId) {
        q = query(
          liturgyRef,
          where('date', '==', today),
          where('parishId', '==', parishId)
        );
      }
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Liturgy;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la liturgie:', error);
      return null;
    }
  }

  static async getWeeklyLiturgy(parishId?: string): Promise<Liturgy[]> {
    try {
      const liturgyRef = collection(db, 'liturgy');
      let q = query(
        liturgyRef,
        orderBy('date', 'desc')
      );
      
      if (parishId) {
        q = query(
          liturgyRef,
          where('parishId', '==', parishId),
          orderBy('date', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, 7).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Liturgy[];
    } catch (error) {
      console.error('Erreur lors de la récupération de la liturgie hebdomadaire:', error);
      return [];
    }
  }
}

// Service pour les dons
export class DonationService {
  static async createDonation(donation: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const donationsRef = collection(db, 'donations');
      const docRef = await addDoc(donationsRef, {
        ...donation,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du don:', error);
      return null;
    }
  }

  static async getUserDonations(userId: string): Promise<Donation[]> {
    try {
      const donationsRef = collection(db, 'donations');
      const q = query(
        donationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donation[];
    } catch (error) {
      console.error('Erreur lors de la récupération des dons:', error);
      return [];
    }
  }
}

// Service pour les notifications
export class NotificationService {
  static async getPublishedNotifications(parishId?: string): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      let q = query(
        notificationsRef,
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      if (parishId) {
        q = query(
          notificationsRef,
          where('published', '==', true),
          where('parishId', '==', parishId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  static subscribeToNotifications(callback: (notifications: Notification[]) => void, parishId?: string) {
    const notificationsRef = collection(db, 'notifications');
    let q = query(
      notificationsRef,
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    if (parishId) {
      q = query(
        notificationsRef,
        where('published', '==', true),
        where('parishId', '==', parishId),
        orderBy('createdAt', 'desc')
      );
    }
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    });
  }
}

// Service principal pour la synchronisation
export class DataSyncService {
  static async initializeDataSync(parishId?: string) {
    // Initialiser la synchronisation des données
    const unsubscribeFunctions: (() => void)[] = [];

    // Synchroniser les paroisses
    const unsubscribeParishes = ParishService.subscribeToParishes((parishes) => {
      // Mettre à jour le cache local ou le state
      console.log('Paroisses mises à jour:', parishes);
    });

    // Synchroniser les actualités
    const unsubscribeNews = NewsService.subscribeToNews((news) => {
      console.log('Actualités mises à jour:', news);
    }, parishId);

    // Synchroniser les notifications
    const unsubscribeNotifications = NotificationService.subscribeToNotifications((notifications) => {
      console.log('Notifications mises à jour:', notifications);
    }, parishId);

    unsubscribeFunctions.push(unsubscribeParishes, unsubscribeNews, unsubscribeNotifications);

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }
}
