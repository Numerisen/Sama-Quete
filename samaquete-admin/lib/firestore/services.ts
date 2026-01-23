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
  PrayerTime,
  ContentStatus,
} from "@/types";

// ========== HELPERS ==========
function fromFirestoreDate(timestamp: any): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
}

function ensureDb() {
  if (!db) {
    throw new Error('Firestore n\'est pas initialisé')
  }
  return db
}

// ========== DIOCESES ==========
export async function getDioceses(): Promise<Diocese[]> {
  if (!db) {
    throw new Error('Firestore n\'est pas initialisé')
  }
  const q = query(collection(ensureDb(), "dioceses"), orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    createdAt: fromFirestoreDate(doc.data().createdAt),
    updatedAt: fromFirestoreDate(doc.data().updatedAt),
  })) as Diocese[];
}

export async function createDiocese(data: Omit<Diocese, "createdAt" | "updatedAt">): Promise<string> {
  if (!db) {
    throw new Error('Firestore n\'est pas initialisé')
  }
  const docRef = doc(ensureDb(), "dioceses", data.dioceseId);
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return data.dioceseId;
}

// ========== PAROISSES ==========
export async function getParishes(dioceseId?: string): Promise<Parish[]> {
  if (!db) {
    throw new Error('Firestore n\'est pas initialisé')
  }
  // Récupérer toutes les paroisses et filtrer côté client pour éviter les index composites
  const q = query(collection(ensureDb(), "parishes"));
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
  const docRef = doc(ensureDb(), "parishes", parishId);
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
  const docRef = doc(ensureDb(), "parishes", data.parishId);
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
  const docRef = doc(ensureDb(), "parishes", parishId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteParish(parishId: string): Promise<void> {
  const docRef = doc(ensureDb(), "parishes", parishId);
  await deleteDoc(docRef);
}

// ========== ÉGLISES ==========
export async function getChurches(parishId?: string, dioceseId?: string): Promise<Church[]> {
  const q = query(collection(ensureDb(), "churches"));
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
  const docRef = doc(ensureDb(), "churches", churchId);
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
  const docRef = doc(ensureDb(), "churches", data.churchId);
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: false });
  return data.churchId;
}

