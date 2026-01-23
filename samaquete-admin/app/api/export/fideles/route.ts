import { NextRequest, NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Forcer le rendu dynamique pour cette route
export const dynamic = 'force-dynamic'

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
        if (typeof value === "object") {
          if (value.toDate) {
            return value.toDate().toLocaleString("fr-FR")
          }
          return JSON.stringify(value)
        }
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
    const db = getFirestore(app)

    // Récupérer tous les fidèles
    const usersSnapshot = await db.collection("users").get()
    
    // Transformer les données pour l'export
    const exportData = usersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        "UID": doc.id,
        "Prénom": data.firstName || "",
        "Nom": data.lastName || "",
        "Email": data.email || "",
        "Téléphone": data.phone || "",
        "Pays": data.country || "",
        "Username": data.username || "",
        "Paroisse ID": data.parishId || "",
        "Nom Paroisse": data.parishName || "",
        "Total Dons (FCFA)": data.totalDonations || 0,
        "Nombre de dons": data.donationCount || 0,
        "Date d'inscription": data.createdAt?.toDate ? 
          data.createdAt.toDate().toLocaleString("fr-FR") :
          (data.createdAt ? new Date(data.createdAt).toLocaleString("fr-FR") : ""),
        "Dernière mise à jour": data.updatedAt?.toDate ?
          data.updatedAt.toDate().toLocaleString("fr-FR") :
          (data.updatedAt ? new Date(data.updatedAt).toLocaleString("fr-FR") : ""),
      }
    })

    const csvContent = convertToCSV(exportData)
    const filename = `fideles_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "csv" : "csv"}`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": format === "excel" 
          ? "application/vnd.ms-excel" 
          : "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("Erreur export fidèles:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'export des fidèles" },
      { status: 500 }
    )
  }
}
