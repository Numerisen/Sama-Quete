import { useEffect, useState } from 'react'
import { Diocese, Parish, ParishService } from '../lib/parish-service'
import { ChurchStorageService } from '../lib/church-storage'
import { ParishVisitService } from '../lib/parish-visit-service'

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

// Cache global (évite "Chargement des paroisses..." à chaque navigation)
let _cacheLoaded = false
let _cacheLoadingPromise: Promise<void> | null = null
let _cachedParishes: Parish[] = []
let _cachedDioceses: Diocese[] = []
let _cachedSelectedParish: Parish | null = null

export function useParishes(): UseParishesReturn {
  const [parishes, setParishes] = useState<Parish[]>(_cachedParishes)
  const [dioceses, setDioceses] = useState<Diocese[]>(_cachedDioceses)
  const [loading, setLoading] = useState(!_cacheLoaded)
  const [error, setError] = useState<string | null>(null)
  const [selectedParish, setSelectedParish] = useState<Parish | null>(_cachedSelectedParish)

  const loadParishes = async (force: boolean = false) => {
    try {
      if (force || !_cacheLoaded) setLoading(true)
      setError(null)
      
      const [parishesData, diocesesData] = await Promise.all([
        ParishService.getParishes(),
        ParishService.getDioceses()
      ])
      
      _cachedParishes = parishesData
      _cachedDioceses = diocesesData
      setParishes(parishesData)
      setDioceses(diocesesData)
      
      // Essayer de récupérer l'église sauvegardée
      // IMPORTANT: une seule lecture AsyncStorage au premier chargement global
      const savedChurch = _cachedSelectedParish ? _cachedSelectedParish : await ChurchStorageService.getSelectedChurch()
      
      if (savedChurch) {
        // Vérifier que l'église sauvegardée existe encore dans la liste
        const churchExists = parishesData.find(p => p.id === savedChurch.id)
        if (churchExists) {
          _cachedSelectedParish = savedChurch
          setSelectedParish(savedChurch)
          console.log('Église restaurée depuis le stockage:', savedChurch.name)
        } else {
          // L'église sauvegardée n'existe plus, la supprimer
          await ChurchStorageService.clearSelectedChurch()
          _cachedSelectedParish = null
          console.log('Église sauvegardée supprimée car elle n\'existe plus')
        }
      }
      
      // Si aucune paroisse n'est sélectionnée et qu'il y a des paroisses, sélectionner la première
      // SEULEMENT si aucune paroisse n'était déjà sauvegardée
      if (!savedChurch && !_cachedSelectedParish && parishesData.length > 0) {
        const firstParish = parishesData[0]
        _cachedSelectedParish = firstParish
        setSelectedParish(firstParish)
        // Sauvegarder automatiquement la première paroisse
        await ChurchStorageService.saveSelectedChurch(firstParish)
        console.log('Première paroisse sélectionnée et sauvegardée:', firstParish.name)
      }
      _cacheLoaded = true
    } catch (err) {
      console.error('Erreur lors du chargement des paroisses:', err)
      setError('Erreur lors du chargement des paroisses')
    } finally {
      setLoading(false)
    }
  }

  const refreshParishes = async () => {
    await loadParishes(true)
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
    _cachedSelectedParish = parish
    setSelectedParish(parish)
    if (parish) {
      await ChurchStorageService.saveSelectedChurch(parish)
      // Stats globales Firestore (pour "paroisses les plus visitées")
      ParishVisitService.incrementParish(parish.id).catch(() => {})
      console.log('Église changée et sauvegardée:', parish.name)
    } else {
      await ChurchStorageService.clearSelectedChurch()
      console.log('Église désélectionnée')
    }
  }

  useEffect(() => {
    // Charger une seule fois globalement, réutiliser le cache entre écrans
    if (_cacheLoaded) {
      setParishes(_cachedParishes)
      setDioceses(_cachedDioceses)
      setSelectedParish(_cachedSelectedParish)
      setLoading(false)
      return
    }

    if (!_cacheLoadingPromise) {
      _cacheLoadingPromise = loadParishes().finally(() => {
        _cacheLoadingPromise = null
      })
    } else {
      setLoading(true)
      _cacheLoadingPromise.finally(() => {
        setParishes(_cachedParishes)
        setDioceses(_cachedDioceses)
        setSelectedParish(_cachedSelectedParish)
        setLoading(false)
      })
    }
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