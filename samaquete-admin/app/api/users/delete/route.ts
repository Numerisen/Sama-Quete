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

    // Supprimer l'utilisateur
    await auth.deleteUser(uid)

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé avec succès",
    })
  } catch (error: any) {
    console.error("Erreur suppression utilisateur:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    )
  }
}
