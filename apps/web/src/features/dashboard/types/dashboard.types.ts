export interface AnalyticsQuery {
  period?: '7d' | '30d' | '90d'
  level?: 'ESTAGIO' | 'JUNIOR' | 'ALL'
}

export interface AnalyticsResponse {
  summary: {
    totalActive: number
    remotePercentage: number
    topTechnology: string | null
    topArea: string | null
  }
  topTechnologies: Array<{ name: string; count: number }>
  jobsByArea: Array<{ area: string; count: number }>
  temporalTrend: Array<{
    period: string
    counts: Array<{ area: string; count: number }>
  }>
  workModality: Array<{ modality: string; count: number }>
  topCompanies: Array<{ company: string; count: number }>
}
