import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { UserRole, UserClaims } from "@/types";

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function getUserClaims(): Promise<UserClaims | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const token = await user.getIdTokenResult();
  return {
    role: token.claims.role as UserRole,
    dioceseId: token.claims.dioceseId as string | undefined,
    parishId: token.claims.parishId as string | undefined,
    churchId: token.claims.churchId as string | undefined,
  };
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
