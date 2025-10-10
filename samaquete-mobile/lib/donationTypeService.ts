import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';

export interface DonationType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  gradientColors?: [string, string];
  defaultAmounts?: [string, string, string, string];
  suggestedAmount?: number;
  isActive: boolean;
  diocese?: string;
  parishId?: string;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

export class DonationTypeService {
  private static collection = 'donation_types';

  // Récupérer tous les types de dons actifs
  static async getActiveTypes(): Promise<DonationType[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[];
    } catch (error) {
      console.error('Erreur lors de la récupération des types de dons:', error);
      return [];
    }
  }

  // Récupérer les types de dons actifs par paroisse
  static async getActiveTypesByParish(parishId: string): Promise<DonationType[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('parishId', '==', parishId),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[];
    } catch (error) {
      console.error('Erreur lors de la récupération des types de dons par paroisse:', error);
      return [];
    }
  }

  // Récupérer les types de dons actifs par diocèse
  static async getActiveTypesByDiocese(diocese: string): Promise<DonationType[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('diocese', '==', diocese),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[];
    } catch (error) {
      console.error('Erreur lors de la récupération des types de dons par diocèse:', error);
      return [];
    }
  }

  // Récupérer tous les types de dons (actifs et inactifs) par diocèse
  static async getAllTypesByDiocese(diocese: string): Promise<DonationType[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('diocese', '==', diocese),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[];
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les types de dons par diocèse:', error);
      return [];
    }
  }

  // Écouter les changements en temps réel des types de dons actifs
  static subscribeToActiveTypes(callback: (types: DonationType[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[];
      callback(types);
    });
  }

  // Écouter les changements en temps réel des types de dons actifs par paroisse
  static subscribeToActiveTypesByParish(
    parishId: string, 
    callback: (types: DonationType[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('parishId', '==', parishId),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[];
      callback(types);
    });
  }

  // Écouter les changements en temps réel des types de dons actifs par diocèse
  static subscribeToActiveTypesByDiocese(
    diocese: string, 
    callback: (types: DonationType[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, this.collection),
      where('diocese', '==', diocese),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DonationType[];
      callback(types);
    });
  }

  // Récupérer un type de don par ID
  static async getTypeById(id: string): Promise<DonationType | null> {
    try {
      const q = query(
        collection(db, this.collection),
        where('__name__', '==', id)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as DonationType;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du type de don par ID:', error);
      return null;
    }
  }
}
