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

export async function GET(req: NextRequest) {
  try {
    const app = getFirebaseAdmin()
    const auth = getAuth(app)

    // Récupérer tous les utilisateurs (limite de 1000 par défaut)
    const listUsersResult = await auth.listUsers(1000)
    
    // Transformer les utilisateurs pour inclure les claims
    const users = await Promise.all(
      listUsersResult.users.map(async (userRecord) => {
        const customClaims = userRecord.customClaims || {}
        return {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || "",
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
          },
          role: customClaims.role || "",
          mustChangePassword: customClaims.mustChangePassword || false,
          dioceseId: customClaims.dioceseId || "",
          parishId: customClaims.parishId || "",
          churchId: customClaims.churchId || "",
          archdioceseId: customClaims.archdioceseId || "",
        }
      })
    )

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    })
  } catch (error: any) {
    console.error("Erreur liste utilisateurs:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    )
  }
}
