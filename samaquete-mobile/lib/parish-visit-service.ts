import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export type ParishVisitTotalsMap = Record<string, { count: number; lastVisitAt?: Timestamp }>;

/**
 * Stats globales (tous utilisateurs) des visites de paroisses.
 * Collection: parish_visit_totals
 * Doc id: parishId
 * Fields: parishId, count, lastVisitAt, updatedAt
 */
export class ParishVisitService {
  static async incrementParish(parishId: string): Promise<void> {
    const ref = doc(db, 'parish_visit_totals', parishId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        tx.set(ref, {
          parishId,
          count: 1,
          lastVisitAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      }

      const data = snap.data() as any;
      const prev = typeof data?.count === 'number' ? data.count : 0;
      tx.update(ref, {
        count: prev + 1,
        lastVisitAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  }

  static async getTotals(): Promise<ParishVisitTotalsMap> {
    const snapshot = await getDocs(collection(db, 'parish_visit_totals'));
    const map: ParishVisitTotalsMap = {};
    snapshot.forEach((d) => {
      const data = d.data() as any;
      map[d.id] = {
        count: typeof data?.count === 'number' ? data.count : 0,
        lastVisitAt: data?.lastVisitAt,
      };
    });
    return map;
  }

  static subscribeTotals(callback: (map: ParishVisitTotalsMap) => void): Unsubscribe {
    return onSnapshot(collection(db, 'parish_visit_totals'), (snapshot) => {
      const map: ParishVisitTotalsMap = {};
      snapshot.forEach((d) => {
        const data = d.data() as any;
        map[d.id] = {
          count: typeof data?.count === 'number' ? data.count : 0,
          lastVisitAt: data?.lastVisitAt,
        };
      });
      callback(map);
    });
  }
}


