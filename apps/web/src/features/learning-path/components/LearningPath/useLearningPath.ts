import { useState, useCallback } from 'react'
import { generateLearningPath } from '../../services/learningPathApi'
import type { LearningPathResponse, LearningPathViewModel } from './LearningPath.types'

export function useLearningPath(jobId: string): LearningPathViewModel {
  const [data, setData] = useState<LearningPathResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const onGenerate = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const result = await generateLearningPath(jobId)
      setData(result)
      // Expande o primeiro card automaticamente
      if (result.technologies.length > 0) {
        setExpandedCard(result.technologies[0].name)
      }
    } catch (err) {
      setErrorMessage('Erro ao gerar trilha de aprendizado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  const onToggleCard = useCallback((techName: string) => {
    setExpandedCard(prev => prev === techName ? null : techName)
  }, [])

  return {
    // State
    data,
    isLoading,
    hasError: !!errorMessage,
    errorMessage,
    expandedCard,
    hasData: !!data,
    techCount: data?.technologies.length ?? 0,
    // Actions
    onGenerate,
    onToggleCard,
  }
}
