import {
  ZevModal,
  ZevFileUpload,
  ZevProgressBar,
  ZevButton,
  ZevLoader,
} from '@malvezzidatr/zev-react'
import { useResumeOptimizer } from './useResumeOptimizer'
import type { ResumeOptimizerProps } from './ResumeOptimizer.types'

export function ResumeOptimizer({ jobId, jobTitle, isOpen, onClose }: ResumeOptimizerProps) {
  const vm = useResumeOptimizer({ jobId, onCloseModal: onClose })

  return (
    <ZevModal open={isOpen} onModalClose={vm.onClose} title="Otimizar Curriculo" size="lg">
      <div className="resume-optimizer">
        <p className="resume-optimizer-job">
          <strong>Vaga:</strong> {jobTitle}
        </p>

        {!vm.hasResult && (
          <>
            <ZevFileUpload
              accept=".pdf"
              maxSize={5 * 1024 * 1024}
              label="Curriculo (PDF)"
              hint="Arraste ou clique para selecionar. Max. 5MB"
              onFileSelect={vm.onFileSelect}
              onFileError={vm.onFileError}
              disabled={vm.isOptimizing}
            />

            {vm.hasFile && (
              <div className="resume-optimizer-file">
                <span className="resume-optimizer-file-name">{vm.fileName}</span>
                <span className="resume-optimizer-file-size">({vm.fileSize})</span>
                {!vm.isOptimizing && (
                  <button
                    className="resume-optimizer-file-remove"
                    onClick={vm.onRemoveFile}
                    aria-label="Remover arquivo"
                  >
                    x
                  </button>
                )}
              </div>
            )}

            {vm.hasError && <p className="resume-optimizer-error">{vm.errorMessage}</p>}

            <div className="resume-optimizer-actions">
              <ZevButton
                variant="primary"
                onButtonClick={vm.onOptimize}
                disabled={!vm.hasFile || vm.isOptimizing}
              >
                {vm.isOptimizing ? (
                  <>
                    <ZevLoader size="sm" /> Otimizando...
                  </>
                ) : (
                  'Otimizar Curriculo'
                )}
              </ZevButton>
            </div>
          </>
        )}

        {vm.result && (
          <div className="resume-optimizer-result">
            {/* Score comparison */}
            <div className="resume-optimizer-scores">
              <div className="resume-optimizer-score-item">
                <span className="resume-optimizer-score-label">Score Atual</span>
                <ZevProgressBar
                  value={vm.result.generalScore}
                  variant={vm.result.generalScore >= 70 ? 'success' : vm.result.generalScore >= 40 ? 'warning' : 'error'}
                  size="lg"
                />
                <span className="resume-optimizer-score-value">{vm.result.generalScore}%</span>
              </div>
              <div className="resume-optimizer-score-item">
                <span className="resume-optimizer-score-label">Score Potencial</span>
                <ZevProgressBar
                  value={vm.result.potentialScore}
                  variant={vm.result.potentialScore >= 70 ? 'success' : vm.result.potentialScore >= 40 ? 'warning' : 'error'}
                  size="lg"
                />
                <span className="resume-optimizer-score-value">{vm.result.potentialScore}%</span>
              </div>
            </div>

            {/* Optimized summary */}
            <div className="resume-optimizer-section">
              <h4 className="resume-optimizer-section-title">Resumo Profissional Otimizado</h4>
              <div className="resume-optimizer-summary-box">
                <p>{vm.result.optimizedSummary}</p>
                <button
                  className="resume-optimizer-copy-btn"
                  onClick={vm.onCopySummary}
                >
                  {vm.summaryCopied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Bullet points comparison */}
            {vm.result.bulletPoints.length > 0 && (
              <div className="resume-optimizer-section">
                <h4 className="resume-optimizer-section-title">Bullet Points Otimizados</h4>
                <div className="resume-optimizer-bullets">
                  {vm.result.bulletPoints.map((bp, index) => (
                    <div key={index} className="resume-optimizer-bullet">
                      <div className="resume-optimizer-bullet-original">
                        <span className="resume-optimizer-bullet-label">Original</span>
                        <p>{bp.original}</p>
                      </div>
                      <div className="resume-optimizer-bullet-optimized">
                        <span className="resume-optimizer-bullet-label">Otimizado</span>
                        <p>{bp.optimized}</p>
                      </div>
                      <p className="resume-optimizer-bullet-reason">{bp.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords to add */}
            {vm.result.keywordsToAdd.length > 0 && (
              <div className="resume-optimizer-section">
                <h4 className="resume-optimizer-section-title">Keywords para Adicionar</h4>
                <div className="resume-optimizer-keywords">
                  {vm.result.keywordsToAdd.map((kw, index) => (
                    <div key={index} className="resume-optimizer-keyword-item">
                      <span className="resume-optimizer-keyword-name">{kw.keyword}</span>
                      <span className="resume-optimizer-keyword-suggestion">{kw.suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section tips */}
            {vm.result.sectionTips.length > 0 && (
              <div className="resume-optimizer-section">
                <h4 className="resume-optimizer-section-title">Dicas por Secao</h4>
                <div className="resume-optimizer-tips">
                  {vm.result.sectionTips.map((tip, index) => (
                    <div key={index} className="resume-optimizer-tip">
                      <span className="resume-optimizer-tip-section">{tip.section}</span>
                      <p className="resume-optimizer-tip-text">{tip.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="resume-optimizer-actions">
              <ZevButton variant="secondary" onButtonClick={vm.onOptimizeAnother}>
                Otimizar Outro
              </ZevButton>
              <ZevButton variant="primary" onButtonClick={vm.onClose}>
                Fechar
              </ZevButton>
            </div>
          </div>
        )}
      </div>
    </ZevModal>
  )
}
