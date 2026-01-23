import { NextRequest, NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

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
    const { entityType, entityId, newName, newId } = body

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Type d'entité et ID requis" },
        { status: 400 }
      )
    }

    const app = getFirebaseAdmin()
    const db = getFirestore(app)

    // Modifier le nom si fourni
    if (newName) {
      const collectionName = entityType === "parish" ? "parishes" 
                           : entityType === "church" ? "churches"
                           : entityType === "diocese" ? "dioceses"
                           : null

      if (!collectionName) {
        return NextResponse.json(
          { error: "Type d'entité invalide" },
          { status: 400 }
        )
      }

      const docRef = db.collection(collectionName).doc(entityId)
      await docRef.update({
        name: newName,
        updatedAt: new Date(),
      })
    }

    // Modifier l'ID si fourni et différent
    if (newId && newId !== entityId) {
      // Pour modifier l'ID, il faut créer un nouveau document et supprimer l'ancien
      // C'est une opération complexe, on va juste retourner une erreur pour l'instant
      // et suggérer de créer une nouvelle entité
      return NextResponse.json(
        { error: "La modification de l'ID n'est pas supportée. Veuillez créer une nouvelle entité avec le nouvel ID." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Entité mise à jour avec succès",
    })
  } catch (error: any) {
    console.error("Erreur mise à jour entité:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour de l'entité" },
      { status: 500 }
    )
  }
}
