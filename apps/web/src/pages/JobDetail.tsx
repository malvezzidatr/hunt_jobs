import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ZevSectionHeader,
  ZevButton,
  ZevTag,
  ZevBadge,
  ZevLoader,
  ZevEmptyState,
} from '@malvezzidatr/zev-react'
import { useJob } from '../features/jobs'
import { useFavorites } from '../features/favorites'
import { ResumeAnalyzer } from '../features/resume-analyzer'
import { LearningPath } from '../features/learning-path'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { job, loading, error } = useJob(id || '')
  const { isFavorite, toggleFavorite } = useFavorites()

  const jobIsFavorite = id ? isFavorite(id) : false
  const [copied, setCopied] = useState(false)
  const [showAnalyzer, setShowAnalyzer] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback para navegadores antigos
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleToggleFavorite = () => {
    if (id) toggleFavorite(id)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não informado'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatLevel = (level: string) => {
    const levels: Record<string, string> = {
      ESTAGIO: 'Estágio',
      JUNIOR: 'Júnior',
      PLENO: 'Pleno',
    }
    return levels[level] || level
  }

  const formatType = (type: string) => {
    const types: Record<string, string> = {
      FRONTEND: 'Frontend',
      BACKEND: 'Backend',
      FULLSTACK: 'Fullstack',
      MOBILE: 'Mobile',
    }
    return types[type] || type
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleApply = () => {
    if (job?.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Mostrar skeleton enquanto carrega OU enquanto não tem job e não tem erro
  if (loading || (!job && !error)) {
    return (
      <div style={{marginTop: 60}} className="container">
        <div className="job-detail">
          <div className="job-detail-header">
            <ZevButton variant="secondary" onButtonClick={handleBack}>
              Voltar
            </ZevButton>
          </div>

          <div className="job-detail-content">
            <div className="job-detail-title-section">
              <div className="skeleton-title">
                <ZevLoader size="sm" />
                <ZevLoader size="lg" />
              </div>
              <div className="skeleton-company">
                <ZevLoader size="md" />
              </div>
            </div>

            <div className="job-detail-badges skeleton-badges">
              <ZevLoader size="sm" />
              <ZevLoader size="sm" />
              <ZevLoader size="sm" />
            </div>

            <div className="job-detail-info">
              <div className="job-detail-info-item">
                <span className="job-detail-info-label">Localização</span>
                <ZevLoader size="sm" />
              </div>
              <div className="job-detail-info-item">
                <span className="job-detail-info-label">Publicado em</span>
                <ZevLoader size="sm" />
              </div>
              <div className="job-detail-info-item">
                <span className="job-detail-info-label">Fonte</span>
                <ZevLoader size="sm" />
              </div>
            </div>

            <div className="job-detail-tags">
              <span className="job-detail-tags-label">Tecnologias</span>
              <div className="job-detail-tags-list skeleton-tags-detail">
                <ZevLoader size="sm" />
                <ZevLoader size="sm" />
                <ZevLoader size="sm" />
                <ZevLoader size="sm" />
              </div>
            </div>

            <div className="job-detail-description">
              <h3>Descrição da Vaga</h3>
              <div className="job-detail-description-content skeleton-description">
                <ZevLoader size="lg" />
                <ZevLoader size="lg" />
                <ZevLoader size="md" />
                <ZevLoader size="lg" />
                <ZevLoader size="md" />
                <ZevLoader size="lg" />
                <ZevLoader size="md" />
                <ZevLoader size="lg" />
                <ZevLoader size="md" />
                <ZevLoader size="lg" />
                <ZevLoader size="md" />
                <ZevLoader size="lg" />
                <ZevLoader size="md" />
                <ZevLoader size="lg" />
                <ZevLoader size="md" />
                <ZevLoader size="lg" />
                <ZevLoader size="md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div style={{marginTop: 60}} className="container">
        <div className="empty-container">
          <ZevEmptyState
            title="Vaga não encontrada"
            description={error || 'A vaga que você está procurando não existe ou foi removida.'}
          />
        </div>
        <div className="job-detail-actions">
          <ZevButton variant="secondary" onButtonClick={handleBack}>
            Voltar
          </ZevButton>
        </div>
      </div>
    )
  }

  return (
    <div style={{marginTop: 60}} className="container">
      <div className="job-detail">
        <div className="job-detail-header">
          <ZevButton variant="secondary" onButtonClick={handleBack}>
            Voltar
          </ZevButton>
        </div>

        <div className="job-detail-content">
          <div className="job-detail-title-section">
            <div>
              <ZevSectionHeader
                tag={`[${job.source.name.toUpperCase()}]`}
                title={job.title}
                variant="inline"
                size="small"
              />
              <p className="job-detail-company">{job.company}</p>
            </div>
            <div className='job-detail-share-button'>
              <ZevButton
                variant={copied ? 'primary' : 'secondary'}
                onButtonClick={handleShare}
              >
                {copied ? 'Link Copiado!' : 'Compartilhar'}
              </ZevButton>
            </div>
          </div>
            
          <div className="job-detail-level">
            <div className='job-detail-level-badges'>
              <ZevBadge variant={job.remote ? 'success' : 'neutral'} label={job.remote ? 'Remoto' : 'Presencial'} />
              <ZevBadge variant="info" label={formatLevel(job.level)} />
              <ZevBadge variant="warning" label={formatType(job.type)} />
            </div>
            <ZevButton variant="secondary" onButtonClick={() => setShowAnalyzer(true)}>
              Analisar CV
            </ZevButton>
          </div>
          <div className="job-detail-info">
            <div className="job-detail-info-item">
              <span className="job-detail-info-label">Localização</span>
              <span className="job-detail-info-value">{job.location || 'Não informado'}</span>
            </div>
            {job.salary && (
              <div className="job-detail-info-item">
                <span className="job-detail-info-label">Salário</span>
                <span className="job-detail-info-value">{job.salary}</span>
              </div>
            )}
            <div className="job-detail-info-item">
              <span className="job-detail-info-label">Publicado em</span>
              <span className="job-detail-info-value">{formatDate(job.postedAt || job.createdAt)}</span>
            </div>
            <div className="job-detail-info-item">
              <span className="job-detail-info-label">Fonte</span>
              <span className="job-detail-info-value">{job.source.name}</span>
            </div>
          </div>

          {job.tags.length > 0 && (
            <div className="job-detail-tags">
              <span className="job-detail-tags-label">Tecnologias</span>
              <div className="job-detail-tags-list">
                {job.tags.map(tag => (
                  <ZevTag key={tag.id}>{tag.name}</ZevTag>
                ))}
              </div>
            </div>
          )}

          <div className="job-detail-description">
            <h3>Descrição da Vaga</h3>
            <div className="job-detail-description-content">
              {job.description.split('\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;
                // Filtrar linhas indesejadas (botões do site original)
                if (/^(Show more|Show less|Ver mais|Ver menos|Mostrar mais|Mostrar menos)$/i.test(trimmed)) {
                  return null;
                }
                // Detectar se é um título de seção (padrões comuns)
                const isSectionTitle = /^(Sobre|O Que|Requisitos|Responsabilidades|Benefícios|Diferenciais|Etapas|Modelo|Qualificações|Habilidades)/i.test(trimmed);
                return isSectionTitle ? (
                  <h4 key={index} className="job-section-title">{trimmed}</h4>
                ) : (
                  <p key={index}>{trimmed}</p>
                );
              })}
            </div>
          </div>

          <LearningPath jobId={id || ''} />

          <div className="job-detail-actions">
            <ZevButton variant="primary" onButtonClick={handleApply}>
              Ver Vaga Original
            </ZevButton>
            <ZevButton
              variant={jobIsFavorite ? 'primary' : 'secondary'}
              onButtonClick={handleToggleFavorite}
            >
              {jobIsFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </ZevButton>
            <ZevButton variant="secondary" onButtonClick={handleBack}>
              Voltar para Lista
            </ZevButton>
          </div>
        </div>
      </div>

      <ResumeAnalyzer
        jobId={id || ''}
        jobTitle={job.title}
        isOpen={showAnalyzer}
        onClose={() => setShowAnalyzer(false)}
      />
    </div>
  )
}
