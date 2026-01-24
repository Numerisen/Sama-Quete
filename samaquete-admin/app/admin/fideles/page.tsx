"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserCircle, Search, Mail, Phone, MapPin, Download, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { fetchDonations } from "@/lib/api/donations"
import { Donation } from "@/types"
import { ViewToggle, ViewMode } from "@/components/ui/view-toggle"
import { Pagination } from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Fidele {
  uid: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  username: string
  parishId?: string
  parishName?: string
  totalDonations: number
  totalDonationsAmount?: number
  donationCount: number
  donations?: Donation[]
  createdAt: any
  updatedAt: any
}

export default function FidelesPage() {
  const { claims } = useAuth()
  const { toast } = useToast()
  const [fideles, setFideles] = useState<Fidele[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")

  useEffect(() => {
    if (claims?.role === "super_admin" || claims?.role === "archdiocese_admin") {
      loadFideles()
    }
  }, [claims])

  async function loadFideles() {
    try {
      if (!db) {
        throw new Error("Firestore n'est pas initialisé")
      }
      setLoading(true)
      // Essayer avec orderBy, sinon récupérer sans tri
      let querySnapshot
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
        querySnapshot = await getDocs(q)
      } catch (error) {
        // Si l'index n'existe pas, récupérer sans tri
        console.warn("Index createdAt non disponible, récupération sans tri")
        querySnapshot = await getDocs(collection(db, "users"))
      }
      
      const fidelesData = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Fidele[]
      
      // Récupérer les dons pour chaque fidèle
      const fidelesWithDonations = await Promise.all(
        fidelesData.map(async (fidele) => {
          try {
            // Récupérer tous les dons et filtrer par userId
            const allDonations = await fetchDonations()
            const userDonations = allDonations.filter(
              (donation) => donation.userId === fidele.uid || donation.anonymousUid === fidele.uid
            )
            
            const totalDonationsAmount = userDonations
              .filter((d) => d.status === "completed")
              .reduce((sum, d) => sum + d.amount, 0)
            
            return {
              ...fidele,
              donations: userDonations,
              totalDonationsAmount,
              donationCount: userDonations.length,
            }
          } catch (error) {
            console.error(`Erreur chargement dons pour ${fidele.uid}:`, error)
            return {
              ...fidele,
              donations: [],
              totalDonationsAmount: 0,
            }
          }
        })
      )
      
      setFideles(fidelesWithDonations)
    } catch (error) {
      console.error("Erreur chargement fidèles:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les fidèles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredFideles = fideles.filter((fidele) => {
    const search = searchTerm.toLowerCase()
    return (
      fidele.firstName?.toLowerCase().includes(search) ||
      fidele.lastName?.toLowerCase().includes(search) ||
      fidele.email?.toLowerCase().includes(search) ||
      fidele.phone?.toLowerCase().includes(search) ||
      fidele.username?.toLowerCase().includes(search) ||
      fidele.parishName?.toLowerCase().includes(search)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredFideles.length / itemsPerPage)
  const paginatedFideles = useMemo(() => {
    return filteredFideles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [filteredFideles, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  if (claims?.role !== "super_admin" && claims?.role !== "archdiocese_admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fidèles</h1>
          <p className="text-muted-foreground mt-2">
            Accès réservé au super administrateur et à l'admin archidiocèse
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fidèles</h1>
          <p className="text-muted-foreground mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fidèles</h1>
          <p className="text-muted-foreground mt-2">
            Liste des fidèles inscrits sur l'application mobile • {fideles.length} fidèle{fideles.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch("/api/export/fideles?format=csv")
                if (!response.ok) throw new Error("Erreur lors de l'export")
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `fideles_${new Date().toISOString().split("T")[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
              } catch (error) {
                console.error("Erreur export:", error)
                toast({
                  title: "Erreur",
                  description: "Impossible d'exporter les fidèles",
                  variant: "destructive",
                })
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch("/api/export/fideles?format=excel")
                if (!response.ok) throw new Error("Erreur lors de l'export")
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `fideles_${new Date().toISOString().split("T")[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
              } catch (error) {
                console.error("Erreur export:", error)
                toast({
                  title: "Erreur",
                  description: "Impossible d'exporter les fidèles",
                  variant: "destructive",
                })
              }
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email, téléphone, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFideles.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "Aucun fidèle trouvé" : "Aucun fidèle inscrit"}
              </p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="space-y-4">
              {paginatedFideles.map((fidele) => (
                <div
                  key={fidele.uid}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {fidele.firstName} {fidele.lastName}
                        </p>
                        {fidele.parishName && (
                          <Badge variant="outline">{fidele.parishName}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {fidele.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {fidele.phone}
                        </span>
                        {fidele.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {fidele.country}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Username: {fidele.username}</span>
                        <span>Dons: {fidele.donations?.length || fidele.donationCount || 0}</span>
                        <span className="font-semibold text-primary">
                          Total: {(fidele.totalDonationsAmount || fidele.totalDonations || 0).toLocaleString()} FCFA
                        </span>
                        {fidele.createdAt && (
                          <span>
                            Inscrit le: {fidele.createdAt.toDate ? 
                              new Date(fidele.createdAt.toDate()).toLocaleDateString("fr-FR") :
                              new Date(fidele.createdAt).toLocaleDateString("fr-FR")
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Paroisse</TableHead>
                  <TableHead>Dons</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFideles.map((fidele) => (
                  <TableRow key={fidele.uid}>
                    <TableCell className="font-medium">
                      {fidele.firstName} {fidele.lastName}
                    </TableCell>
                    <TableCell>{fidele.email}</TableCell>
                    <TableCell>{fidele.phone}</TableCell>
                    <TableCell>
                      {fidele.parishName ? (
                        <Badge variant="outline">{fidele.parishName}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{fidele.donations?.length || fidele.donationCount || 0}</TableCell>
                    <TableCell className="font-semibold">
                      {(fidele.totalDonationsAmount || fidele.totalDonations || 0).toLocaleString()} FCFA
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filteredFideles.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredFideles.length}
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
