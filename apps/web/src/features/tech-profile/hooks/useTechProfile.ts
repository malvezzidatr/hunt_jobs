import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth'
import { fetchAPI } from '../../../shared/services/api'

const TECH_PROFILE_KEY = 'huntjobs_tech_profile'

// Normalizar nome da tag removendo emojis e prefixos especiais
function normalizeTag(name: string): string {
  return name.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]/gu, '').trim().toLowerCase()
}

// Checa se a tag é não-técnica (normaliza emojis antes de comparar)
export function isNonTechTag(name: string): boolean {
  return NON_TECH_TAGS.has(normalizeTag(name))
}

// Tags que não são tecnologias — ignoradas no cálculo de match
export const NON_TECH_TAGS = new Set([
  // Regime de contratação
  'clt', 'pj', 'contrato', 'freelance', 'temporário', 'temporario',
  // Níveis
  'júnior', 'junior', 'pleno', 'sênior', 'senior', 'estagiário', 'estagiario', 'estagio', 'estágio',
  'especialista', 'trainee', 'analista', 'líder', 'lider', 'coordenador', 'gerente',
  // Modalidade
  'remoto', 'presencial', 'híbrido', 'hibrido', 'home office', 'remote',
  // Genéricos
  'vaga', 'vagas', 'emprego', 'trabalho', 'oportunidade', 'avisos', 'aviso',
  // Localizações
  'são paulo', 'sao paulo', 'rio de janeiro', 'belo horizonte', 'curitiba',
  'porto alegre', 'brasília', 'brasilia', 'salvador', 'fortaleza', 'recife', 'campinas',
  'sp', 'rj', 'mg', 'pr', 'rs', 'df', 'ba', 'ce', 'pe', 'brasil', 'brazil',
])

export function getMatchScore(
  jobTags: string[],
  userTechs: string[],
): { score: number; matched: string[] } {
  if (userTechs.length === 0) return { score: -1, matched: [] }

  // Filtrar tags não-técnicas antes de calcular
  const techTags = jobTags.filter(tag => !isNonTechTag(tag))
  if (techTags.length === 0) return { score: 0, matched: [] }

  const userSet = new Set(userTechs.map(t => t.toLowerCase()))
  const matched = techTags.filter(tag => userSet.has(tag.toLowerCase()))
  const score = Math.round((matched.length / techTags.length) * 100)

  return { score, matched }
}

export function getMatchLevel(score: number): 'high' | 'medium' | 'low' | 'none' | null {
  if (score === -1) return null
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  if (score > 0) return 'low'
  return 'none'
}

function getLocalTechs(): string[] {
  try {
    const stored = localStorage.getItem(TECH_PROFILE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function useTechProfile() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const migratedRef = useRef(false)

  // Local state for anonymous users
  const [localTechs, setLocalTechs] = useState<string[]>(getLocalTechs)

  // Sync local state to localStorage (anonymous only)
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(TECH_PROFILE_KEY, JSON.stringify(localTechs))
      } catch {
        // Ignore
      }
    }
  }, [localTechs, isAuthenticated])

  // Server state for authenticated users
  const { data: serverTechs } = useQuery({
    queryKey: ['profile', 'techs'],
    queryFn: () => fetchAPI<{ techs: string[] }>('/profile/techs').then(r => r.techs),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  const mutation = useMutation({
    mutationFn: (techs: string[]) =>
      fetchAPI<{ techs: string[] }>('/profile/techs', {
        method: 'PUT',
        body: JSON.stringify({ techs }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'techs'], data.techs)
    },
  })

  // Migration: push localStorage techs to server on first login
  useEffect(() => {
    if (!isAuthenticated || serverTechs === undefined || migratedRef.current) return
    migratedRef.current = true

    const local = getLocalTechs()
    if (local.length > 0 && serverTechs.length === 0) {
      mutation.mutate(local)
      localStorage.removeItem(TECH_PROFILE_KEY)
      setLocalTechs([])
    }
  }, [isAuthenticated, serverTechs, mutation])

  // Resolved techs
  const techs = isAuthenticated ? (serverTechs ?? []) : localTechs

  const saveTechs = useCallback(
    (newTechs: string[]) => {
      if (isAuthenticated) {
        mutation.mutate(newTechs)
      } else {
        setLocalTechs(newTechs)
      }
    },
    [isAuthenticated, mutation],
  )

  const addTech = useCallback(
    (name: string) => {
      const normalized = name.toLowerCase().trim()
      if (techs.includes(normalized)) return
      saveTechs([...techs, normalized])
    },
    [techs, saveTechs],
  )

  const removeTech = useCallback(
    (name: string) => {
      const normalized = name.toLowerCase().trim()
      saveTechs(techs.filter(t => t !== normalized))
    },
    [techs, saveTechs],
  )

  const toggleTech = useCallback(
    (name: string) => {
      const normalized = name.toLowerCase().trim()
      if (techs.includes(normalized)) {
        saveTechs(techs.filter(t => t !== normalized))
      } else {
        saveTechs([...techs, normalized])
      }
    },
    [techs, saveTechs],
  )

  const hasTech = useCallback(
    (name: string) => techs.includes(name.toLowerCase().trim()),
    [techs],
  )

  const clearProfile = useCallback(() => {
    saveTechs([])
  }, [saveTechs])

  return {
    techs,
    addTech,
    removeTech,
    toggleTech,
    hasTech,
    clearProfile,
    count: techs.length,
    hasProfile: techs.length > 0,
  }
}
