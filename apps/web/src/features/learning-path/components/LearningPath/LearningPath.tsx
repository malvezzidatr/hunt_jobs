import { ZevButton, ZevLoader, ZevSkillCard, ZevTag } from '@malvezzidatr/zev-react'
import { useLearningPath } from './useLearningPath'
import {
  mapPriorityToBadge,
  mapResourcesToSkillResources,
} from './LearningPath.types'
import type { LearningPathProps } from './LearningPath.types'

export function LearningPath({ jobId }: LearningPathProps) {
  const vm = useLearningPath(jobId)

  if (!vm.hasData) {
    return (
      <div className="learning-path">
        <div className="learning-path-header">
          <div>
            <h3>Trilha de Aprendizado</h3>
            <p className="learning-path-subtitle">
              Descubra o que estudar para se preparar para esta vaga
            </p>
          </div>
        </div>

        {vm.hasError && (
          <div className="learning-path-error">
            {vm.errorMessage}
          </div>
        )}

        {vm.isLoading ? (
          <div className="learning-path-skeleton">
            <div className="learning-path-skeleton-header">
              <ZevLoader size="sm" />
              <span>Gerando trilha personalizada...</span>
            </div>
            <div className="learning-path-cards">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="tech-card tech-card--skeleton">
                  <div className="tech-card-header">
                    <div className="tech-card-info">
                      <ZevLoader size="md" />
                      <ZevLoader size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="learning-path-action">
            <ZevButton
              variant="secondary"
              onButtonClick={vm.onGenerate}
            >
              Gerar Trilha de Aprendizado
            </ZevButton>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="learning-path learning-path--loaded">
      <div className="learning-path-header">
        <div>
          <h3>Trilha de Aprendizado</h3>
          <p className="learning-path-subtitle">
            {vm.techCount} tecnologias identificadas
          </p>
        </div>
        <span className="learning-path-time">
          Tempo estimado: {vm.data!.estimatedStudyTime}
        </span>
      </div>

      <div className="learning-path-cards">
        {vm.data!.technologies.map(tech => (
          <ZevSkillCard
            key={tech.name}
            title={tech.name}
            badge={mapPriorityToBadge(tech.priority)}
            importance={tech.whyNeeded}
            focusPoints={tech.whatToFocus}
            resources={mapResourcesToSkillResources(tech.resources)}
            open={vm.expandedCard === tech.name}
            onToggle={() => vm.onToggleCard(tech.name)}
          />
        ))}
      </div>

      {vm.data!.studyStrategy && (
        <div className="learning-path-strategy">
          <h4>Como Estudar</h4>
          <div className="strategy-content">
            <div className="strategy-item">
              <span className="strategy-label">Ordem de estudo:</span>
              <p>{vm.data!.studyStrategy.order}</p>
            </div>
            <div className="strategy-item">
              <span className="strategy-label">Tempo diário:</span>
              <p>{vm.data!.studyStrategy.dailyHours}</p>
            </div>
            <div className="strategy-item">
              <span className="strategy-label">Abordagem:</span>
              <p>{vm.data!.studyStrategy.approach}</p>
            </div>
          </div>
        </div>
      )}

      {vm.data!.projectIdeas && vm.data!.projectIdeas.length > 0 && (
        <div className="learning-path-projects">
          <h4>Ideias de Projetos para Praticar</h4>
          <div className="projects-grid">
            {vm.data!.projectIdeas.map((project, i) => (
              <div key={i} className="project-card">
                <div className="project-header">
                  <h5>{project.title}</h5>
                  <span className={`project-difficulty project-difficulty--${project.difficulty}`}>
                    {project.difficulty}
                  </span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-techs">
                  {project.technologies.map((tech, j) => (
                    <ZevTag key={j} label={tech} variant="ghost" size="small" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vm.data!.generalTips.length > 0 && (
        <div className="learning-path-tips">
          <h4>Dicas Gerais</h4>
          <ul>
            {vm.data!.generalTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="learning-path-regenerate">
        <ZevButton
          variant="ghost"
          size="sm"
          onButtonClick={vm.onGenerate}
          disabled={vm.isLoading}
        >
          {vm.isLoading ? 'Gerando...' : 'Gerar novamente'}
        </ZevButton>
      </div>
    </div>
  )
}
