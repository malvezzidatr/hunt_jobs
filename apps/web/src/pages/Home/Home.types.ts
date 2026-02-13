import type { SelectOption } from '@malvezzidatr/zev-react'
import type { JobsQuery, JobsResponse, JobStats, Source } from '../../features/jobs'

// Props do componente (nenhuma neste caso, mas mantendo para consistência)
export interface HomeProps {}

// Estado do hook
export interface HomeState {
  // Filtros
  filters: JobsQuery
  selectedLevels: string[]
  selectedTypes: string[]
  selectedSources: string[]
  showOnlyFavorites: boolean

  // Dados
  jobs: JobsResponse | null
  stats: JobStats | null
  sources: Source[]
  sourceOptions: SelectOption[]

  // Loading states
  loading: boolean
  fetching: boolean
  statsLoading: boolean
  isTransitioning: boolean

  // Error
  error: string | null

  // Favoritos
  favorites: string[]
  favoritesCount: number

  // Novas vagas
  newJobsCount: number

  // Tech profile
  techs: string[]
  techCount: number
  hasProfile: boolean
  availableTags: string[]
  tagsLoading: boolean
  techSearch: string
  techProfileOpen: boolean
  setTechProfileOpen: (open: boolean) => void
}

// Ações do hook
export interface HomeActions {
  // Handlers de filtro
  handleSearchChange: (e: CustomEvent) => void
  handleLevelChange: (e: CustomEvent) => void
  handleTypeChange: (e: CustomEvent) => void
  handleRemoteChange: (e: CustomEvent) => void
  handleSourceChange: (e: CustomEvent) => void
  handlePeriodChange: (e: CustomEvent) => void
  handleSortChange: (e: CustomEvent) => void
  handlePageChange: (e: CustomEvent) => void

  // Ações
  handleToggleFavorites: () => void
  handleCardClick: (jobId: string) => () => void

  // Checkers
  isFavorite: (jobId: string) => boolean
  isNewJob: (dateStr: string) => boolean

  // Formatters
  formatPostedAt: (dateStr?: string) => string

  // Tech profile
  toggleTech: (name: string) => void
  hasTech: (name: string) => boolean
  getMatchScore: (jobTags: string[]) => { score: number; matched: string[] }
  handleTechSearch: (e: CustomEvent) => void
}

// ViewModel completo
export type HomeViewModel = HomeState & HomeActions

// Opções de filtros estáticos
export const levelOptions: SelectOption[] = [
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'JUNIOR', label: 'Júnior' },
]

export const typeOptions: SelectOption[] = [
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'FULLSTACK', label: 'Fullstack' },
  { value: 'MOBILE', label: 'Mobile' },
]

export const remoteOptions: SelectOption[] = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Apenas Remoto' },
  { value: 'false', label: 'Apenas Presencial' },
]

export const periodOptions: SelectOption[] = [
  { value: '24h', label: 'Últimas 24 horas' },
  { value: '7d', label: 'Última semana' },
  { value: '30d', label: 'Último mês' },
]

export const sortOptions: SelectOption[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
]
