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
  defaultAmounts: number[];
  order: number;
  parishId: string;
  dioceseId: string;
  isActive: boolean;
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
