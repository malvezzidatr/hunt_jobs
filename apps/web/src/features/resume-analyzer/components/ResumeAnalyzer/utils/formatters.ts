import type { AnalysisResult } from '../../../types/resume.types'
import type { RecommendationLabel } from '../ResumeAnalyzer.types'

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getScoreVariant(score: number): 'success' | 'warning' | 'error' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'error'
}

export function getRecommendationLabel(recommendation: AnalysisResult['recommendation']): RecommendationLabel {
  switch (recommendation) {
    case 'APLICAR':
      return { text: 'Recomendado Aplicar', className: 'recommendation-apply' }
    case 'MELHORAR':
      return { text: 'Pode Melhorar', className: 'recommendation-improve' }
    case 'NAO_RECOMENDADO':
      return { text: 'Não Recomendado', className: 'recommendation-not' }
  }
}
