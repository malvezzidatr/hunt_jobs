import { useState, useCallback } from 'react'
import { useAnalytics } from '../../features/dashboard'
import type { AnalyticsQuery } from '../../features/dashboard'
import type { DashboardViewModel } from './Dashboard.types'

export function useDashboard(): DashboardViewModel {
  const [filters, setFilters] = useState<AnalyticsQuery>({
    period: '30d',
    level: 'ALL',
  })

  const { data, loading, error } = useAnalytics(filters)

  const handlePeriodChange = useCallback((e: CustomEvent) => {
    const value = (e as CustomEvent<{ value: string }>).detail?.value ?? '30d'
    setFilters(prev => ({ ...prev, period: value as AnalyticsQuery['period'] }))
  }, [])

  const handleLevelChange = useCallback((e: CustomEvent) => {
    const value = (e as CustomEvent<{ value: string }>).detail?.value ?? 'ALL'
    setFilters(prev => ({ ...prev, level: value as AnalyticsQuery['level'] }))
  }, [])

  return {
    data,
    loading,
    error,
    filters,
    handlePeriodChange,
    handleLevelChange,
  }
}
