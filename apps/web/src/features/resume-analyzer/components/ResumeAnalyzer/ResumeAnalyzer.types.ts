import type { AnalysisResult } from '../../types/resume.types'

// Props do componente
export interface ResumeAnalyzerProps {
  jobId: string
  jobTitle: string
  isOpen: boolean
  onClose: () => void
}

// ViewModel State
export interface ResumeAnalyzerState {
  file: File | null
  isAnalyzing: boolean
  result: AnalysisResult | null
  hasError: boolean
  errorMessage: string | null
  hasResult: boolean
  hasFile: boolean
  fileName: string | null
  fileSize: string | null
  scoreVariant: 'success' | 'warning' | 'error'
  recommendationLabel: RecommendationLabel | null
}

export interface RecommendationLabel {
  text: string
  className: string
}

// ViewModel Actions
export interface ResumeAnalyzerActions {
  onFileSelect: (e: CustomEvent<{ files: File[] }>) => void
  onFileError: (e: CustomEvent<{ errors: string[] }>) => void
  onAnalyze: () => Promise<void>
  onClose: () => void
  onRemoveFile: () => void
  onAnalyzeAnother: () => void
}

// ViewModel Return Type
export type ResumeAnalyzerViewModel = ResumeAnalyzerState & ResumeAnalyzerActions
