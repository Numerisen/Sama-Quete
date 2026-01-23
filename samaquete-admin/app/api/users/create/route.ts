import { NextRequest, NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Normalisation de la clé privée
function normalizePrivateKey(key: string | undefined): string {
  if (!key) return ""
  return key.replace(/\\n/g, "\n")
}

// Initialiser Firebase Admin
function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 
                   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/"/g, "") ||
                   ""
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)

  if (!clientEmail || !privateKey || !projectId) {
    throw new Error("Configuration Firebase Admin manquante")
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

const DEFAULT_PASSWORD = "J@ngubi26"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, role, entityType, entityId, name } = body

    // Validation
    if (!email || !role || !entityType) {
      return NextResponse.json(
        { error: "Email, rôle et type d'entité sont requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est super_admin (à faire via token)
    // Pour l'instant, on fait confiance à l'appelant

    const app = getFirebaseAdmin()
    const auth = getAuth(app)

    // Vérifier si l'utilisateur existe déjà
    let user
    try {
      user = await auth.getUserByEmail(email)
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      )
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        throw error
      }
    }

    // Préparer les custom claims selon le type d'entité
    const customClaims: any = {
      role,
      mustChangePassword: true, // Forcer le changement de mot de passe
    }

    let dioceseId = ""
    let parishId = ""
    let churchId = ""
    let archdioceseId = ""

    if (entityType === "diocese" && entityId) {
      dioceseId = entityId
      customClaims.dioceseId = entityId
    } else if (entityType === "archdiocese" && entityId) {
      archdioceseId = entityId
      customClaims.archdioceseId = entityId
    } else if (entityType === "parish" && entityId) {
      // Pour une paroisse, on doit récupérer le dioceseId
      // Pour simplifier, on suppose que entityId contient les infos nécessaires
      parishId = entityId
      customClaims.parishId = entityId
      // TODO: Récupérer le dioceseId depuis la paroisse
    } else if (entityType === "church" && entityId) {
      churchId = entityId
      customClaims.churchId = entityId
      // TODO: Récupérer le parishId et dioceseId depuis l'église
    }

    // Créer l'utilisateur
    user = await auth.createUser({
      email,
      password: DEFAULT_PASSWORD,
      emailVerified: false,
      displayName: name || email,
    })

    // Définir les custom claims
    await auth.setCustomUserClaims(user.uid, customClaims)

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role,
        entityType,
        entityId,
        mustChangePassword: true,
      },
      defaultPassword: DEFAULT_PASSWORD,
    })
  } catch (error: any) {
    console.error("Erreur création utilisateur:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    )
  }
}
