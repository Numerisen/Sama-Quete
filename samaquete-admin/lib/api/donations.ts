import { Donation } from "@/types";
import { getCurrentUser } from "@/lib/auth";

// Utiliser le proxy Next.js pour éviter les problèmes CORS
const API_URL = typeof window !== "undefined" ? "/api/donations" : (process.env.NEXT_PUBLIC_DONATIONS_API_URL || "");

// Helper pour obtenir le token Firebase
async function getAuthToken(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return await user.getIdToken();
}

export async function fetchDonations(
  parishId?: string,
  dioceseId?: string
): Promise<Donation[]> {
  try {
    const params = new URLSearchParams();
    if (parishId) params.append("parishId", parishId);
    if (dioceseId) params.append("dioceseId", dioceseId);

    // Utiliser le proxy Next.js en développement pour éviter CORS
    const url = `${API_URL}?${params.toString()}`;
    console.log("📡 Récupération des dons depuis:", url);

    // Obtenir le token pour le proxy
    const token = await getAuthToken();
    if (!token) {
      console.error("❌ Non authentifié - impossible de récupérer les dons");
      throw new Error("Non authentifié");
    }

    // Utiliser le proxy Next.js qui transmet le token à l'API de paiement
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("📊 Réponse API:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur API:", response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("📦 Données reçues de l'API:", {
      totalPayments: data.payments?.length || 0,
      total: data.total,
      donations: data.donations,
      allPayments: data.allPayments,
      firstPayment: data.payments?.[0] || null
    });

    // L'API devrait déjà retourner seulement les dons, mais on filtre quand même pour sécurité
    const allPayments = data.payments || [];
    console.log("🔍 Analyse des paiements:", {
      total: allPayments.length,
      samplePlanIds: allPayments.slice(0, 5).map((p: any) => p.planId)
    });

    // Filtrer seulement les dons (planId commence par DONATION_)
    const donations = allPayments
      .filter((payment: any) => {
        const planId = payment.planId || "";
        const isDonation = planId.startsWith("DONATION_") || 
                          payment.type === "donation" ||
                          planId.toLowerCase().includes("donation");
        
        if (!isDonation && allPayments.length <= 10) {
          // Log seulement si peu de paiements pour éviter le spam
          console.log("⚠️ Payment ignoré (pas un don):", {
            id: payment.id,
            planId: payment.planId,
            type: payment.type,
            status: payment.status
          });
        }
        return isDonation;
      })
      .map((payment: any) => {
        // Normaliser le statut (PAID -> completed, PENDING -> pending, etc.)
        const status = payment.status?.toUpperCase();
        let normalizedStatus = "pending";
        if (status === "PAID" || status === "COMPLETED") {
          normalizedStatus = "completed";
        } else if (status === "PENDING") {
          normalizedStatus = "pending";
        } else if (status === "CANCELED" || status === "CANCELLED" || status === "FAILED") {
          normalizedStatus = "failed";
        } else if (status === "EXPIRED") {
          normalizedStatus = "failed";
        }
        
        return {
          donationId: payment.id?.toString() || payment.paymentId?.toString() || "",
          amount: payment.amount || 0,
          status: normalizedStatus,
          paymentMethod: payment.provider || payment.paymentMethod || "paydunya",
          parishId: payment.parishId || "", // Sera vide car pas dans la table payments
          userId: payment.uid || payment.userId || payment.anonymousUid || "",
          createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(payment.created_at),
        };
      });

    console.log("✅ Dons filtrés:", donations.length);
    return donations;
  } catch (error) {
    console.error("❌ Erreur API dons:", error);
    return [];
  }
}

export async function fetchDonationStats(
  parishId?: string,
  dioceseId?: string
): Promise<{
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalAmount: number;
}> {
  try {
    const donations = await fetchDonations(parishId, dioceseId);
    
    // Calculer les statistiques depuis les dons récupérés
    const total = donations.length;
    const completed = donations.filter(d => d.status === "completed").length;
    const pending = donations.filter(d => d.status === "pending").length;
    const failed = donations.filter(d => d.status === "failed" || d.status === "cancelled").length;
    const totalAmount = donations
      .filter(d => d.status === "completed")
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      total,
      completed,
      pending,
      failed,
      totalAmount,
    };
  } catch (error) {
    console.error("Erreur API stats:", error);
    return {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      totalAmount: 0,
    };
  }
}
