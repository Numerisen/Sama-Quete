"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, MapPin, User } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"

// Données initiales supprimées - Utilisation uniquement des données Firestore

export default function AdminDioceseLiturgyPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()
  
  const [liturgy, setLiturgy] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Charger les célébrations depuis Firestore
  useEffect(() => {
    const loadLiturgy = async () => {
      try {
        // TODO: Implémenter le chargement depuis Firestore
        // const firestoreLiturgy = await LiturgyService.getAll()
        // const dioceseLiturgy = firestoreLiturgy.filter(l => l.diocese === diocese)
        // setLiturgy(dioceseLiturgy)
        setLiturgy([]) // Aucune donnée pour le moment
      } catch (error) {
        console.error('Erreur lors du chargement des célébrations:', error)
        setLiturgy([])
      }
    }
    loadLiturgy()
  }, [diocese])

  // Filtres et recherche
  const filteredLiturgy = liturgy.filter(l => {
    const matchSearch = l.title?.toLowerCase().includes(search.toLowerCase()) || 
                       l.description?.toLowerCase().includes(search.toLowerCase()) ||
                       l.location?.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || l.type === typeFilter
    return matchSearch && matchType
  })

  // Pagination
  const totalPages = Math.ceil(filteredLiturgy.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLiturgy = filteredLiturgy.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter, liturgy])

  // Fonctions de modification et suppression supprimées - Mode consultation uniquement

  const types = ["Messe", "Adoration", "Vêpres", "Confession", "Baptême", "Mariage", "Autre"]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Liste des célébrations */}
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Célébrations - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Consultez les célébrations de votre diocèse.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-blue-200"
            />
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="h-10 rounded px-2 border-blue-200 bg-white/90 text-black"
            >
              <option value="all">Tous les types</option>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {/* Boutons d'action supprimés - Mode consultation uniquement */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Titre</th>
                  <th className="py-3 px-4 text-black">Type</th>
                  <th className="py-3 px-4 text-black">Date</th>
                  <th className="py-3 px-4 text-black">Heure</th>
                  <th className="py-3 px-4 text-black">Lieu</th>
                  <th className="py-3 px-4 text-black">Prêtre</th>
                  {/* Colonne Actions supprimée - Mode consultation uniquement */}
                </tr>
              </thead>
              <tbody>
                {paginatedLiturgy.map((celebration, i) => (
                  <motion.tr
                    key={celebration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    {/* Mode consultation uniquement - Pas d'édition ni suppression */}
                    <td className="py-2 px-4 font-semibold text-black">{celebration.title || 'N/A'}</td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {celebration.type || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-black">{celebration.date || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{celebration.time || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{celebration.location || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{celebration.priest || 'N/A'}</td>
                    {/* Actions supprimées - Mode consultation uniquement */}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {paginatedLiturgy.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune célébration trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {liturgy.length === 0 
                    ? `Aucune célébration n'est enregistrée dans Firestore pour le diocèse ${diocese}.`
                    : "Aucune célébration ne correspond à vos critères de recherche."
                  }
                </p>
                {/* Bouton de création supprimé - Mode consultation uniquement */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredLiturgy.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLiturgy.length}
          itemsPerPage={itemsPerPage}
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