export async function updateChurch(
  churchId: string,
  data: Partial<Omit<Church, "churchId" | "createdAt">>
): Promise<void> {
  const docRef = doc(ensureDb(), "churches", churchId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteChurch(churchId: string): Promise<void> {
  const docRef = doc(ensureDb(), "churches", churchId);
  await deleteDoc(docRef);
}

// ========== ACTUALITÉS ==========
export async function getParishNews(parishId?: string, dioceseId?: string): Promise<ParishNews[]> {
  // Récupérer toutes les actualités et filtrer côté client
  const q = query(collection(ensureDb(), "news"));
  const snapshot = await getDocs(q);
  
  let news = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      scope: data.scope,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || "",
      category: data.category || "Annonce",
      published: data.published !== undefined ? data.published : (data.status === "published"),
      image: data.image || data.imageUrl || undefined,
      author: data.author || undefined,
      showAuthor: data.showAuthor || undefined,
      parishId: data.parishId || undefined,
      dioceseId: data.dioceseId || undefined,
      archdioceseId: data.archdioceseId || undefined,
      createdAt: fromFirestoreDate(data.createdAt),
      updatedAt: fromFirestoreDate(data.updatedAt),
    } as ParishNews;
  });
  
  // Filtrer côté client
  if (parishId) {
    news = news.filter(n => n.parishId === parishId);
  }
  if (dioceseId) {
    news = news.filter(n => n.dioceseId === dioceseId);
  }
  
  // Trier par date de création (plus récent en premier)
  news.sort((a, b) => {
    const dateA = a.createdAt || new Date(0);
    const dateB = b.createdAt || new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
  
  return news;
}

export async function getParishNewsById(newsId: string): Promise<ParishNews | null> {
  const docRef = doc(ensureDb(), "news", newsId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    scope: data.scope,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt || "",
    category: data.category || "Annonce",
    published: data.published !== undefined ? data.published : (data.status === "published"),
    image: data.image || data.imageUrl || undefined,
    author: data.author || undefined,
    showAuthor: data.showAuthor || undefined,
    parishId: data.parishId || undefined,
    dioceseId: data.dioceseId || undefined,
    archdioceseId: data.archdioceseId || undefined,
    createdAt: fromFirestoreDate(data.createdAt),
    updatedAt: fromFirestoreDate(data.updatedAt),
  } as ParishNews;
}

// Fonction utilitaire pour synchroniser une actualité vers parish_news
export async function syncNewsToParishCollection(newsData: any): Promise<void> {
  try {
    const parishCollectionRef = collection(ensureDb(), "parish_news");
    
    // Chercher si l'actualité existe déjà dans parish_news
    // Utiliser le titre et le scope pour identifier
    const parishQuery = query(
      parishCollectionRef,
      where("title", "==", newsData.title),
      where("scope", "==", newsData.scope)
    );
    const parishSnapshot = await getDocs(parishQuery);
    
    const parishNewsData: any = {
      scope: newsData.scope,
      title: newsData.title,
      content: newsData.content,
      excerpt: newsData.excerpt || "",
      category: newsData.category || "Annonce",
      published: true,
      image: newsData.image || null,
      author: newsData.author || null,
      showAuthor: newsData.showAuthor !== undefined ? newsData.showAuthor : true,
      createdAt: newsData.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Ajouter les IDs selon le scope
    if (newsData.parishId) parishNewsData.parishId = newsData.parishId;
    if (newsData.dioceseId) parishNewsData.dioceseId = newsData.dioceseId;
    if (newsData.archdioceseId) parishNewsData.archdioceseId = newsData.archdioceseId;
    
    // Ajouter un champ pour identifier l'original (optionnel, pour faciliter la synchronisation)
    if (newsData.id) {
      parishNewsData.__originalId = newsData.id;
    }
    
    if (parishSnapshot.empty) {
      // Créer dans parish_news
      const newParishDocRef = await addDoc(parishCollectionRef, parishNewsData);
      console.log("✅ Actualité créée dans parish_news:", newParishDocRef.id);
    } else {
      // Mettre à jour dans parish_news
      const parishDocRef = doc(ensureDb(), "parish_news", parishSnapshot.docs[0].id);
      await updateDoc(parishDocRef, {
        ...parishNewsData,
        published: true,
        updatedAt: Timestamp.now(),
      });
      console.log("✅ Actualité mise à jour dans parish_news:", parishSnapshot.docs[0].id);
    }
  } catch (error) {
    console.error("❌ Erreur synchronisation vers parish_news:", error);
    throw error;
  }
}

export async function createParishNews(data: Omit<ParishNews, "id" | "createdAt" | "updatedAt">): Promise<string> {
  // Construire l'objet en excluant les valeurs undefined
  const newsData: any = {
    scope: data.scope,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt || "",
    category: data.category || "Annonce",
    published: data.published !== undefined ? data.published : false,
    image: data.image || null,
    author: data.author || null,
    showAuthor: data.showAuthor || false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  // Ajouter les IDs selon le scope
  if (data.parishId) newsData.parishId = data.parishId;
  if (data.dioceseId) newsData.dioceseId = data.dioceseId;
  if (data.archdioceseId) newsData.archdioceseId = data.archdioceseId;
  
  const docRef = await addDoc(collection(ensureDb(), "news"), newsData);
  
  // Si publié, créer aussi dans parish_news pour l'app mobile
  if (newsData.published) {
    try {
      await syncNewsToParishCollection({
        id: docRef.id,
        ...newsData,
      });
      console.log("✅ Actualité créée dans parish_news:", docRef.id);
      
      // Créer une notification dans parish_notifications pour toutes les paroisses concernées
      await createNotificationForNews(newsData, docRef.id);
    } catch (error) {
      console.error("❌ Erreur création dans parish_news:", error);
      // Ne pas faire échouer la création principale si la synchro échoue
    }
  }
  
  return docRef.id;
}

export async function updateParishNews(
  newsId: string,
  data: Partial<Omit<ParishNews, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(ensureDb(), "news", newsId);
  
  // Récupérer le document actuel pour vérifier l'état
  const currentDoc = await getDoc(docRef);
  if (!currentDoc.exists()) {
    throw new Error("Actualité non trouvée");
  }
  const currentData = currentDoc.data();
  
  const updateData: any = {
    updatedAt: Timestamp.now(),
  };
  
  // Ajouter seulement les champs définis
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.published !== undefined) updateData.published = data.published;
  if (data.image !== undefined) updateData.image = data.image || null;
  if (data.author !== undefined) updateData.author = data.author || null;
  if (data.showAuthor !== undefined) updateData.showAuthor = data.showAuthor;
  if (data.scope !== undefined) updateData.scope = data.scope;
  if (data.parishId !== undefined) updateData.parishId = data.parishId || null;
  if (data.dioceseId !== undefined) updateData.dioceseId = data.dioceseId || null;
  if (data.archdioceseId !== undefined) updateData.archdioceseId = data.archdioceseId || null;
  
  await updateDoc(docRef, updateData);
  
  // Synchroniser avec parish_news si nécessaire
  const shouldBeInParishCollection = 
    (data.published !== undefined ? data.published : currentData.published);
  
  if (shouldBeInParishCollection) {
    // Synchroniser vers parish_news
    const dataToSync = {
      id: newsId,
      ...currentData,
      ...updateData,
    };
    try {
      await syncNewsToParishCollection(dataToSync);
      console.log("✅ Actualité synchronisée dans parish_news:", newsId);
      
      // Créer une notification si l'actualité vient d'être publiée
      const wasPublished = currentData.published;
      const isNowPublished = data.published !== undefined ? data.published : wasPublished;
      if (!wasPublished && isNowPublished) {
        await createNotificationForNews(dataToSync, newsId);
      }
    } catch (error) {
      console.error("❌ Erreur synchronisation vers parish_news:", error);
      // Ne pas faire échouer la mise à jour principale si la synchro échoue
    }
  } else {
    // Désactiver dans parish_news si publié devient false
    try {
      const parishCollectionRef = collection(ensureDb(), "parish_news");
      const parishQuery = query(
        parishCollectionRef,
        where("__originalId", "==", newsId) // Utiliser un champ pour identifier l'original
      );
      const parishSnapshot = await getDocs(parishQuery);
      
      if (parishSnapshot.empty) {
        // Chercher par titre et scope comme fallback
        const fallbackQuery = query(
          parishCollectionRef,
          where("title", "==", updateData.title || currentData.title),
          where("scope", "==", updateData.scope || currentData.scope)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        if (!fallbackSnapshot.empty) {
          const parishDocRef = doc(ensureDb(), "parish_news", fallbackSnapshot.docs[0].id);
          await updateDoc(parishDocRef, {
            published: false,
            updatedAt: Timestamp.now(),
          });
          console.log("⚠️ Actualité désactivée dans parish_news:", fallbackSnapshot.docs[0].id);
        }
      } else {
        const parishDocRef = doc(ensureDb(), "parish_news", parishSnapshot.docs[0].id);
        await updateDoc(parishDocRef, {
          published: false,
          updatedAt: Timestamp.now(),
        });
        console.log("⚠️ Actualité désactivée dans parish_news:", parishSnapshot.docs[0].id);
      }
    } catch (error) {
      console.error("❌ Erreur désactivation dans parish_news:", error);
    }
  }
}

export async function deleteParishNews(newsId: string): Promise<void> {
  const docRef = doc(ensureDb(), "news", newsId);
  await deleteDoc(docRef);
}

// ========== HEURES DE MESSES ==========
export async function getPrayerTimes(parishId?: string): Promise<PrayerTime[]> {
  const q = query(collection(ensureDb(), "parish_prayer_times"));
  const snapshot = await getDocs(q);
  
  let prayerTimes = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: fromFirestoreDate(doc.data().createdAt),
    updatedAt: fromFirestoreDate(doc.data().updatedAt),
  })) as PrayerTime[];
  
  // Filtrer côté client si parishId est fourni
  if (parishId) {
    prayerTimes = prayerTimes.filter(pt => pt.parishId === parishId);
  }
  
  // Trier par nom
  prayerTimes.sort((a, b) => a.name.localeCompare(b.name));
  
  return prayerTimes;
}

