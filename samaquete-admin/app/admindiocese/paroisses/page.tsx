"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, UserCircle, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"

// Données initiales supprimées - Utilisation uniquement des données Firestore

export default function AdminDioceseParishesPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'
  const { toast } = useToast()
  
  const [parishes, setParishes] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Charger les paroisses depuis Firestore
  useEffect(() => {
    const loadParishes = async () => {
      try {
        // TODO: Implémenter le chargement depuis Firestore
        // const firestoreParishes = await ParishService.getAll()
        // const dioceseParishes = firestoreParishes.filter(p => p.diocese === diocese)
        // setParishes(dioceseParishes)
        setParishes([]) // Aucune donnée pour le moment
      } catch (error) {
        console.error('Erreur lors du chargement des paroisses:', error)
        setParishes([])
      }
    }
    loadParishes()
  }, [diocese])

  // Filtres et recherche
  const filteredParishes = parishes.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                       p.city?.toLowerCase().includes(search.toLowerCase()) ||
                       p.cure?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredParishes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedParishes = filteredParishes.slice(startIndex, endIndex)

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, parishes])

  // Fonctions de modification et suppression supprimées - Mode consultation uniquement

  return (
    <div className="max-w-6xl mx-auto">
      {/* Liste des paroisses */}
      <Card className="shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Paroisses - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Consultez les paroisses de votre diocèse.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-blue-200"
            />
            {/* Boutons d'action supprimés - Mode consultation uniquement */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Nom</th>
                  <th className="py-3 px-4 text-black">Ville</th>
                  <th className="py-3 px-4 text-black">Curé</th>
                  <th className="py-3 px-4 text-black">Vicaire</th>
                  <th className="py-3 px-4 text-black">Catéchistes</th>
                  <th className="py-3 px-4 text-black">Membres</th>
                  {/* Colonne Actions supprimée - Mode consultation uniquement */}
                </tr>
              </thead>
              <tbody>
                {paginatedParishes.map((parish, i) => (
                  <motion.tr
                    key={parish.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    {/* Mode consultation uniquement - Pas d'édition ni suppression */}
                    <td className="py-2 px-4 font-semibold text-black">{parish.name || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.city || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.cure || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.vicaire || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.catechists || 'N/A'}</td>
                    <td className="py-2 px-4 text-black">{parish.members || 0}</td>
                    {/* Actions supprimées - Mode consultation uniquement */}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {paginatedParishes.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune paroisse trouvée</h3>
                <p className="text-gray-600 mb-6">
                  {parishes.length === 0 
                    ? `Aucune paroisse n'est enregistrée dans Firestore pour le diocèse ${diocese}.`
                    : "Aucune paroisse ne correspond à vos critères de recherche."
                  }
                </p>
                {/* Bouton de création supprimé - Mode consultation uniquement */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredParishes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredParishes.length}
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