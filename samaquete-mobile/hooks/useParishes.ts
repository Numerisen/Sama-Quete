import { useEffect, useState } from 'react'
import { Diocese, Parish, ParishService } from '../lib/parish-service'
import { ChurchStorageService } from '../lib/church-storage'

export interface UseParishesReturn {
  parishes: Parish[]
  dioceses: Diocese[]
  loading: boolean
  error: string | null
  selectedParish: Parish | null
  setSelectedParish: (parish: Parish | null) => void
  refreshParishes: () => Promise<void>
  searchParishes: (searchTerm: string) => Promise<Parish[]>
}

export function useParishes(): UseParishesReturn {
  const [parishes, setParishes] = useState<Parish[]>([])
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedParish, setSelectedParish] = useState<Parish | null>(null)

  const loadParishes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [parishesData, diocesesData] = await Promise.all([
        ParishService.getParishes(),
        ParishService.getDioceses()
      ])
      
      setParishes(parishesData)
      setDioceses(diocesesData)
      
      // Essayer de récupérer l'église sauvegardée
      const savedChurch = await ChurchStorageService.getSelectedChurch()
      
      if (savedChurch) {
        // Vérifier que l'église sauvegardée existe encore dans la liste
        const churchExists = parishesData.find(p => p.id === savedChurch.id)
        if (churchExists) {
          setSelectedParish(savedChurch)
          console.log('Église restaurée depuis le stockage:', savedChurch.name)
        } else {
          // L'église sauvegardée n'existe plus, la supprimer
          await ChurchStorageService.clearSelectedChurch()
          console.log('Église sauvegardée supprimée car elle n\'existe plus')
        }
      }
      
      // Si aucune paroisse n'est sélectionnée et qu'il y a des paroisses, sélectionner la première
      // SEULEMENT si aucune paroisse n'était déjà sauvegardée
      if (!savedChurch && !selectedParish && parishesData.length > 0) {
        const firstParish = parishesData[0]
        setSelectedParish(firstParish)
        // Sauvegarder automatiquement la première paroisse
        await ChurchStorageService.saveSelectedChurch(firstParish)
        console.log('Première paroisse sélectionnée et sauvegardée:', firstParish.name)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des paroisses:', err)
      setError('Erreur lors du chargement des paroisses')
    } finally {
      setLoading(false)
    }
  }

  const refreshParishes = async () => {
    await loadParishes()
  }

  const searchParishes = async (searchTerm: string): Promise<Parish[]> => {
    try {
      return await ParishService.searchParishes(searchTerm)
    } catch (err) {
      console.error('Erreur lors de la recherche de paroisses:', err)
      return []
    }
  }

  // Fonction pour changer d'église avec sauvegarde automatique
  const changeSelectedParish = async (parish: Parish | null) => {
    setSelectedParish(parish)
    if (parish) {
      await ChurchStorageService.saveSelectedChurch(parish)
      console.log('Église changée et sauvegardée:', parish.name)
    } else {
      await ChurchStorageService.clearSelectedChurch()
      console.log('Église désélectionnée')
    }
  }

  useEffect(() => {
    loadParishes()
  }, [])

  return {
    parishes,
    dioceses,
    loading,
    error,
    selectedParish,
    setSelectedParish: changeSelectedParish, // Utiliser la nouvelle fonction avec sauvegarde
    refreshParishes,
    searchParishes
  }
}