export async function getPrayerTimeById(prayerTimeId: string): Promise<PrayerTime | null> {
  const docRef = doc(ensureDb(), "parish_prayer_times", prayerTimeId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: fromFirestoreDate(data.createdAt),
    updatedAt: fromFirestoreDate(data.updatedAt),
  } as PrayerTime;
}

export async function createPrayerTime(data: Omit<PrayerTime, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const prayerTimeData: any = {
    parishId: data.parishId,
    name: data.name,
    time: data.time,
    days: data.days || [],
    active: data.active !== undefined ? data.active : true,
    description: data.description || null,
    createdBy: data.createdBy,
    createdByRole: data.createdByRole || "parish_admin",
    validatedByParish: data.validatedByParish !== undefined 
      ? data.validatedByParish 
      : (data.createdByRole === "parish_admin"),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  // Ajouter churchId seulement si défini et si c'est un church_admin
  if (data.churchId) {
    prayerTimeData.churchId = data.churchId;
  }
  
  const docRef = await addDoc(collection(ensureDb(), "parish_prayer_times"), prayerTimeData);
  return docRef.id;
}

export async function updatePrayerTime(
  prayerTimeId: string,
  data: Partial<Omit<PrayerTime, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(ensureDb(), "parish_prayer_times", prayerTimeId);
  const updateData: any = {
    updatedAt: Timestamp.now(),
  };
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.time !== undefined) updateData.time = data.time;
  if (data.days !== undefined) updateData.days = data.days;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.validatedByParish !== undefined) updateData.validatedByParish = data.validatedByParish;
  if (data.parishId !== undefined) updateData.parishId = data.parishId;
  
  await updateDoc(docRef, updateData);
}

