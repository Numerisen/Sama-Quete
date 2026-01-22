import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Diocese,
  Parish,
  Church,
  News,
  DonationType,
  Notification,
  Activity,
  Prayer,
  ContentStatus,
} from "@/types";

// Helper pour convertir les dates
function toFirestoreDate(date: Date | undefined): Timestamp | undefined {
  return date ? Timestamp.fromDate(date) : undefined;
}

function fromFirestoreDate(timestamp: Timestamp | undefined): Date | undefined {
  return timestamp ? timestamp.toDate() : undefined;
}

// ========== DIOCÈSES ==========
export async function getDioceses(): Promise<Diocese[]> {
  const q = query(collection(db, "dioceses"), orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: fromFirestoreDate(doc.data().createdAt),
    updatedAt: fromFirestoreDate(doc.data().updatedAt),
  })) as Diocese[];
}

export async function getDiocese(dioceseId: string): Promise<Diocese | null> {
  const docRef = doc(db, "dioceses", dioceseId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    createdAt: fromFirestoreDate(data.createdAt),
    updatedAt: fromFirestoreDate(data.updatedAt),
  } as Diocese;
}

export async function createDiocese(data: Omit<Diocese, "createdAt" | "updatedAt">): Promise<void> {
  const docRef = doc(db, "dioceses", data.dioceseId);
  await updateDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// ========== PAROISSES ==========
export async function getParishes(dioceseId?: string): Promise<Parish[]> {
  // Récupérer toutes les paroisses et filtrer côté client pour éviter les index composites
  const q = query(collection(db, "parishes"));
  const snapshot = await getDocs(q);
  
  let parishes = snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: fromFirestoreDate(doc.data().createdAt),
    updatedAt: fromFirestoreDate(doc.data().updatedAt),
  })) as Parish[];
  
  // Filtrer côté client si dioceseId est fourni
  if (dioceseId) {
    parishes = parishes.filter(p => p.dioceseId === dioceseId);
  }
  
  // Trier par nom
  parishes.sort((a, b) => a.name.localeCompare(b.name));
  
  return parishes;
}

export async function getParish(parishId: string): Promise<Parish | null> {
  const docRef = doc(db, "parishes", parishId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    createdAt: fromFirestoreDate(data.createdAt),
    updatedAt: fromFirestoreDate(data.updatedAt),
  } as Parish;
}

export async function createParish(data: Omit<Parish, "createdAt" | "updatedAt">): Promise<string> {
  const docRef = doc(db, "parishes", data.parishId);
  await updateDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return data.parishId;
}

export async function updateParish(
  parishId: string,
  data: Partial<Omit<Parish, "parishId" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "parishes", parishId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ========== ÉGLISES ==========
export async function getChurches(parishId?: string, dioceseId?: string): Promise<Church[]> {
  // Récupérer toutes les églises et filtrer côté client pour éviter les index composites
  const q = query(collection(db, "churches"));
  const snapshot = await getDocs(q);
  
  let churches = snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: fromFirestoreDate(doc.data().createdAt),
    updatedAt: fromFirestoreDate(doc.data().updatedAt),
  })) as Church[];
  
  // Filtrer côté client
  if (parishId) {
    churches = churches.filter(c => c.parishId === parishId);
  }
  if (dioceseId) {
    churches = churches.filter(c => c.dioceseId === dioceseId);
  }
  
  // Trier par nom
  churches.sort((a, b) => a.name.localeCompare(b.name));
  
  return churches;
}

export async function getChurch(churchId: string): Promise<Church | null> {
  const docRef = doc(db, "churches", churchId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    createdAt: fromFirestoreDate(data.createdAt),
    updatedAt: fromFirestoreDate(data.updatedAt),
  } as Church;
}

export async function createChurch(data: Omit<Church, "createdAt" | "updatedAt">): Promise<string> {
  const docRef = doc(db, "churches", data.churchId);
  await updateDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return data.churchId;
}

export async function updateChurch(
  churchId: string,
  data: Partial<Omit<Church, "churchId" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "churches", churchId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ========== ACTUALITÉS ==========
export async function getNews(
  parishId?: string,
  dioceseId?: string,
  status?: ContentStatus
): Promise<News[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (parishId) {
    constraints.unshift(where("parishId", "==", parishId));
  }
  if (dioceseId) {
    constraints.unshift(where("dioceseId", "==", dioceseId));
  }
  if (status) {
    constraints.unshift(where("status", "==", status));
  }
  const q = query(collection(db, "news"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      createdAt: fromFirestoreDate(data.createdAt) || new Date(),
      updatedAt: fromFirestoreDate(data.updatedAt),
      publishedAt: fromFirestoreDate(data.publishedAt),
    };
  }) as News[];
}

