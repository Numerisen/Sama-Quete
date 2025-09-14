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

export interface UserRole {
  uid: string
  email: string
  displayName: string
  role: 'super_admin' | 'diocese_admin' | 'parish_admin' | 'user'
  dioceseId?: string
  parishId?: string
  permissions: {
    canManageUsers: boolean
    canManageDioceses: boolean
    canManageParishes: boolean
    canManageContent: boolean
    canViewReports: boolean
    canManageDonations: boolean
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
  const userRef = doc(db, 'users', uid)
  
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
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (userSnap.exists()) {
    return { uid, ...userSnap.data() } as UserRole
  }
  
  return null
}

// Mettre à jour le dernier login
export async function updateLastLogin(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp()
  })
}

// Récupérer tous les utilisateurs d'un diocèse
export async function getUsersByDiocese(dioceseId: string): Promise<UserRole[]> {
  const q = query(
    collection(db, 'users'),
    where('dioceseId', '==', dioceseId),
    where('isActive', '==', true)
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserRole))
}

// Récupérer tous les utilisateurs d'une paroisse
export async function getUsersByParish(parishId: string): Promise<UserRole[]> {
  const q = query(
    collection(db, 'users'),
    where('parishId', '==', parishId),
    where('isActive', '==', true)
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserRole))
}

// Définir les permissions selon le rôle
function getPermissionsByRole(role: UserRole['role']) {
  switch (role) {
    case 'super_admin':
      return {
        canManageUsers: true,
        canManageDioceses: true,
        canManageParishes: true,
        canManageContent: true,
        canViewReports: true,
        canManageDonations: true
      }
    
    case 'diocese_admin':
      return {
        canManageUsers: true,
        canManageDioceses: false,
        canManageParishes: true,
        canManageContent: true,
        canViewReports: true,
        canManageDonations: true
      }
    
    case 'parish_admin':
      return {
        canManageUsers: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageContent: true,
        canViewReports: false,
        canManageDonations: true
      }
    
    case 'user':
    default:
      return {
        canManageUsers: false,
        canManageDioceses: false,
        canManageParishes: false,
        canManageContent: false,
        canViewReports: false,
        canManageDonations: false
      }
  }
}

// Vérifier si un utilisateur a une permission spécifique
export function hasPermission(userRole: UserRole | null, permission: keyof UserRole['permissions']): boolean {
  if (!userRole || !userRole.isActive) return false
  return userRole.permissions[permission]
}