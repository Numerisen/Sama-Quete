"use client"
import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Download, MapPin, UserCircle, Users, Upload, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import * as XLSX from 'xlsx'
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"

const diocesesList = [
  "Archidiocèse de Dakar",
  "Diocèse de Thiès",
  "Diocèse de Kaolack",
  "Diocèse de Ziguinchor",
  "Diocèse de Kolda",
  "Diocèse de Tambacounda",
  "Diocèse de Saint-Louis du Sénégal",
]

// Données initiales supprimées - Utilisation uniquement des données Firestore

function exportToCSV(parishes: any[]) {
  const header = ["Nom", "Diocèse", "Ville", "Curé", "Vicaire", "Catéchistes"]
  const rows = parishes.map(p => [p.name, p.diocese, p.city, p.cure, p.vicaire, p.catechists])
  const csvContent = [header, ...rows].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "paroisses.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadTemplate() {
  const header = ["Nom", "Diocèse", "Ville", "Curé", "Vicaire", "Catéchistes"]
  const csvContent = [header].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "modele-paroisses.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Fonction pour importer depuis Excel
function importFromExcel(file: File, setParishes: Function, setImportModal: Function, setMissingColumns: Function, currentDiocese: string, toast: any) {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      if (jsonData.length < 2) {
        toast({
          title: "Fichier invalide",
          description: "Le fichier Excel doit contenir au moins un en-tête et une ligne de données",
          variant: "destructive"
        })
        return
      }
      
      const headers = jsonData[0] as string[]
      const rows = jsonData.slice(1) as any[][]
      
      // Colonnes attendues
      const expectedColumns = ["Nom", "Diocèse", "Ville", "Curé", "Vicaire", "Catéchistes"]
      const missingColumns = expectedColumns.filter(col => !headers.includes(col))
      
      if (missingColumns.length > 0) {
        // Afficher les colonnes manquantes mais permettre l'import
        setMissingColumns(missingColumns)
        setImportModal(true)
        
        // Continuer l'import avec les colonnes disponibles
        const newParishes = rows.map((row, index) => {
          const id = Date.now() + index // Générer un ID unique
          return {
            id,
            name: headers.includes("Nom") ? (row[headers.indexOf("Nom")] || "") : "Nom non spécifié",
            diocese: headers.includes("Diocèse") ? (row[headers.indexOf("Diocèse")] || currentDiocese) : currentDiocese,
            city: headers.includes("Ville") ? (row[headers.indexOf("Ville")] || "") : "Ville non spécifiée",
            cure: headers.includes("Curé") ? (row[headers.indexOf("Curé")] || "") : "",
            vicaire: headers.includes("Vicaire") ? (row[headers.indexOf("Vicaire")] || "") : "",
            catechists: headers.includes("Catéchistes") ? (row[headers.indexOf("Catéchistes")] || "") : "",
          }
        }).filter(parish => parish.name && parish.name !== "Nom non spécifié") // Filtrer les lignes vides
        
        // Ajouter les nouvelles paroisses
        setParishes((prev: any[]) => [...prev, ...newParishes])
        return
      }
      
      // Traitement des données
      const newParishes = rows.map((row, index) => {
        const id = Date.now() + index // Générer un ID unique
        return {
          id,
          name: row[headers.indexOf("Nom")] || "",
          diocese: row[headers.indexOf("Diocèse")] || currentDiocese,
          city: row[headers.indexOf("Ville")] || "",
          cure: row[headers.indexOf("Curé")] || "",
          vicaire: row[headers.indexOf("Vicaire")] || "",
          catechists: row[headers.indexOf("Catéchistes")] || "",
        }
      }).filter(parish => parish.name) // Filtrer les lignes vides
      
      // Ajouter les nouvelles paroisses
      setParishes((prev: any[]) => [...prev, ...newParishes])
      toast.success("Import réussi", `${newParishes.length} paroisses importées avec succès !`)
      
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      toast({
          title: "Erreur d'import",
          description: "Erreur lors de la lecture du fichier Excel",
          variant: "destructive"
        })
    }
  }
  
  reader.readAsArrayBuffer(file)
}