export async function deletePrayerTime(prayerTimeId: string): Promise<void> {
  const docRef = doc(ensureDb(), "parish_prayer_times", prayerTimeId);
  await deleteDoc(docRef);
}

export async function validatePrayerTime(prayerTimeId: string): Promise<void> {
  const docRef = doc(ensureDb(), "parish_prayer_times", prayerTimeId);
  await updateDoc(docRef, {
    validatedByParish: true,
    updatedAt: Timestamp.now(),
  });
}

// ========== PRIÈRES ==========
export async function getPrayers(): Promise<Prayer[]> {
  const q = query(collection(ensureDb(), "prayers"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      prayerId: doc.id,
      title: data.title,
      content: data.content,
      category: data.category || undefined,
      dioceseId: data.dioceseId,
      parishId: data.parishId,
      status: data.status || "draft",
      createdBy: data.createdBy,
      createdByRole: data.createdByRole,
      createdAt: fromFirestoreDate(data.createdAt),
      updatedAt: fromFirestoreDate(data.updatedAt),
    } as Prayer;
  });
}

export async function getPrayerById(prayerId: string): Promise<Prayer | null> {
  const docRef = doc(ensureDb(), "prayers", prayerId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    prayerId: docSnap.id,
    title: data.title,
    content: data.content,
    category: data.category || undefined,
    dioceseId: data.dioceseId,
    parishId: data.parishId,
    status: data.status || "draft",
    createdBy: data.createdBy,
    createdByRole: data.createdByRole,
    createdAt: fromFirestoreDate(data.createdAt),
    updatedAt: fromFirestoreDate(data.updatedAt),
  } as Prayer;
}

