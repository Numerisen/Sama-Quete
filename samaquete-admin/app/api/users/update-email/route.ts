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
    const { uid, newEmail } = body

    if (!uid || !newEmail) {
      return NextResponse.json(
        { error: "UID et nouvel email requis" },
        { status: 400 }
      )
    }

    const app = getFirebaseAdmin()
    const auth = getAuth(app)

    // Vérifier si l'email existe déjà
    try {
      const existingUser = await auth.getUserByEmail(newEmail)
      if (existingUser.uid !== uid) {
        return NextResponse.json(
          { error: "Un utilisateur avec cet email existe déjà" },
          { status: 400 }
        )
      }
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        throw error
      }
    }

    // Mettre à jour l'email
    await auth.updateUser(uid, {
      email: newEmail,
      emailVerified: false, // L'email doit être revérifié
    })

    return NextResponse.json({
      success: true,
      message: "Email mis à jour avec succès. Veuillez vérifier votre nouvel email.",
    })
  } catch (error: any) {
    console.error("Erreur mise à jour email:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour de l'email" },
      { status: 500 }
    )
  }
}