export default function AdminDioceseParishesPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Archidiocèse de Dakar'
  const { toast } = useToast()
  
  const [parishes, setParishes] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({ name: "", diocese: diocese, city: "", cure: "", vicaire: "", catechists: "" })
  const [importModal, setImportModal] = useState(false)
  const [missingColumns, setMissingColumns] = useState<string[]>([])
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
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                       p.city.toLowerCase().includes(search.toLowerCase()) || 
                       p.cure.toLowerCase().includes(search.toLowerCase())
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

  // Suppression
  const handleDelete = (id: number) => {
    if (window.confirm("Confirmer la suppression de cette paroisse ?")) {
      setParishes(parishes.filter(p => p.id !== id))
      toast({
          title: "Paroisse supprimée",
          description: "La paroisse a été supprimée avec succès"
        })
    }
  }

  // Edition inline
  const handleEdit = (item: any) => {
    setEditId(item.id)
    setEditForm({ ...item })
  }
  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = (id: number) => {
    setParishes(parishes.map(p => p.id === id ? { ...editForm, id } : p))
    setEditId(null)
    toast({
          title: "Paroisse modifiée",
          description: "La paroisse a été modifiée avec succès"
        })
  }
  const handleEditCancel = () => {
    setEditId(null)
  }

  // Gestion de l'import de fichier
  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          file.type === "application/vnd.ms-excel") {
        importFromExcel(file, setParishes, setImportModal, setMissingColumns, diocese, toast)
      } else {
        toast({
          title: "Type de fichier invalide",
          description: "Veuillez sélectionner un fichier Excel (.xlsx ou .xls)",
          variant: "destructive"
        })
      }
    }
    // Réinitialiser l'input
    e.target.value = ""
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-black mb-1">
              Gestion des paroisses - {diocese}
            </CardTitle>
            <p className="text-black/80 text-sm">
              Gérez les paroisses de votre diocèse, curés, vicaires, catéchistes et communautés.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-40 bg-white/90 border-blue-200"
            />
            
            {/* Bouton d'import Excel */}
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="excel-import"
              />
              <Button variant="outline" className="flex items-center gap-2 text-black border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
                <Upload className="w-5 h-5" /> Import Excel
              </Button>
            </div>
            
            {/* Bouton pour télécharger le modèle */}
            <Button 
              onClick={downloadTemplate} 
              variant="outline" 
              className="flex items-center gap-2 text-black border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2"
            >
              <Download className="w-5 h-5" /> Modèle
            </Button>
            
            <Button onClick={() => exportToCSV(filteredParishes)} variant="outline" className="flex items-center gap-2 text-black border-blue-200 bg-white/90 hover:bg-blue-50 rounded-xl px-3 py-2">
              <Download className="w-5 h-5" /> Export CSV
            </Button>
            <Link href={`/admindiocese/paroisses/create?diocese=${encodeURIComponent(diocese)}`}>
              <Button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white shadow-lg rounded-xl px-4 py-2">
                <Plus className="w-5 h-5" /> Nouvelle paroisse
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-black/80 text-sm bg-blue-50">
                  <th className="py-3 px-4 text-black">Nom</th>
                  <th className="py-3 px-4 text-black">Ville</th>
                  <th className="py-3 px-4 text-black">Curé</th>
                  <th className="py-3 px-4 text-black">Vicaire</th>
                  <th className="py-3 px-4 text-black">Catéchistes</th>
                  <th className="py-3 px-4 text-right text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedParishes.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="border-b last:border-0 hover:bg-blue-50/40"
                  >
                    {editId === item.id ? (
                      <>
                        <td className="py-2 px-4 font-semibold text-black">
                          <Input name="name" value={editForm.name} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="city" value={editForm.city} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="cure" value={editForm.cure} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="vicaire" value={editForm.vicaire} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4">
                          <Input name="catechists" value={editForm.catechists} onChange={handleEditChange} className="h-8" />
                        </td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEditSave(item.id)}>Enregistrer</Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={handleEditCancel}>Annuler</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 font-semibold text-black">{item.name}</td>
                        <td className="py-2 px-4 text-black">{item.city}</td>
                        <td className="py-2 px-4 text-black">{item.cure}</td>
                        <td className="py-2 px-4 text-black">{item.vicaire}</td>
                        <td className="py-2 px-4 text-black">{item.catechists}</td>
                        <td className="py-2 px-4 text-right flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </>
                    )}
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
                {parishes.length === 0 && (
                  <Link href="/admindiocese/paroisses/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Créer la première paroisse
                    </Button>
                  </Link>
                )}
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

      {/* Modal pour les colonnes manquantes */}
      {importModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-black" />
              <h3 className="text-lg font-semibold text-black">Colonnes manquantes</h3>
            </div>
            
            <p className="text-black mb-4">
              Le fichier Excel a été importé avec succès, mais certaines colonnes sont manquantes. 
              Les données ont été importées avec des valeurs par défaut pour les colonnes manquantes.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-black font-medium mb-2">Colonnes manquantes :</p>
              <ul className="list-disc list-inside text-black space-y-1">
                {missingColumns.map((column, index) => (
                  <li key={index} className="font-medium">{column}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-black text-sm">
                <strong>Colonnes attendues :</strong><br />
                Nom, Diocèse, Ville, Curé, Vicaire, Catéchistes
              </p>
              <p className="text-black text-sm mt-2">
                <strong>Note :</strong> Les paroisses ont été importées. Vous pouvez modifier les valeurs par défaut directement dans le tableau.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setImportModal(false)}
                className="rounded-lg"
              >
                Compris
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
