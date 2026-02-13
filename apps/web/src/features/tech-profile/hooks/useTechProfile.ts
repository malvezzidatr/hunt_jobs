import { useState, useEffect, useCallback } from 'react'

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
