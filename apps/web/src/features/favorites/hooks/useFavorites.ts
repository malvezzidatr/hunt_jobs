import { useState, useEffect, useCallback } from 'react'

const FAVORITES_KEY = 'huntjobs_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch {
      // Ignore localStorage errors
    }
  }, [favorites])

  const addFavorite = useCallback((jobId: string) => {
    setFavorites(prev => {
      if (prev.includes(jobId)) return prev
      return [...prev, jobId]
    })
  }, [])

  const removeFavorite = useCallback((jobId: string) => {
    setFavorites(prev => prev.filter(id => id !== jobId))
  }, [])

  const toggleFavorite = useCallback((jobId: string) => {
    setFavorites(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId)
      }
      return [...prev, jobId]
    })
  }, [])

  const isFavorite = useCallback((jobId: string) => {
    return favorites.includes(jobId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  }
}
