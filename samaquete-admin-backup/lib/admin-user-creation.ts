import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { createUserWithRole } from './user-service'

/**
 * Génère un email unique basé sur le nom de l'entité
 */
function generateAdminEmail(name: string, type: 'parish' | 'diocese' | 'church'): string {
  // Normaliser le nom : enlever les accents, espaces, caractères spéciaux
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
    .replace(/^-|-$/g, '') // Enlever les tirets en début/fin
  
  const prefix = type === 'parish' ? 'paroisse' : type === 'diocese' ? 'diocese' : 'eglise'
  return `${prefix}-${normalized}@samaquete.sn`
}

/**
 * Crée automatiquement un compte admin pour une paroisse
 */
export async function createParishAdmin(
  parishId: string,
  parishName: string,
  dioceseId: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const email = generateAdminEmail(parishName, 'parish')
    const password = 'Admin123'
    const displayName = `Admin ${parishName}`

    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Mettre à jour le profil
    await updateProfile(user, { displayName })

    // Créer le profil Firestore avec le rôle parish_admin
    await createUserWithRole(
      user.uid,
      email,
      displayName,
      'parish_admin',
      dioceseId,
      parishId
    )

    console.log(`✅ Compte admin créé pour la paroisse ${parishName}: ${email}`)
    return { success: true, email }
  } catch (error: any) {
    console.error('Erreur lors de la création du compte admin paroisse:', error)
    
    // Si l'email existe déjà, on retourne quand même un succès avec l'email
    if (error.code === 'auth/email-already-in-use') {
      return { success: true, email: generateAdminEmail(parishName, 'parish') }
    }
    
    return { success: false, error: error.message }
  }
}

/**
 * Crée automatiquement un compte admin pour un diocèse
 */
export async function createDioceseAdmin(
  dioceseId: string,
  dioceseName: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const email = generateAdminEmail(dioceseName, 'diocese')
    const password = 'Admin123'
    const displayName = `Admin ${dioceseName}`

    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Mettre à jour le profil
    await updateProfile(user, { displayName })

    // Créer le profil Firestore avec le rôle diocese_admin
    await createUserWithRole(
      user.uid,
      email,
      displayName,
      'diocese_admin',
      dioceseId
    )

    console.log(`✅ Compte admin créé pour le diocèse ${dioceseName}: ${email}`)
    return { success: true, email }
  } catch (error: any) {
    console.error('Erreur lors de la création du compte admin diocèse:', error)
    
    // Si l'email existe déjà, on retourne quand même un succès avec l'email
    if (error.code === 'auth/email-already-in-use') {
      return { success: true, email: generateAdminEmail(dioceseName, 'diocese') }
    }
    
    return { success: false, error: error.message }
  }
}

/**
 * Crée automatiquement un compte admin pour une église
 */
export async function createChurchAdmin(
  churchId: string,
  churchName: string,
  parishId: string,
  dioceseId: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const email = generateAdminEmail(churchName, 'church')
    const password = 'Admin123'
    const displayName = `Admin ${churchName}`

    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Mettre à jour le profil
    await updateProfile(user, { displayName })

    // Créer le profil Firestore avec le rôle church_admin
    // Note: createUserWithRole ne prend pas churchId, on devra peut-être l'ajouter manuellement
    await createUserWithRole(
      user.uid,
      email,
      displayName,
      'church_admin',
      dioceseId,
      parishId
    )

    // Ajouter le churchId au document utilisateur
    await updateDoc(doc(db, 'users', user.uid), {
      churchId
    })

    console.log(`✅ Compte admin créé pour l'église ${churchName}: ${email}`)
    return { success: true, email }
  } catch (error: any) {
    console.error('Erreur lors de la création du compte admin église:', error)
    
    // Si l'email existe déjà, on retourne quand même un succès avec l'email
    if (error.code === 'auth/email-already-in-use') {
      return { success: true, email: generateAdminEmail(churchName, 'church') }
    }
    
    return { success: false, error: error.message }
  }
}
