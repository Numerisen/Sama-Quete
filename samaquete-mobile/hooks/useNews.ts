import { useState, useEffect } from 'react'
import { NewsService, ParishNews } from '../lib/newsService'

export function useNews(parishId: string) {
  const [news, setNews] = useState<ParishNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!parishId) {
      setLoading(false)
      return
    }

    console.log('📰 Chargement des actualités pour la paroisse:', parishId)
    
    // Écouter les actualités en temps réel
    const unsubscribe = NewsService.subscribeToNews(
      parishId,
      (updatedNews) => {
        console.log('📬 Actualités reçues:', updatedNews.length)
        setNews(updatedNews)
        setLoading(false)
        setError(null)
      }
    )

    // Nettoyer l'abonnement
    return () => {
      console.log('🔌 Déconnexion de l\'écoute des actualités')
      unsubscribe()
    }
  }, [parishId])

  return {
    news,
    loading,
    error
  }
}

