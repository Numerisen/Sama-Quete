import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthService, UserProfile } from '../lib/auth-service';

export interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    username: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  isUsernameAvailable: (username: string) => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Charger le profil utilisateur
        const userProfile = await AuthService.getUserProfile(user.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    username: string;
    password: string;
  }) => {
    const result = await AuthService.signUp(userData);
    if (result.success && result.user) {
      setProfile(result.user);
    }
    return result;
  };

  const signIn = async (identifier: string, password: string) => {
    const result = await AuthService.signIn(identifier, password);
    if (result.success && result.user) {
      setProfile(result.user);
    }
    return result;
  };

  const signOut = async () => {
    const result = await AuthService.signOut();
    if (result.success) {
      setProfile(null);
    }
    return result;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const result = await AuthService.updateUserProfile(user.uid, updates);
    if (result.success) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }
    return result;
  };

  const isUsernameAvailable = async (username: string) => {
    return await AuthService.isUsernameAvailable(username);
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isUsernameAvailable
  };
}
