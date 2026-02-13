import { fetchAPI } from '../../../shared/services/api'
import type { AnalyticsResponse, AnalyticsQuery } from '../types/dashboard.types'

export async function getAnalytics(query: AnalyticsQuery = {}): Promise<AnalyticsResponse> {
  const params = new URLSearchParams()
  if (query.period) params.set('period', query.period)
  if (query.level) params.set('level', query.level)
  const queryString = params.toString()
  return fetchAPI<AnalyticsResponse>(`/jobs/analytics${queryString ? `?${queryString}` : ''}`)
}