export async function createPrayer(data: Omit<Prayer, "prayerId" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(collection(ensureDb(), "prayers"), {
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
  const docRef = doc(ensureDb(), "prayers", prayerId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deletePrayer(prayerId: string): Promise<void> {
  const docRef = doc(ensureDb(), "prayers", prayerId);
  await deleteDoc(docRef);
}

// ========== TYPES DE DONS ==========
export async function getDonationTypes(): Promise<DonationType[]> {
  // Récupérer tous les types de dons et trier côté client
  const q = query(collection(ensureDb(), "donation_types"));
  const snapshot = await getDocs(q);
  
  const donationTypes = snapshot.docs.map((doc) => ({
    donationTypeId: doc.id,
    ...doc.data(),
    createdAt: fromFirestoreDate(doc.data().createdAt),
    updatedAt: fromFirestoreDate(doc.data().updatedAt),
  })) as DonationType[];
  
  // Trier par nom (ordre alphabétique)
  donationTypes.sort((a, b) => a.name.localeCompare(b.name));
  
  return donationTypes;
}

export async function getDonationTypeById(donationTypeId: string): Promise<DonationType | null> {
  const docRef = doc(ensureDb(), "donation_types", donationTypeId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    donationTypeId: docSnap.id,
    ...data,
    createdAt: fromFirestoreDate(data.createdAt),
    updatedAt: fromFirestoreDate(data.updatedAt),
  } as DonationType;
}

export async function createDonationType(
  data: Omit<DonationType, "donationTypeId" | "createdAt" | "updatedAt">
): Promise<string> {
  // Construire l'objet en excluant les valeurs undefined
  const donationTypeData: any = {
    name: data.name,
    description: data.description || null,
    icon: data.icon || "heart",
    defaultAmounts: data.defaultAmounts,
    parishId: data.parishId,
    dioceseId: data.dioceseId,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdBy: data.createdBy,
    createdByRole: data.createdByRole,
    validatedByParish: data.validatedByParish !== undefined ? data.validatedByParish : false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Ajouter churchId seulement s'il est défini
  if (data.churchId) {
    donationTypeData.churchId = data.churchId;
  }

  const docRef = await addDoc(collection(ensureDb(), "donation_types"), donationTypeData);

  // Si validé par la paroisse et actif, créer aussi dans parish_donation_types pour l'app mobile
  if (donationTypeData.validatedByParish && donationTypeData.isActive) {
    try {
      const parishDonationTypeData = {
        name: donationTypeData.name,
        description: donationTypeData.description || null,
        icon: donationTypeData.icon || "heart",
        defaultAmounts: donationTypeData.defaultAmounts,
        parishId: donationTypeData.parishId,
        active: true, // L'app mobile utilise 'active' au lieu de 'isActive'
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const parishDocRef = await addDoc(collection(ensureDb(), "parish_donation_types"), parishDonationTypeData);
      console.log("✅ Type de don créé dans parish_donation_types:", parishDocRef.id, "pour parishId:", donationTypeData.parishId);
    } catch (error) {
      console.error("❌ Erreur création dans parish_donation_types:", error);
      // Ne pas faire échouer la création principale si la synchro échoue
    }
  } else {
    console.log("⚠️ Type de don non synchronisé (validatedByParish:", donationTypeData.validatedByParish, ", isActive:", donationTypeData.isActive, ")");
  }
  
  return docRef.id;
}

export async function updateDonationType(
  donationTypeId: string,
  updateData: Partial<Omit<DonationType, "donationTypeId" | "createdAt">>
): Promise<void> {
  const docRef = doc(ensureDb(), "donation_types", donationTypeId);
  
  // Construire l'objet de mise à jour en excluant undefined
  const updatePayload: any = {
    updatedAt: Timestamp.now(),
  };
  
  if (updateData.name !== undefined) updatePayload.name = updateData.name;
  if (updateData.description !== undefined) updatePayload.description = updateData.description || null;
  if (updateData.icon !== undefined) updatePayload.icon = updateData.icon;
  if (updateData.defaultAmounts !== undefined) updatePayload.defaultAmounts = updateData.defaultAmounts;
  if (updateData.isActive !== undefined) updatePayload.isActive = updateData.isActive;
  if (updateData.validatedByParish !== undefined) updatePayload.validatedByParish = updateData.validatedByParish;
  // Ne pas mettre à jour churchId, parishId, dioceseId, createdBy, createdByRole
  
  await updateDoc(docRef, updatePayload);
  
  // Synchroniser avec parish_donation_types si nécessaire
  // Récupérer le document actuel pour vérifier l'état
  const currentDoc = await getDoc(docRef);
  if (currentDoc.exists()) {
    const currentData = currentDoc.data();
    const shouldBeInParishCollection = 
      (updateData.validatedByParish !== undefined ? updateData.validatedByParish : currentData.validatedByParish) &&
      (updateData.isActive !== undefined ? updateData.isActive : currentData.isActive);
    
    // Chercher dans parish_donation_types par parishId et name
    const parishCollectionRef = collection(ensureDb(), "parish_donation_types");
    const parishQuery = query(
      parishCollectionRef,
      where("parishId", "==", currentData.parishId),
      where("name", "==", updateData.name || currentData.name)
    );
    const parishSnapshot = await getDocs(parishQuery);
    
    if (shouldBeInParishCollection) {
      // Synchroniser vers parish_donation_types
      const dataToSync = {
        ...currentData,
        ...updateData,
      };
      await syncDonationTypeToParishCollection(dataToSync);
    } else {
      // Supprimer ou désactiver dans parish_donation_types
      if (!parishSnapshot.empty) {
        const parishDocRef = doc(ensureDb(), "parish_donation_types", parishSnapshot.docs[0].id);
        await updateDoc(parishDocRef, {
          active: false,
          updatedAt: Timestamp.now(),
        });
        console.log("⚠️ Type de don désactivé dans parish_donation_types:", parishSnapshot.docs[0].id);
      }
    }
  }
}

export async function deleteDonationType(donationTypeId: string): Promise<void> {
  const docRef = doc(ensureDb(), "donation_types", donationTypeId);
  await deleteDoc(docRef);
}

export async function validateDonationType(donationTypeId: string): Promise<void> {
  const docRef = doc(ensureDb(), "donation_types", donationTypeId);
  const currentDoc = await getDoc(docRef);
  
  if (!currentDoc.exists()) {
    throw new Error("Type de don non trouvé");
  }
  
  const currentData = currentDoc.data();
  
  // Mettre à jour dans donation_types
  await updateDoc(docRef, {
    validatedByParish: true,
    updatedAt: Timestamp.now(),
  });
  
  // Si actif, créer/mettre à jour dans parish_donation_types pour l'app mobile
  if (currentData.isActive) {
    await syncDonationTypeToParishCollection(currentData);
  } else {
    console.log("⚠️ Type de don non synchronisé car isActive = false");
  }
}

// Fonction utilitaire pour synchroniser un type de don vers parish_donation_types
export async function syncDonationTypeToParishCollection(donationTypeData: any): Promise<void> {
  try {
    const parishCollectionRef = collection(ensureDb(), "parish_donation_types");
    const parishQuery = query(
      parishCollectionRef,
      where("parishId", "==", donationTypeData.parishId),
      where("name", "==", donationTypeData.name)
    );
    const parishSnapshot = await getDocs(parishQuery);
    
    if (parishSnapshot.empty) {
      // Créer dans parish_donation_types
      const parishDonationTypeData = {
        name: donationTypeData.name,
        description: donationTypeData.description || null,
        icon: donationTypeData.icon || "heart",
        defaultAmounts: donationTypeData.defaultAmounts,
        parishId: donationTypeData.parishId,
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const newParishDocRef = await addDoc(parishCollectionRef, parishDonationTypeData);
      console.log("✅ Type de don synchronisé dans parish_donation_types:", newParishDocRef.id, "pour parishId:", donationTypeData.parishId);
    } else {
      // Mettre à jour dans parish_donation_types
      const parishDocRef = doc(ensureDb(), "parish_donation_types", parishSnapshot.docs[0].id);
      await updateDoc(parishDocRef, {
        name: donationTypeData.name,
        description: donationTypeData.description || null,
        icon: donationTypeData.icon || "heart",
        defaultAmounts: donationTypeData.defaultAmounts,
        active: true,
        updatedAt: Timestamp.now(),
      });
      console.log("✅ Type de don mis à jour dans parish_donation_types:", parishSnapshot.docs[0].id);
    }
  } catch (error) {
    console.error("❌ Erreur synchronisation vers parish_donation_types:", error);
    throw error;
  }
}

// Fonction pour synchroniser tous les types de dons validés et actifs
export async function syncAllDonationTypesToParishCollection(): Promise<void> {
  try {
    const allDonationTypes = await getDonationTypes();
    const validatedAndActive = allDonationTypes.filter(
      dt => dt.validatedByParish && dt.isActive
    );
    
    console.log(`🔄 Synchronisation de ${validatedAndActive.length} types de dons...`);
    
    for (const donationType of validatedAndActive) {
      try {
        await syncDonationTypeToParishCollection(donationType);
      } catch (error) {
        console.error(`❌ Erreur synchronisation pour ${donationType.donationTypeId}:`, error);
      }
    }
    
    console.log("✅ Synchronisation terminée");
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation globale:", error);
    throw error;
  }
}

// ========== NOTIFICATIONS ==========

// Fonction helper pour créer des notifications dans parish_notifications
async function createNotificationForNews(newsData: any, newsId: string): Promise<void> {
  try {
    const parishesToNotify: string[] = [];
    
    // Déterminer les paroisses à notifier selon le scope
    if (newsData.scope === "parish" && newsData.parishId) {
      parishesToNotify.push(newsData.parishId);
    } else if (newsData.scope === "diocese" && newsData.dioceseId) {
      // Récupérer toutes les paroisses du diocèse
      const parishes = await getParishes(newsData.dioceseId);
      parishesToNotify.push(...parishes.map(p => p.parishId));
    } else if (newsData.scope === "archdiocese") {
      // Récupérer toutes les paroisses de l'archidiocèse (DAKAR)
      const parishes = await getParishes();
      const dakarParishes = parishes.filter(p => p.dioceseId === "DAKAR");
      parishesToNotify.push(...dakarParishes.map(p => p.parishId));
    }
    
    // Créer une notification pour chaque paroisse
    const notificationPromises = parishesToNotify.map(parishId =>
      addDoc(collection(ensureDb(), "parish_notifications"), {
        parishId,
        type: "news",
        title: "📰 Nouvelle actualité",
        message: newsData.title,
        icon: "newspaper",
        priority: "normal",
        read: false,
        relatedId: newsId,
        createdAt: Timestamp.now(),
      })
    );
    
    await Promise.all(notificationPromises);
    console.log(`✅ ${parishesToNotify.length} notifications créées pour l'actualité ${newsId}`);
  } catch (error) {
    console.error("❌ Erreur création notifications:", error);
    // Ne pas faire échouer la création principale si les notifications échouent
  }
}

export async function getNotifications(): Promise<Notification[]> {
  const q = query(collection(ensureDb(), "notifications"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      notificationId: doc.id,
      title: data.title,
      message: data.message,
      type: data.type || "news",
      parishId: data.parishId,
      dioceseId: data.dioceseId,
      status: data.status || "draft",
      createdBy: data.createdBy || "",
      createdAt: fromFirestoreDate(data.createdAt) || new Date(),
      publishedAt: fromFirestoreDate(data.publishedAt),
    } as Notification;
  });
}

// ========== ACTIVITÉS ==========
export async function getActivities(): Promise<Activity[]> {
  const q = query(collection(ensureDb(), "activities"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    activityId: doc.id,
    ...doc.data(),
    createdAt: fromFirestoreDate(doc.data().createdAt),
    updatedAt: fromFirestoreDate(doc.data().updatedAt),
  })) as Activity[];
}
