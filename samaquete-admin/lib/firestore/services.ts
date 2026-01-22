import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
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
  ParishNews,
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
  // Utiliser setDoc pour créer le document (merge: false pour créer uniquement)
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: false });
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

export async function deleteParish(parishId: string): Promise<void> {
  const docRef = doc(db, "parishes", parishId);
  await deleteDoc(docRef);
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
  // Récupérer toutes les actualités et filtrer côté client pour éviter les index composites
  const q = query(collection(db, "news"));
  const snapshot = await getDocs(q);
  
  let news = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      createdAt: fromFirestoreDate(data.createdAt) || new Date(),
      updatedAt: fromFirestoreDate(data.updatedAt),
      publishedAt: fromFirestoreDate(data.publishedAt),
    };
  }) as News[];
  
  // Filtrer côté client
  if (parishId) {
    news = news.filter(n => n.parishId === parishId);
  }
  if (dioceseId) {
    news = news.filter(n => n.dioceseId === dioceseId);
  }
  if (status) {
    news = news.filter(n => n.status === status);
  }
  
  // Trier par date (plus récent en premier)
  news.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  
  return news;
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

// ========== ACTUALITÉS (parish_news) ==========
// Collection utilisée par l'app mobile
// Supporte les actualités de paroisse, diocèse et archidiocèse
export async function getParishNews(parishId?: string, published?: boolean): Promise<ParishNews[]> {
  // Récupérer toutes les actualités (sans orderBy pour éviter les index, on triera côté client)
  const q = query(collection(db, "parish_news"));
  const snapshot = await getDocs(q);
  
  let news = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      scope: (data.scope || "parish") as "parish" | "diocese" | "archdiocese",
      parishId: data.parishId || undefined,
      dioceseId: data.dioceseId || undefined,
      archdioceseId: data.archdioceseId || undefined,
      title: data.title || "",
      content: data.content || "",
      excerpt: data.excerpt || data.content?.substring(0, 150) || "",
      category: data.category || "Autre",
      published: data.published !== false, // Par défaut true si non défini
      image: data.image || data.imageUrl || "",
      author: data.author || "",
      showAuthor: data.showAuthor !== false,
      createdAt: fromFirestoreDate(data.createdAt),
      updatedAt: fromFirestoreDate(data.updatedAt),
    };
  }) as ParishNews[];
  
  // Filtrer côté client
  if (parishId) {
    // Pour une paroisse, on récupère :
    // 1. Les actualités de cette paroisse (scope: 'parish', parishId: parishId)
    // 2. Les actualités du diocèse de cette paroisse (scope: 'diocese', dioceseId: dioceseId)
    // 3. Les actualités de l'archidiocèse DAKAR (scope: 'archdiocese', archdioceseId: 'DAKAR')
    // Pour cela, on a besoin du dioceseId de la paroisse
    // Pour l'instant, on filtre juste par parishId (on améliorera avec getNewsForParish)
    news = news.filter(n => {
      if (n.scope === "parish") {
        return n.parishId === parishId;
      }
      // Pour diocèse et archidiocèse, on ne peut pas filtrer ici sans connaître le dioceseId
      // On retournera toutes les actualités diocésaines/archidiocésaines
      return n.scope === "diocese" || n.scope === "archdiocese";
    });
  }
  if (published !== undefined) {
    news = news.filter(n => n.published === published);
  }
  
  // Trier par date (plus récent en premier)
  news.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  
  return news;
}

/**
 * Récupère toutes les actualités visibles pour une paroisse donnée
 * Inclut : actualités de la paroisse + actualités du diocèse + actualités de l'archidiocèse DAKAR
 */
