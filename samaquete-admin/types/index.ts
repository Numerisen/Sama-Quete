// Types de base pour l'application

export type UserRole = 
  | "super_admin"
  | "archdiocese_admin"
  | "diocese_admin"
  | "parish_admin"
  | "church_admin";

export type ContentStatus = "draft" | "pending" | "published";

export interface UserClaims {
  role: UserRole;
  dioceseId?: string;
  parishId?: string;
  churchId?: string;
  mustChangePassword?: boolean;
}

// Diocèses fixes du Sénégal
export const FIXED_DIOCESES = [
  { dioceseId: "DAKAR", name: "Archidiocèse de Dakar", isMetropolitan: true },
  { dioceseId: "THIES", name: "Diocèse de Thiès", isMetropolitan: false },
  { dioceseId: "KAOLACK", name: "Diocèse de Kaolack", isMetropolitan: false },
  { dioceseId: "ZIGUINCHOR", name: "Diocèse de Ziguinchor", isMetropolitan: false },
  { dioceseId: "KOLDA", name: "Diocèse de Kolda", isMetropolitan: false },
  { dioceseId: "TAMBACOUNDA", name: "Diocèse de Tambacounda", isMetropolitan: false },
  { dioceseId: "SAINT_LOUIS", name: "Diocèse de Saint-Louis", isMetropolitan: false },
] as const;

export interface Diocese {
  dioceseId: string;
  name: string;
  isMetropolitan: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Parish {
  parishId: string;
  name: string;
  dioceseId: string;
  isActive: boolean;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Church {
  churchId: string;
  name: string;
  parishId: string;
  dioceseId: string;
  isActive: boolean;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface News {
  newsId: string;
  title: string;
  content: string;
  category?: string;
  imageUrl?: string;
  dioceseId: string;
  parishId: string;
  status: ContentStatus;
  createdBy: string;
  createdByRole: UserRole;
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

// Type pour les actualités (utilisé par l'app mobile)
// Peut être au niveau paroisse, diocèse ou archidiocèse
export type NewsScope = "parish" | "diocese" | "archdiocese";

export interface ParishNews {
  id?: string; // ID du document Firestore
  scope: NewsScope; // Niveau de l'actualité : parish, diocese, archdiocese
  parishId?: string; // Pour les actualités de paroisse
  dioceseId?: string; // Pour les actualités de diocèse (et paroisse)
  archdioceseId?: string; // Pour les actualités d'archidiocèse (DAKAR uniquement)
  title: string;
  content: string;
  excerpt: string; // Résumé de l'actualité
  category: string; // Annonce, Événement, Célébration, Formation, etc.
  published: boolean; // true = visible dans l'app mobile
  image?: string; // URL de l'image
  author?: string; // Nom de l'auteur
  showAuthor?: boolean; // Afficher l'auteur dans l'app
  createdAt?: Date;
  updatedAt?: Date;
}

// Catégories d'actualités disponibles
export const NEWS_CATEGORIES = [
  "Annonce",
  "Événement",
  "Célébration",
  "Formation",
  "Pastorale",
  "Jeunesse",
  "Caritative",
  "Autre",
] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number];

export interface DonationType {
  donationTypeId: string;
  name: string;
  description?: string;
  icon?: string;
  defaultAmounts: number[]; // Tableau de 4 montants en FCFA
  parishId: string;
  dioceseId: string;
  isActive: boolean;
  createdBy: string; // ID de l'utilisateur qui a créé
  createdByRole: UserRole; // Rôle de celui qui a créé
  churchId?: string; // ID de l'église si créée par une église
  validatedByParish: boolean; // Si true, validée par la paroisse (visible dans l'app mobile)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  notificationId: string;
  title: string;
  message: string;
  type: "news" | "prayer" | "activity" | "donation" | "liturgy";
  parishId: string;
  dioceseId: string;
  status: ContentStatus;
  createdBy: string;
  createdAt: Date;
  publishedAt?: Date;
}

export interface Donation {
  donationId: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  parishId: string;
  userId?: string;
  anonymousUid?: string;
  createdAt: Date;
}

export interface Activity {
  activityId: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  imageUrl?: string;
  dioceseId: string;
  parishId: string;
  status: ContentStatus;
  createdBy: string;
  createdByRole: UserRole;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Prayer {
  prayerId: string;
  title: string;
  content: string;
  category?: string;
  dioceseId: string;
  parishId: string;
  status: ContentStatus;
  createdBy: string;
  createdByRole: UserRole;
  createdAt: Date;
  updatedAt?: Date;
}

// Type pour les heures de prières (utilisé par l'app mobile)
export interface PrayerTime {
  id?: string; // ID du document Firestore
  parishId: string;
  name: string; // Nom de la prière (ex: "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")
  time: string; // Heure au format HH:mm (ex: "06:30")
  days: string[]; // Jours de la semaine où cette prière est active (ex: ["Lundi", "Mardi", ...])
  active: boolean; // Si false, n'est pas affichée dans l'app mobile
  description?: string; // Description optionnelle
  createdBy: string; // ID de l'utilisateur qui a créé (parish_admin ou church_admin)
  createdByRole: "parish_admin" | "church_admin"; // Rôle de celui qui a créé
  churchId?: string; // ID de l'église si créée par une église
  validatedByParish: boolean; // Si true, validée par la paroisse (visible dans l'app mobile)
  createdAt?: Date;
  updatedAt?: Date;
}

// Jours de la semaine disponibles
export const DAYS_OF_WEEK = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Noms de prières courants
export const PRAYER_NAMES = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
  "Tahajjud",
  "Witr",
] as const;

export type PrayerName = typeof PRAYER_NAMES[number];
