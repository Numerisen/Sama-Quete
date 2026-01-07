import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  username: string;
  parishId?: string;
  parishName?: string;
  totalDonations: number;
  donationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async signUp(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    username: string;
    password: string;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    try {
      // Créer l'utilisateur avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      const user = userCredential.user;

      // Mettre à jour le profil Firebase Auth
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Créer le profil utilisateur dans Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        country: userData.country,
        username: userData.username,
        totalDonations: 0,
        donationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async signIn(identifier: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    try {
      let email = identifier;
      
      // Si l'identifiant n'est pas un email, chercher l'utilisateur par username ou téléphone
      if (!identifier.includes('@')) {
        const userDoc = await this.findUserByIdentifier(identifier);
        if (!userDoc) {
          return { success: false, error: 'Utilisateur non trouvé' };
        }
        email = userDoc.email;
      }

      // Connexion avec Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupérer le profil utilisateur
      const userProfile = await this.getUserProfile(user.uid);
      
      if (!userProfile) {
        return { success: false, error: 'Profil utilisateur non trouvé' };
      }

      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  }

  /**
   * Récupérer le profil utilisateur par UID
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  /**
   * Chercher un utilisateur par username ou téléphone
   */
  static async findUserByIdentifier(identifier: string): Promise<UserProfile | null> {
    try {
      // Chercher par username
      const usernameQuery = await getDoc(doc(db, 'usernames', identifier));
      if (usernameQuery.exists()) {
        const uid = usernameQuery.data().uid;
        return await this.getUserProfile(uid);
      }

      // Chercher par téléphone (nécessiterait une collection séparée ou un index)
      // Pour l'instant, on retourne null
      return null;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  }

  /**
   * Vérifier si un username est disponible
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const usernameDoc = await getDoc(doc(db, 'usernames', username));
      return !usernameDoc.exists();
    } catch (error) {
      console.error('Erreur lors de la vérification du username:', error);
      return false;
    }
  }

  /**
   * Convertir les codes d'erreur Firebase en messages français
   */
  private static getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/user-not-found': 'Utilisateur non trouvé',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-credential': 'Identifiants incorrects',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
      'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet',
      'auth/user-disabled': 'Ce compte a été désactivé'
    };

    return errorMessages[errorCode] || 'Une erreur est survenue';
  }
}
