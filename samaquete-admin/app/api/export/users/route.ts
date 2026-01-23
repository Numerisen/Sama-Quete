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

// Fonction pour convertir en CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return ""
  
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ""
        if (typeof value === "object") return JSON.stringify(value)
        return String(value).replace(/"/g, '""')
      }).join(",")
    )
  ]
  
  return csvRows.join("\n")
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const format = searchParams.get("format") || "csv"

    const app = getFirebaseAdmin()
    const auth = getAuth(app)

    // Récupérer tous les utilisateurs (limite de 1000)
    const listUsersResult = await auth.listUsers(1000)
    
    // Transformer les utilisateurs pour l'export
    const exportData = listUsersResult.users.map((userRecord) => {
      const customClaims = userRecord.customClaims || {}
      return {
        "UID": userRecord.uid,
        "Email": userRecord.email || "",
        "Nom": userRecord.displayName || "",
        "Rôle": customClaims.role || "",
        "Diocèse ID": customClaims.dioceseId || "",
        "Paroisse ID": customClaims.parishId || "",
        "Église ID": customClaims.churchId || "",
        "Archidiocèse ID": customClaims.archdioceseId || "",
        "Email vérifié": userRecord.emailVerified ? "Oui" : "Non",
        "Compte désactivé": userRecord.disabled ? "Oui" : "Non",
        "Date de création": userRecord.metadata.creationTime,
        "Dernière connexion": userRecord.metadata.lastSignInTime || "",
      }
    })

    const csvContent = convertToCSV(exportData)
    const filename = `utilisateurs_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "csv" : "csv"}`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": format === "excel" 
          ? "application/vnd.ms-excel" 
          : "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("Erreur export utilisateurs:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'export des utilisateurs" },
      { status: 500 }
    )
  }
}
