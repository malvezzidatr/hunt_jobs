import { useState, useEffect, useCallback } from 'react'

const TECH_PROFILE_KEY = 'huntjobs_tech_profile'

// Tags que não são tecnologias — ignoradas no cálculo de match
export const NON_TECH_TAGS = new Set([
  'clt', 'pj', 'contrato', 'freelance', 'temporário', 'temporario',
  'júnior', 'junior', 'pleno', 'sênior', 'senior', 'estagiário', 'estagiario', 'estagio', 'estágio',
  'especialista', 'trainee', 'analista', 'líder', 'lider', 'coordenador', 'gerente',
  'remoto', 'presencial', 'híbrido', 'hibrido', 'home office', 'remote',
  'vaga', 'vagas', 'emprego', 'trabalho', 'oportunidade',
])

export function getMatchScore(
  jobTags: string[],
  userTechs: string[],
): { score: number; matched: string[] } {
  if (userTechs.length === 0) return { score: -1, matched: [] }

  // Filtrar tags não-técnicas antes de calcular
  const techTags = jobTags.filter(tag => !NON_TECH_TAGS.has(tag.toLowerCase()))
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

export function useTechProfile() {
  const [techs, setTechs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(TECH_PROFILE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(TECH_PROFILE_KEY, JSON.stringify(techs))
    } catch {
      // Ignore localStorage errors
    }
  }, [techs])

  const addTech = useCallback((name: string) => {
    const normalized = name.toLowerCase().trim()
    setTechs(prev => {
      if (prev.includes(normalized)) return prev
      return [...prev, normalized]
    })
  }, [])

  const removeTech = useCallback((name: string) => {
    const normalized = name.toLowerCase().trim()
    setTechs(prev => prev.filter(t => t !== normalized))
  }, [])

  const toggleTech = useCallback((name: string) => {
    const normalized = name.toLowerCase().trim()
    setTechs(prev => {
      if (prev.includes(normalized)) {
        return prev.filter(t => t !== normalized)
      }
      return [...prev, normalized]
    })
  }, [])

  const hasTech = useCallback((name: string) => {
    return techs.includes(name.toLowerCase().trim())
  }, [techs])

  const clearProfile = useCallback(() => {
    setTechs([])
  }, [])

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
