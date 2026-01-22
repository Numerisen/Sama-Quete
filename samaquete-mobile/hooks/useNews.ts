import { useState, useEffect } from 'react'
import { NewsService, ParishNews } from '../lib/newsService'

export function useNews(parishId: string, dioceseId?: string) {
  const [news, setNews] = useState<ParishNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!parishId) {
      setLoading(false)
      setError(null)
      setNews([])
      return
    }

    console.log('📰 Chargement des actualités pour la paroisse:', parishId, 'diocèse:', dioceseId)
    setLoading(true)
    setError(null)
    
    // Écouter les actualités en temps réel (inclut paroisse + diocèse + archidiocèse)
    const unsubscribe = NewsService.subscribeToNews(
      parishId,
      (updatedNews) => {
        console.log('📬 Actualités reçues:', updatedNews.length)
        setNews(updatedNews)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('❌ Erreur abonnement actualités:', err)
        setNews([])
        setLoading(false)
        setError("Impossible de charger les actualités. Veuillez réessayer.")
      },
      dioceseId
    )

    // Nettoyer l'abonnement
    return () => {
      console.log('🔌 Déconnexion de l\'écoute des actualités')
      unsubscribe()
    }
  }, [parishId, dioceseId])

  return {
    news,
    loading,
    error
  }
}

