import { useQuery } from '@tanstack/react-query'
import type { AnalyticsQuery } from '../types/dashboard.types'
import { getAnalytics } from '../services/dashboardApi'

export const analyticsKeys = {
  analytics: (query: AnalyticsQuery) => ['analytics', query] as const,
}

export function useAnalytics(query: AnalyticsQuery = {}) {
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: analyticsKeys.analytics(query),
    queryFn: () => getAnalytics(query),
    staleTime: 10 * 60 * 1000,
  })

  const error = queryError instanceof Error
    ? queryError.message
    : queryError ? 'Erro ao carregar analytics' : null

  return { data: data ?? null, loading, error }
}
