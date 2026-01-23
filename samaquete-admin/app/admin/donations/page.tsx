"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { fetchDonations, fetchDonationStats } from "@/lib/api/donations"
import { Donation } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"

export default function DonationsPage() {
  const { claims } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadDonations()
  }, [claims])

  async function loadDonations() {
    try {
      setLoading(true);
      console.log("🔄 Chargement des dons avec claims:", claims);
      console.log("🌐 URL API:", process.env.NEXT_PUBLIC_DONATIONS_API_URL);
      
      const [donationsData, statsData] = await Promise.all([
        fetchDonations(claims?.parishId, claims?.dioceseId),
        fetchDonationStats(claims?.parishId, claims?.dioceseId),
      ])
      
      console.log("✅ Dons chargés:", donationsData.length);
      console.log("📊 Détails des dons:", donationsData);
      console.log("✅ Stats:", statsData);
      
      setDonations(donationsData)
      setStats(statsData)
    } catch (error) {
      console.error("❌ Erreur chargement dons:", error);
      // Afficher l'erreur à l'utilisateur
      setDonations([]);
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        totalAmount: 0,
      });
    } finally {
      setLoading(false)
    }
  }

  // Trier les dons
  const sortedDonations = [...donations].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB
  })

  // Pagination
  const totalPages = Math.ceil(sortedDonations.length / itemsPerPage)
  const paginatedDonations = sortedDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [sortOrder, itemsPerPage])

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dons</h1>
          <p className="text-muted-foreground mt-2">
            Consultation des dons (lecture seule)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récent au plus ancien</SelectItem>
              <SelectItem value="oldest">Plus ancien au plus récent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Complétés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

      {donations.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun don trouvé.
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold">Vérifications à faire :</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Les dons ont été effectués depuis l'app mobile</li>
                <li>Les paiements ont été complétés (statut PAID)</li>
                <li>L'API de paiement est accessible</li>
                <li>Votre rôle admin a les permissions nécessaires</li>
                <li>Ouvrez la console (F12) pour voir les logs détaillés</li>
              </ul>
              <p className="mt-4 text-xs">
                💡 Les dons en attente (PENDING) peuvent ne pas apparaître immédiatement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {paginatedDonations.map((donation) => (
          <Card key={donation.donationId}>
            <CardHeader>
              <CardTitle className="text-lg">
                {donation.amount.toLocaleString()} FCFA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Statut: {donation.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Méthode: {donation.paymentMethod}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(donation.createdAt), "PPpp")}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  donation.status === "completed" ? "bg-green-100 text-green-800" :
                  donation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {donation.status}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedDonations.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedDonations.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}