export async function createNews(data: Omit<News, "newsId" | "createdAt" | "updatedAt" | "publishedAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "news"), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    publishedAt: data.status === "published" ? Timestamp.now() : null,
  });
  return docRef.id;
}

export async function updateNews(
  newsId: string,
  data: Partial<Omit<News, "newsId" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "news", newsId);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  if (data.status === "published" && !data.publishedAt) {
    updateData.publishedAt = Timestamp.now();
  }
  await updateDoc(docRef, updateData);
}

// ========== TYPES DE DONS ==========
export async function getDonationTypes(parishId?: string): Promise<DonationType[]> {
  const constraints: QueryConstraint[] = [orderBy("order")];
  if (parishId) {
    constraints.unshift(where("parishId", "==", parishId));
  }
  const q = query(collection(db, "donation_types"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: fromFirestoreDate(doc.data().createdAt),
    updatedAt: fromFirestoreDate(doc.data().updatedAt),
  })) as DonationType[];
}

export async function createDonationType(
  data: Omit<DonationType, "donationTypeId" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "donation_types"), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateDonationType(
  donationTypeId: string,
  data: Partial<Omit<DonationType, "donationTypeId" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "donation_types", donationTypeId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ========== NOTIFICATIONS ==========
export async function getNotifications(
  parishId?: string,
  dioceseId?: string,
  status?: ContentStatus
): Promise<Notification[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (parishId) {
    constraints.unshift(where("parishId", "==", parishId));
  }
  if (dioceseId) {
    constraints.unshift(where("dioceseId", "==", dioceseId));
  }
  if (status) {
    constraints.unshift(where("status", "==", status));
  }
  const q = query(collection(db, "notifications"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      createdAt: fromFirestoreDate(data.createdAt) || new Date(),
      publishedAt: fromFirestoreDate(data.publishedAt),
    };
  }) as Notification[];
}

export async function createNotification(
  data: Omit<Notification, "notificationId" | "createdAt" | "publishedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "notifications"), {
    ...data,
    createdAt: Timestamp.now(),
    publishedAt: data.status === "published" ? Timestamp.now() : null,
  });
  return docRef.id;
}

export async function updateNotification(
  notificationId: string,
  data: Partial<Omit<Notification, "notificationId" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "notifications", notificationId);
  const updateData: any = {
    ...data,
  };
  if (data.status === "published" && !data.publishedAt) {
    updateData.publishedAt = Timestamp.now();
  }
  await updateDoc(docRef, updateData);
}

// ========== ACTIVITÉS ==========
export async function getActivities(
  parishId?: string,
  dioceseId?: string,
  status?: ContentStatus
): Promise<Activity[]> {
  const constraints: QueryConstraint[] = [orderBy("date", "desc")];
  if (parishId) {
    constraints.unshift(where("parishId", "==", parishId));
  }
  if (dioceseId) {
    constraints.unshift(where("dioceseId", "==", dioceseId));
  }
  if (status) {
    constraints.unshift(where("status", "==", status));
  }
  const q = query(collection(db, "activities"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      date: fromFirestoreDate(data.date) || new Date(),
      createdAt: fromFirestoreDate(data.createdAt) || new Date(),
      updatedAt: fromFirestoreDate(data.updatedAt),
    };
  }) as Activity[];
}

export async function createActivity(
  data: Omit<Activity, "activityId" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "activities"), {
    ...data,
    date: toFirestoreDate(data.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateActivity(
  activityId: string,
  data: Partial<Omit<Activity, "activityId" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "activities", activityId);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  if (data.date) {
    updateData.date = toFirestoreDate(data.date);
  }
  await updateDoc(docRef, updateData);
}

// ========== PRIÈRES ==========
export async function getPrayers(
  parishId?: string,
  dioceseId?: string,
  status?: ContentStatus
): Promise<Prayer[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (parishId) {
    constraints.unshift(where("parishId", "==", parishId));
  }
  if (dioceseId) {
    constraints.unshift(where("dioceseId", "==", dioceseId));
  }
  if (status) {
    constraints.unshift(where("status", "==", status));
  }
  const q = query(collection(db, "prayers"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      createdAt: fromFirestoreDate(data.createdAt) || new Date(),
      updatedAt: fromFirestoreDate(data.updatedAt),
    };
  }) as Prayer[];
}

export async function createPrayer(
  data: Omit<Prayer, "prayerId" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "prayers"), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updatePrayer(
  prayerId: string,
  data: Partial<Omit<Prayer, "prayerId" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "prayers", prayerId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}
