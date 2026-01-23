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
    const { uid, email, role, entityType, entityId, name } = body

    if (!uid) {
      return NextResponse.json(
        { error: "UID requis" },
        { status: 400 }
      )
    }

    const app = getFirebaseAdmin()
    const auth = getAuth(app)

    // Récupérer l'utilisateur actuel pour préserver les claims existants
    const currentUser = await auth.getUser(uid)
    const currentClaims = currentUser.customClaims || {}

    // Préparer les mises à jour
    const updateData: any = {}

    if (email && email !== currentUser.email) {
      // Vérifier si l'email existe déjà
      try {
        const existingUser = await auth.getUserByEmail(email)
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
      updateData.email = email
    }

    if (name) {
      updateData.displayName = name
    }

    // Mettre à jour l'utilisateur
    if (Object.keys(updateData).length > 0) {
      await auth.updateUser(uid, updateData)
    }

    // Préparer les custom claims
    const customClaims: any = {
      ...currentClaims,
    }

    if (role) {
      customClaims.role = role
    }

    // Mettre à jour les IDs selon le type d'entité
    if (entityType === "diocese" && entityId) {
      customClaims.dioceseId = entityId
      customClaims.parishId = ""
      customClaims.churchId = ""
      customClaims.archdioceseId = ""
    } else if (entityType === "archdiocese" && entityId) {
      customClaims.archdioceseId = entityId
      customClaims.dioceseId = ""
      customClaims.parishId = ""
      customClaims.churchId = ""
    } else if (entityType === "parish" && entityId) {
      customClaims.parishId = entityId
      customClaims.churchId = ""
      customClaims.archdioceseId = ""
      // Garder le dioceseId existant si présent
    } else if (entityType === "church" && entityId) {
      customClaims.churchId = entityId
      customClaims.archdioceseId = ""
      // Garder le parishId et dioceseId existants si présents
    }

    // Mettre à jour les claims
    await auth.setCustomUserClaims(uid, customClaims)

    return NextResponse.json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
    })
  } catch (error: any) {
    console.error("Erreur mise à jour utilisateur:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    )
  }
}
