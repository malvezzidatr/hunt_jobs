// Tipos locais do componente FeaturedJobs
// Representam dados transformados para a View (não são os tipos da API)

export type CompanyColors = [primary: string, secondary: string, accent: string]

export interface FeaturedJobCard {
  id: string
  title: string
  company: string
  location?: string
  colors: CompanyColors
  badgeText: string
  subtitle: string
  logoUrl: string
  isLightBg: boolean
}

// Estado do ViewModel
export interface FeaturedJobsState {
  jobs: FeaturedJobCard[]
  isLoading: boolean
  isEmpty: boolean
  hasError: boolean
}

// Ações do ViewModel
export interface FeaturedJobsActions {
  onJobClick: (jobId: string) => void
}

// Props do componente
export interface FeaturedJobsProps {
  limit?: number
}
