import { UserRole, UserClaims } from "@/types";

export function canAccess(
  userClaims: UserClaims | null,
  requiredRole: UserRole | UserRole[],
  requiredDioceseId?: string,
  requiredParishId?: string
): boolean {
  if (!userClaims) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!roles.includes(userClaims.role)) return false;

  // Super Admin a accès à tout
  if (userClaims.role === "super_admin") return true;

  // Admin Archidiocèse voit tout (lecture seule hors Dakar)
  if (userClaims.role === "archdiocese_admin") {
    // Pour modification, vérifier si c'est Dakar
    if (requiredDioceseId && requiredDioceseId !== "DAKAR") {
      // Lecture seule pour les autres diocèses
      return false; // Pour l'instant, on bloque la modification
    }
    return true;
  }

  // Admin Diocèse ne voit que son diocèse
  if (userClaims.role === "diocese_admin") {
    if (requiredDioceseId && userClaims.dioceseId !== requiredDioceseId) {
      return false;
    }
    return true;
  }

  // Admin Paroisse ne voit que sa paroisse
  if (userClaims.role === "parish_admin") {
    if (requiredParishId && userClaims.parishId !== requiredParishId) {
      return false;
    }
    if (requiredDioceseId && userClaims.dioceseId !== requiredDioceseId) {
      return false;
    }
    return true;
  }

  // Admin Église ne voit que son église (via paroisse)
  if (userClaims.role === "church_admin") {
    if (requiredParishId && userClaims.parishId !== requiredParishId) {
      return false;
    }
    if (requiredDioceseId && userClaims.dioceseId !== requiredDioceseId) {
      return false;
    }
    return true;
  }

  return false;
}

export function canCreate(
  userClaims: UserClaims | null,
  resourceType: "diocese" | "parish" | "church" | "news" | "donation_type" | "notification"
): boolean {
  if (!userClaims) return false;

  switch (resourceType) {
    case "diocese":
      return userClaims.role === "super_admin";
    case "parish":
      return userClaims.role === "super_admin" || userClaims.role === "diocese_admin";
    case "church":
      return userClaims.role === "super_admin" || 
             userClaims.role === "diocese_admin" || 
             userClaims.role === "parish_admin";
    case "news":
    case "donation_type":
    case "notification":
      return userClaims.role !== "church_admin"; // Les admins église ne créent pas directement
    default:
      return false;
  }
}

export function canPublish(
  userClaims: UserClaims | null
): boolean {
  if (!userClaims) return false;
  // Seuls les admins paroisse et supérieurs peuvent publier
  return ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin"].includes(
    userClaims.role
  );
}
