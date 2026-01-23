import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore'
import { db } from './firebase'

function ensureDb() {
  if (!db) {
    throw new Error('Firestore n\'est pas initialisé')
  }
  return db
}

export interface UserRole {
  uid: string
  email: string
  displayName: string
  role: 'super_admin' | 'archdiocese_admin' | 'diocese_admin' | 'parish_admin' | 'church_admin' | 'user'
  archdioceseId?: string  // Pour admin archidiocèse
  dioceseId?: string       // Pour admin diocèse et niveaux inférieurs
  parishId?: string        // Pour admin paroisse et église
  churchId?: string        // Pour admin église uniquement
  permissions: {
    canManageUsers: boolean
    canManageArchdioceses: boolean
    canManageDioceses: boolean
    canManageParishes: boolean
    canManageChurches: boolean
    canManageContent: boolean
    canValidateContent: boolean  // Paroisse valide les contenus église
    canCreateContent: boolean    // Église crée des contenus
    canViewReports: boolean
    canViewDonations: boolean    // Voir les dons (lecture seule pour certains)
    canManageDonations: boolean  // Gérer les dons localement
    canManageSettings: boolean   // Paramètres globaux (super admin)
  }
  isActive: boolean
  createdAt: any
  updatedAt: any
  lastLoginAt?: any
}

// Créer un utilisateur avec rôle dans Firestore
export async function createUserWithRole(
  uid: string, 
  email: string, 
  displayName: string, 
  role: UserRole['role'],
  dioceseId?: string,
  parishId?: string
): Promise<void> {
  const userRef = doc(ensureDb(), 'users', uid)
  
  // Définir les permissions selon le rôle
  const permissions = getPermissionsByRole(role)
  
  const userData: Omit<UserRole, 'uid'> = {
    email,
    displayName,
    role,
    dioceseId,
    parishId,
    permissions,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  await setDoc(userRef, userData)
}

// Récupérer les données utilisateur avec rôle
export async function getUserRole(uid: string): Promise<UserRole | null> {
  const userRef = doc(ensureDb(), 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    return { uid, ...userSnap.data() } as UserRole
  }
  
  return null
}

// Mettre à jour le dernier login
export async function updateLastLogin(uid: string): Promise<void> {
  const userRef = doc(ensureDb(), 'users', uid)
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp()
  })
}

// Récupérer tous les utilisateurs d'un diocèse
export async function getUsersByDiocese(dioceseId: string): Promise<UserRole[]> {
  const q = query(
    collection(ensureDb(), 'users'),
    where('dioceseId', '==', dioceseId),
    where('isActive', '==', true)
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserRole))
}

// Récupérer tous les utilisateurs d'une paroisse
export async function getUsersByParish(parishId: string): Promise<UserRole[]> {
  const q = query(
    collection(ensureDb(), 'users'),
    where('parishId', '==', parishId),
    where('isActive', '==', true)
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserRole))
}

// Définir les permissions selon le rôle (hiérarchie: Super Admin > Archidiocèse > Diocèse > Paroisse > Église)
function getPermissionsByRole(role: UserRole['role']) {
  switch (role) {
    case 'super_admin':
      // 🔴 SUPER ADMIN: Administration globale, toutes permissions
      return {
        canManageUsers: true,
        canManageArchdioceses: true,
        canManageDioceses: true,
        canManageParishes: true,
        canManageChurches: true,
        canManageContent: true,
        canValidateContent: true,
        canCreateContent: true,
        canViewReports: true,
        canViewDonations: true,
        canManageDonations: true,
        canManageSettings: true
      }
    
    case 'archdiocese_admin':
      // 🟠 ADMIN ARCHIDIOCÈSE: Gouvernance nationale, supervision diocèses, lecture seule sur dons
      return {
        canManageUsers: false,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageChurches: false,
        canManageContent: true,        // Publier annonces archidiocésaines
        canValidateContent: false,
        canCreateContent: true,
        canViewReports: true,           // Statistiques globales
        canViewDonations: true,         // Lecture seule sur tous les dons
        canManageDonations: false,      // Pas de gestion locale
        canManageSettings: false
      }
    
    case 'diocese_admin':
      // 🟡 ADMIN DIOCÈSE: Supervision territoriale diocèse, lecture seule sur dons du diocèse
      return {
        canManageUsers: false,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: false,       // Supervise mais ne crée pas
        canManageChurches: false,
        canManageContent: true,         // Publier annonces diocésaines
        canValidateContent: false,
        canCreateContent: true,
        canViewReports: true,           // Stats du diocèse
        canViewDonations: true,         // Lecture seule dons du diocèse
        canManageDonations: false,      // Pas de gestion locale
        canManageSettings: false
      }
    
    case 'parish_admin':
      // 🟢 ADMIN PAROISSE: Supervision locale, validation contenus église, vue consolidée dons
      return {
        canManageUsers: true,           // Gérer les admins église
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: true,        // MAJ infos paroisse
        canManageChurches: true,        // Gérer églises rattachées
        canManageContent: true,         // Publier annonces paroissiales
        canValidateContent: true,       // ✅ VALIDER contenus église (PENDING → PUBLISHED)
        canCreateContent: true,
        canViewReports: true,           // Stats paroisse
        canViewDonations: true,         // Vue consolidée dons paroisse + églises
        canManageDonations: true,       // Gérer dons locaux
        canManageSettings: false
      }
    
    case 'church_admin':
      // 🔵 ADMIN ÉGLISE: Opérationnel terrain, création contenus (validation paroisse requise)
      return {
        canManageUsers: false,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageChurches: false,       // Uniquement paramètres locaux église
        canManageContent: false,        // Ne publie pas directement
        canValidateContent: false,
        canCreateContent: true,         // ✅ CRÉER contenus (status PENDING)
        canViewReports: false,
        canViewDonations: true,         // Vue dons de son église uniquement
        canManageDonations: true,       // Gérer dons locaux église
        canManageSettings: false
      }
    
    case 'user':
    default:
      return {
        canManageUsers: false,
        canManageArchdioceses: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageChurches: false,
        canManageContent: false,
        canValidateContent: false,
        canCreateContent: false,
        canViewReports: false,
        canViewDonations: false,
        canManageDonations: false,
        canManageSettings: false
      }
  }
}

// Vérifier si un utilisateur a une permission spécifique
export function hasPermission(userRole: UserRole | null, permission: keyof UserRole['permissions']): boolean {
  if (!userRole || !userRole.isActive) return false
  return userRole.permissions[permission]
}