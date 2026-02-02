import { useState, useCallback, useMemo } from 'react'

const LAST_VISIT_KEY = 'huntjobs_last_visit'

export function useNewJobs() {
  const [lastVisit, setLastVisit] = useState<Date | null>(() => {
    try {
      const stored = localStorage.getItem(LAST_VISIT_KEY)
      return stored ? new Date(stored) : null
    } catch {
      return null
    }
  })

  // Data de referência: última visita ou 24h atrás (para primeira visita)
  const referenceDate = useMemo(() => {
    if (lastVisit) return lastVisit
    // Primeira visita: considerar vagas das últimas 24h como "novas"
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)
    return yesterday
  }, [lastVisit])

  // Atualizar timestamp da última visita
  const markAsVisited = useCallback(() => {
    const now = new Date()
    setLastVisit(now)
    try {
      localStorage.setItem(LAST_VISIT_KEY, now.toISOString())
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Verificar se uma vaga é nova (postada após a última visita ou nas últimas 24h)
  const isNewJob = useCallback((jobDate: string | undefined): boolean => {
    if (!jobDate) return false
    const jobDateTime = new Date(jobDate)
    return jobDateTime > referenceDate
  }, [referenceDate])

  // Contar vagas novas em uma lista
  const countNewJobs = useCallback((jobs: { postedAt?: string; createdAt: string }[]): number => {
    return jobs.filter(job => {
      const dateToCheck = job.postedAt || job.createdAt
      return new Date(dateToCheck) > referenceDate
    }).length
  }, [referenceDate])

  // Tempo desde última visita formatado
  const timeSinceLastVisit = useMemo((): string | null => {
    if (!lastVisit) return null

    const now = new Date()
    const diff = now.getTime() - lastVisit.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`
    return 'agora'
  }, [lastVisit])

  // Primeira visita?
  const isFirstVisit = lastVisit === null

  return {
    lastVisit,
    isFirstVisit,
    isNewJob,
    countNewJobs,
    markAsVisited,
    timeSinceLastVisit,
  }
}
