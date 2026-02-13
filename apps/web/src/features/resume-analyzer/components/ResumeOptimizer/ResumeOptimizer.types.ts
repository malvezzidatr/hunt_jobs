import type { OptimizationResult } from '../../types/resume.types'

// Props do componente
export interface ResumeOptimizerProps {
  jobId: string
  jobTitle: string
  isOpen: boolean
  onClose: () => void
}

// ViewModel State
export interface ResumeOptimizerState {
  file: File | null
  isOptimizing: boolean
  result: OptimizationResult | null
  hasError: boolean
  errorMessage: string | null
  hasResult: boolean
  hasFile: boolean
  fileName: string | null
  fileSize: string | null
}

// ViewModel Actions
export interface ResumeOptimizerActions {
  onFileSelect: (e: CustomEvent<{ files: File[] }>) => void
  onFileError: (e: CustomEvent<{ errors: string[] }>) => void
  onOptimize: () => Promise<void>
  onClose: () => void
  onRemoveFile: (e?: CustomEvent) => void
  onOptimizeAnother: () => void
  onCopySummary: () => void
  summaryCopied: boolean
}

// ViewModel Return Type
export type ResumeOptimizerViewModel = ResumeOptimizerState & ResumeOptimizerActions
