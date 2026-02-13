import { useState, useCallback, useMemo } from 'react'
import { analyzeResume } from '../../services/resumeApi'
import { formatFileSize, getScoreVariant, getRecommendationLabel } from './utils/formatters'
import type { AnalysisResult } from '../../types/resume.types'
import type { ResumeAnalyzerViewModel } from './ResumeAnalyzer.types'

interface UseResumeAnalyzerProps {
  jobId: string
  onCloseModal: () => void
}

export function useResumeAnalyzer({
  jobId,
  onCloseModal,
}: UseResumeAnalyzerProps): ResumeAnalyzerViewModel {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onFileSelect = useCallback((e: CustomEvent<{ files: File[] }>) => {
    const selectedFile = e.detail?.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setErrorMessage(null)
      setResult(null)
    }
  }, [])

  const onFileError = useCallback((e: CustomEvent<{ errors: string[] }>) => {
    const error = e.detail?.errors?.[0]
    if (error) {
      setErrorMessage(error)
    }
  }, [])

  const onAnalyze = useCallback(async () => {
    if (!file) return
    setIsAnalyzing(true)
    setErrorMessage(null)

    try {
      const analysisResult = await analyzeResume(file, jobId)
      setResult(analysisResult)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao analisar currículo')
    } finally {
      setIsAnalyzing(false)
    }
  }, [file, jobId])

  const onClose = useCallback(() => {
    setFile(null)
    setResult(null)
    setErrorMessage(null)
    onCloseModal()
  }, [onCloseModal])

  const onRemoveFile = useCallback((_e?: CustomEvent) => {
    setFile(null)
  }, [])

  // Workaround: ZevFileUpload bloqueia seleção de novo arquivo em modo single
  // quando já existe um. Patch _handleFiles para limpar antes de processar.
  const fileUploadRef = useCallback((el: HTMLElement | null) => {
    const element = el as any
    if (!element?._handleFiles || element._patched) return
    const original = element._handleFiles
    element._handleFiles = function (fileList: FileList | null) {
      if (!this.multiple && this._files?.length > 0) {
        this._files = []
      }
      original.call(this, fileList)
    }
    element._patched = true
  }, [])

  const onAnalyzeAnother = useCallback(() => {
    setResult(null)
  }, [])

  // Derived state
  const derivedState = useMemo(() => ({
    hasError: !!errorMessage,
    hasResult: !!result,
    hasFile: !!file,
    fileName: file?.name ?? null,
    fileSize: file ? formatFileSize(file.size) : null,
    scoreVariant: result ? getScoreVariant(result.score) : ('error' as const),
    recommendationLabel: result ? getRecommendationLabel(result.recommendation) : null,
  }), [errorMessage, result, file])

  return {
    // State
    file,
    isAnalyzing,
    result,
    errorMessage,
    ...derivedState,
    // Actions
    onFileSelect,
    onFileError,
    onAnalyze,
    onClose,
    onRemoveFile,
    onAnalyzeAnother,
    fileUploadRef,
  }
}
