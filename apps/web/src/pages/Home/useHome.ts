import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useJobs, useSources, useTags, useStats, useNewJobs } from '../../features/jobs'
import { useFavorites } from '../../features/favorites'
import { useTechProfile, getMatchScore, NON_TECH_TAGS } from '../../features/tech-profile'
import type { JobsQuery } from '../../features/jobs'
import type { HomeViewModel } from './Home.types'

// Helper para ler filtros da URL
function getFiltersFromURL(searchParams: URLSearchParams): JobsQuery {
  const page = parseInt(searchParams.get('page') || '1', 10)
  const search = searchParams.get('search') || undefined
  const level = searchParams.get('level') || undefined
  const type = searchParams.get('type') || undefined
  const remoteParam = searchParams.get('remote')
  const remote = remoteParam === null ? undefined : remoteParam === 'true'
  const source = searchParams.get('source') || undefined
  const period = (searchParams.get('period') || undefined) as '24h' | '7d' | '30d' | undefined
  const sort = (searchParams.get('sort') || undefined) as 'recent' | 'oldest' | 'match' | undefined

  return { page, limit: 12, search, level, type, remote, source, period, sort }
}

// Helper para converter filtros em URLSearchParams
function filtersToSearchParams(filters: JobsQuery): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.page && filters.page > 1) params.page = String(filters.page)
  if (filters.search) params.search = filters.search
  if (filters.level) params.level = filters.level
  if (filters.type) params.type = filters.type
  if (filters.remote !== undefined) params.remote = String(filters.remote)
  if (filters.source) params.source = filters.source
  if (filters.period) params.period = filters.period
  if (filters.sort && filters.sort !== 'recent') params.sort = filters.sort as string
  return params
}

