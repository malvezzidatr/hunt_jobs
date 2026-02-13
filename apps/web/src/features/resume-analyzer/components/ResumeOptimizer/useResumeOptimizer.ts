import { useState, useCallback, useMemo } from 'react'
import { optimizeResume } from '../../services/resumeApi'
import { formatFileSize } from '../ResumeAnalyzer/utils/formatters'
import type { OptimizationResult } from '../../types/resume.types'
import type { ResumeOptimizerViewModel } from './ResumeOptimizer.types'

interface UseResumeOptimizerProps {
  jobId: string
  onCloseModal: () => void
}

export function useResumeOptimizer({
  jobId,
  onCloseModal,
}: UseResumeOptimizerProps): ResumeOptimizerViewModel {
  const [file, setFile] = useState<File | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [summaryCopied, setSummaryCopied] = useState(false)

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

  const onOptimize = useCallback(async () => {
    if (!file) return
    setIsOptimizing(true)
    setErrorMessage(null)

    try {
      const optimizationResult = await optimizeResume(file, jobId)
      setResult(optimizationResult)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao otimizar currículo')
    } finally {
      setIsOptimizing(false)
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

  const onOptimizeAnother = useCallback(() => {
    setResult(null)
    setFile(null)
  }, [])

  const onCopySummary = useCallback(() => {
    if (!result?.optimizedSummary) return
    navigator.clipboard.writeText(result.optimizedSummary).then(() => {
      setSummaryCopied(true)
      setTimeout(() => setSummaryCopied(false), 2000)
    })
  }, [result])

  const derivedState = useMemo(() => ({
    hasError: !!errorMessage,
    hasResult: !!result,
    hasFile: !!file,
    fileName: file?.name ?? null,
    fileSize: file ? formatFileSize(file.size) : null,
  }), [errorMessage, result, file])

  return {
    file,
    isOptimizing,
    result,
    errorMessage,
    summaryCopied,
    ...derivedState,
    onFileSelect,
    onFileError,
    onOptimize,
    onClose,
    onRemoveFile,
    onOptimizeAnother,
    onCopySummary,
    fileUploadRef,
  }
}
