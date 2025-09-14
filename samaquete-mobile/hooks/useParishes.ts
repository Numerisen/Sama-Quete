import { useEffect, useState } from 'react'
import { Diocese, Parish, ParishService } from '../lib/parish-service'

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
      
      // Si aucune paroisse n'est sélectionnée et qu'il y a des paroisses, sélectionner la première
      if (!selectedParish && parishesData.length > 0) {
        setSelectedParish(parishesData[0])
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

  useEffect(() => {
    loadParishes()
  }, [])

  return {
    parishes,
    dioceses,
    loading,
    error,
    selectedParish,
    setSelectedParish,
    refreshParishes,
    searchParishes
  }
}