export function useHome(): HomeViewModel {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Ler filtros da URL
  const initialFilters = getFiltersFromURL(searchParams)

  const [filters, setFilters] = useState<JobsQuery>(initialFilters)
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Estados separados para multi-selects (inicializar da URL)
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    initialFilters.level ? initialFilters.level.split(',') : []
  )
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initialFilters.type ? initialFilters.type.split(',') : []
  )
  const [selectedSources, setSelectedSources] = useState<string[]>(
    initialFilters.source ? initialFilters.source.split(',') : []
  )

  // Hooks de dados
  const { jobs, loading, fetching, error, updateQuery, replaceQuery, goToPage } = useJobs(filters)
  const { sources } = useSources()
  const { tags: allTags, loading: tagsLoading } = useTags()
  const { stats, loading: statsLoading } = useStats()
  const { favorites, isFavorite, count: favoritesCount } = useFavorites()
  const { isNewJob, countNewJobs, markAsVisited } = useNewJobs()
  const { techs, toggleTech, hasTech, hasProfile, count: techCount } = useTechProfile()

  // Tech profile state
  const [techSearch, setTechSearch] = useState('')
  const [techProfileOpen, setTechProfileOpen] = useState(false)

  // Contar vagas novas quando jobs carregarem
  const newJobsCount = jobs?.data ? countNewJobs(jobs.data) : 0

  // Marcar como visitado após carregar dados (com delay para usuário ver os badges)
  useEffect(() => {
    if (jobs?.data && jobs.data.length > 0) {
      const timeout = setTimeout(() => {
        markAsVisited()
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [jobs?.data, markAsVisited])

  // Sincronizar filtros com a URL
  useEffect(() => {
    const params = filtersToSearchParams(filters)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Resetar transitioning quando fetch terminar
  useEffect(() => {
    if (!fetching && !loading) {
      setIsTransitioning(false)
    }
  }, [fetching, loading])

  // Fallback: resetar transitioning após timeout (caso dados venham do cache)
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
      }, 800)
      return () => clearTimeout(timeout)
    }
  }, [isTransitioning])

  // Atualizar query quando filters mudam (com debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Se tem perfil de techs, enviar techs e sort=match para o backend
      const backendFilters = hasProfile
        ? { ...filters, techs: techs.join(','), sort: 'match' as const }
        : filters
      if (showOnlyFavorites && favorites.length > 0) {
        // Modo favoritos: buscar apenas os IDs favoritos
        updateQuery({ ...backendFilters, ids: favorites.join(',') })
      } else if (showOnlyFavorites && favorites.length === 0) {
        // Modo favoritos mas sem favoritos: query vazia para mostrar empty state
        updateQuery({ ...backendFilters, ids: 'none' })
      } else {
        // Modo normal: substituir completamente a query sem ids
        replaceQuery(backendFilters)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [filters, showOnlyFavorites, favorites, updateQuery, replaceQuery, hasProfile, techs])

  // Handlers
  const handleToggleFavorites = useCallback(() => {
    setIsTransitioning(true)
    setShowOnlyFavorites(prev => !prev)
    setFilters(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleSearchChange = useCallback((e: CustomEvent) => {
    const value = (e as CustomEvent<{ value: string }>).detail?.value ?? ''
    setFilters(prev => ({ ...prev, search: value || undefined, page: 1 }))
  }, [])

  const handleLevelChange = useCallback((e: CustomEvent) => {
    const values = (e as CustomEvent<{ values: string[] }>).detail?.values ?? []
    setSelectedLevels(values)
    setFilters(prev => ({ ...prev, level: values.length > 0 ? values.join(',') : undefined, page: 1 }))
  }, [])

  const handleTypeChange = useCallback((e: CustomEvent) => {
    const values = (e as CustomEvent<{ values: string[] }>).detail?.values ?? []
    setSelectedTypes(values)
    setFilters(prev => ({ ...prev, type: values.length > 0 ? values.join(',') : undefined, page: 1 }))
  }, [])

  const handleRemoteChange = useCallback((e: CustomEvent) => {
    const value = (e as CustomEvent<{ value: string }>).detail?.value ?? ''
    setFilters(prev => ({
      ...prev,
      remote: value === '' ? undefined : value === 'true',
      page: 1,
    }))
  }, [])

  const handleSourceChange = useCallback((e: CustomEvent) => {
    const values = (e as CustomEvent<{ values: string[] }>).detail?.values ?? []
    setSelectedSources(values)
    setFilters(prev => ({ ...prev, source: values.length > 0 ? values.join(',') : undefined, page: 1 }))
  }, [])

  const handlePeriodChange = useCallback((e: CustomEvent) => {
    const value = (e as CustomEvent<{ value: string }>).detail?.value ?? ''
    setFilters(prev => ({ ...prev, period: (value || undefined) as '24h' | '7d' | '30d' | undefined, page: 1 }))
  }, [])

  const handleSortChange = useCallback((e: CustomEvent) => {
    const value = (e as CustomEvent<{ value: string }>).detail?.value ?? 'recent'
    setFilters(prev => ({ ...prev, sort: value as 'recent' | 'oldest' | 'match', page: 1 }))
  }, [])

  const handlePageChange = useCallback((e: CustomEvent) => {
    const page = (e as CustomEvent<{ page: number }>).detail?.page ?? 1
    goToPage(page)
    setFilters(prev => ({ ...prev, page }))
  }, [goToPage])

  const handleCardClick = useCallback((jobId: string) => () => {
    navigate(`/job/${jobId}`)
  }, [navigate])

  const handleTechSearch = useCallback((e: CustomEvent) => {
    const value = (e as CustomEvent<{ value: string }>).detail?.value ?? ''
    setTechSearch(value)
  }, [])

  const computeMatchScore = useCallback((jobTags: string[]) => {
    return getMatchScore(jobTags, techs)
  }, [techs])

  const formatPostedAt = useCallback((dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Hoje'
    if (days === 1) return 'Ontem'
    if (days < 7) return `${days} dias atrás`
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`
    return `${Math.floor(days / 30)} meses atrás`
  }, [])

  // Derived state
  const sourceOptions = sources.map(s => ({ value: s.id, label: s.name }))
  const availableTags = allTags
    .map(t => t.name)
    .filter(name => !NON_TECH_TAGS.has(name.toLowerCase()))
    .filter(name => {
      if (!techSearch) return true
      return name.toLowerCase().includes(techSearch.toLowerCase())
    })

  return {
    // State
    filters,
    selectedLevels,
    selectedTypes,
    selectedSources,
    showOnlyFavorites,
    jobs,
    stats,
    sources,
    sourceOptions,
    loading,
    fetching,
    statsLoading,
    isTransitioning,
    error,
    favorites,
    favoritesCount,
    newJobsCount,

    // Tech profile
    techs,
    techCount,
    hasProfile,
    availableTags,
    tagsLoading,
    techSearch,
    techProfileOpen,
    setTechProfileOpen,

    // Actions
    handleSearchChange,
    handleLevelChange,
    handleTypeChange,
    handleRemoteChange,
    handleSourceChange,
    handlePeriodChange,
    handleSortChange,
    handlePageChange,
    handleToggleFavorites,
    handleCardClick,
    isFavorite,
    isNewJob,
    formatPostedAt,
    toggleTech,
    hasTech,
    getMatchScore: computeMatchScore,
    handleTechSearch,
  }
}
