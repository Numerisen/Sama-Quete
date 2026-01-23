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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { uid } = body

    if (!uid) {
      return NextResponse.json(
        { error: "UID requis" },
        { status: 400 }
      )
    }

    const app = getFirebaseAdmin()
    const auth = getAuth(app)

    // Récupérer l'utilisateur et ses claims actuels
    const user = await auth.getUser(uid)
    const customClaims = user.customClaims || {}

    // Retirer le claim mustChangePassword
    const updatedClaims = { ...customClaims }
    delete updatedClaims.mustChangePassword

    // Mettre à jour les claims
    await auth.setCustomUserClaims(uid, updatedClaims)

    return NextResponse.json({
      success: true,
      message: "Claim mis à jour avec succès",
    })
  } catch (error: any) {
    console.error("Erreur mise à jour claim:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}
