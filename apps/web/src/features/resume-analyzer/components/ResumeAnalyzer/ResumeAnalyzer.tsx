import {
  ZevModal,
  ZevFileUpload,
  ZevProgressBar,
  ZevButton,
  ZevLoader,
  ZevTag,
} from '@malvezzidatr/zev-react'
import { useResumeAnalyzer } from './useResumeAnalyzer'
import type { ResumeAnalyzerProps } from './ResumeAnalyzer.types'

export function ResumeAnalyzer({ jobId, jobTitle, isOpen, onClose }: ResumeAnalyzerProps) {
  const vm = useResumeAnalyzer({ jobId, onCloseModal: onClose })

  return (
    <ZevModal open={isOpen} onModalClose={vm.onClose} title="Analisar Compatibilidade" size="md">
      <div className="resume-analyzer">
        <p className="resume-analyzer-job">
          <strong>Vaga:</strong> {jobTitle}
        </p>

        {!vm.hasResult && (
          <>
            <ZevFileUpload
              accept=".pdf"
              maxSize={5 * 1024 * 1024}
              label="Currículo (PDF)"
              hint="Arraste ou clique para selecionar. Máx. 5MB"
              onFileSelect={vm.onFileSelect}
              onFileRemove={vm.onRemoveFile}
              onFileError={vm.onFileError}
              disabled={vm.isAnalyzing}
            />

            {vm.hasError && <p className="resume-analyzer-error">{vm.errorMessage}</p>}

            <div className="resume-analyzer-actions">
              <ZevButton
                variant="primary"
                onButtonClick={vm.onAnalyze}
                disabled={!vm.hasFile || vm.isAnalyzing}
              >
                {vm.isAnalyzing ? (
                  <>
                    <ZevLoader size="sm" /> Analisando...
                  </>
                ) : (
                  'Analisar Currículo'
                )}
              </ZevButton>
            </div>
          </>
        )}

        {vm.result && (
          <div className="resume-analyzer-result">
            <div className="resume-analyzer-score">
              <span className="resume-analyzer-score-label">Compatibilidade: {vm.result.score}%</span>
              <ZevProgressBar
                value={vm.result.score}
                variant={vm.scoreVariant}
                size="lg"
              />
            </div>

            <p className="resume-analyzer-summary">{vm.result.summary}</p>

            {vm.recommendationLabel && (
              <div className={`resume-analyzer-recommendation ${vm.recommendationLabel.className}`}>
                {vm.recommendationLabel.text}
              </div>
            )}

            {vm.result.strengths.length > 0 && (
              <div className="resume-analyzer-section">
                <h4 className="resume-analyzer-section-title resume-analyzer-section-title--success">
                  Pontos Fortes
                </h4>
                <ul className="resume-analyzer-list">
                  {vm.result.strengths.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {vm.result.improvements.length > 0 && (
              <div className="resume-analyzer-section">
                <h4 className="resume-analyzer-section-title resume-analyzer-section-title--warning">
                  Sugestões de Melhoria
                </h4>
                <ul className="resume-analyzer-list">
                  {vm.result.improvements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {vm.result.missingKeywords.length > 0 && (
              <div className="resume-analyzer-section">
                <h4 className="resume-analyzer-section-title">
                  Palavras-chave Ausentes
                </h4>
                <div className="resume-analyzer-keywords">
                  {vm.result.missingKeywords.map((keyword, index) => (
                    <ZevTag key={index} label={keyword} variant="ghost" size="small" />
                  ))}
                </div>
              </div>
            )}

            <div className="resume-analyzer-actions">
              <ZevButton variant="secondary" onButtonClick={vm.onAnalyzeAnother}>
                Analisar Outro
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