export async function getNewsForParish(
  parishId: string,
  dioceseId: string,
  published: boolean = true
): Promise<ParishNews[]> {
  const q = query(collection(db, "parish_news"));
  const snapshot = await getDocs(q);
  
  let news = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      scope: (data.scope || "parish") as "parish" | "diocese" | "archdiocese",
      parishId: data.parishId || undefined,
      dioceseId: data.dioceseId || undefined,
      archdioceseId: data.archdioceseId || undefined,
      title: data.title || "",
      content: data.content || "",
      excerpt: data.excerpt || data.content?.substring(0, 150) || "",
      category: data.category || "Autre",
      published: data.published !== false,
      image: data.image || data.imageUrl || "",
      author: data.author || "",
      showAuthor: data.showAuthor !== false,
      createdAt: fromFirestoreDate(data.createdAt),
      updatedAt: fromFirestoreDate(data.updatedAt),
    };
  }) as ParishNews[];
  
  // Filtrer : actualités de la paroisse OU du diocèse OU de l'archidiocèse DAKAR
  news = news.filter(n => {
    if (!n.published && published) return false;
    
    // Actualités de la paroisse
    if (n.scope === "parish" && n.parishId === parishId) return true;
    
    // Actualités du diocèse
    if (n.scope === "diocese" && n.dioceseId === dioceseId) return true;
    
    // Actualités de l'archidiocèse DAKAR (visibles partout)
    if (n.scope === "archdiocese" && n.archdioceseId === "DAKAR") return true;
    
    return false;
  });
  
  // Trier par date (plus récent en premier)
  news.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  
  return news;
}

export async function getParishNewsById(newsId: string): Promise<ParishNews | null> {
  const docRef = doc(db, "parish_news", newsId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    scope: (data.scope || "parish") as "parish" | "diocese" | "archdiocese",
    parishId: data.parishId || undefined,
    dioceseId: data.dioceseId || undefined,
    archdioceseId: data.archdioceseId || undefined,
    title: data.title || "",
    content: data.content || "",
    excerpt: data.excerpt || data.content?.substring(0, 150) || "",
    category: data.category || "Autre",
    published: data.published !== false,
    image: data.image || data.imageUrl || "",
    author: data.author || "",
    showAuthor: data.showAuthor !== false,
    createdAt: fromFirestoreDate(data.createdAt),
    updatedAt: fromFirestoreDate(data.updatedAt),
  };
}

export async function createParishNews(data: Omit<ParishNews, "id" | "createdAt" | "updatedAt">): Promise<string> {
  // Filtrer les champs undefined (Firestore ne les accepte pas)
  const firestoreData: any = {
    scope: data.scope || "parish",
    published: data.published !== false,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt || data.content?.substring(0, 150) || "",
    category: data.category || "Autre",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  // Ajouter seulement les champs définis (pas undefined)
  if (data.parishId !== undefined) {
    firestoreData.parishId = data.parishId;
  }
  if (data.dioceseId !== undefined) {
    firestoreData.dioceseId = data.dioceseId;
  }
  if (data.archdioceseId !== undefined) {
    firestoreData.archdioceseId = data.archdioceseId;
  }
  if (data.image !== undefined) {
    firestoreData.image = data.image;
  }
  if (data.author !== undefined) {
    firestoreData.author = data.author;
  }
  if (data.showAuthor !== undefined) {
    firestoreData.showAuthor = data.showAuthor;
  }
  
  const docRef = await addDoc(collection(db, "parish_news"), firestoreData);
  return docRef.id;
}

export async function updateParishNews(
  newsId: string,
  data: Partial<Omit<ParishNews, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "parish_news", newsId);
  
  // Filtrer les champs undefined (Firestore ne les accepte pas)
  const updateData: any = {
    updatedAt: Timestamp.now(),
  };
  
  // Ajouter seulement les champs définis (pas undefined)
  if (data.scope !== undefined) updateData.scope = data.scope;
  if (data.parishId !== undefined) updateData.parishId = data.parishId;
  if (data.dioceseId !== undefined) updateData.dioceseId = data.dioceseId;
  if (data.archdioceseId !== undefined) updateData.archdioceseId = data.archdioceseId;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.published !== undefined) updateData.published = data.published;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.author !== undefined) updateData.author = data.author;
  if (data.showAuthor !== undefined) updateData.showAuthor = data.showAuthor;
  
  await updateDoc(docRef, updateData);
}

export async function deleteParishNews(newsId: string): Promise<void> {
  const docRef = doc(db, "parish_news", newsId);
  await deleteDoc(docRef);
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
