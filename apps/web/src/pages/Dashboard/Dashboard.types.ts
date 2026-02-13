import type { SelectOption } from '@malvezzidatr/zev-react'
import type { AnalyticsResponse, AnalyticsQuery } from '../../features/dashboard'

export interface DashboardState {
  data: AnalyticsResponse | null
  loading: boolean
  error: string | null
  filters: AnalyticsQuery
}

export interface DashboardActions {
  handlePeriodChange: (e: CustomEvent) => void
  handleLevelChange: (e: CustomEvent) => void
}

export type DashboardViewModel = DashboardState & DashboardActions

export const periodOptions: SelectOption[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
]

export const levelOptions: SelectOption[] = [
  { value: 'ALL', label: 'Todos os níveis' },
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'JUNIOR', label: 'Júnior' },
]
