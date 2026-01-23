import { NextRequest, NextResponse } from "next/server"
import { fetchDonations } from "@/lib/api/donations"

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

// Fonction pour convertir en Excel (format simple CSV avec en-têtes)
function convertToExcel(data: any[]): string {
  return convertToCSV(data)
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const format = searchParams.get("format") || "csv" // csv ou excel
    const parishId = searchParams.get("parishId") || undefined
    const dioceseId = searchParams.get("dioceseId") || undefined

    // Récupérer les dons
    const donations = await fetchDonations(parishId, dioceseId)

    // Formater les données pour l'export
    const exportData = donations.map((donation) => ({
      "ID Don": donation.donationId,
      "Montant (FCFA)": donation.amount || donation.amount || 0,
      "Statut": donation.status === "completed" ? "Complété" : 
                donation.status === "pending" ? "En attente" : 
                donation.status === "failed" ? "Échoué" : donation.status,
      "Méthode de paiement": donation.paymentMethod || "PayDunya",
      "Paroisse ID": donation.parishId || "",
      "Utilisateur ID": donation.userId || "",
      "Date de création": donation.createdAt instanceof Date 
        ? donation.createdAt.toLocaleString("fr-FR")
        : new Date(donation.createdAt).toLocaleString("fr-FR"),
    }))

    const csvContent = convertToCSV(exportData)
    const filename = `dons_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "csv" : "csv"}`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": format === "excel" 
          ? "application/vnd.ms-excel" 
          : "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("Erreur export dons:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'export des dons" },
      { status: 500 }
    )
  }
}
