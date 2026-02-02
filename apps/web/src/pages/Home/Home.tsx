import {
  ZevSectionHeader,
  ZevInput,
  ZevSelect,
  ZevMultiSelect,
  ZevButton,
  ZevJobCard,
  ZevLoader,
  ZevEmptyState,
  ZevPagination,
} from '@malvezzidatr/zev-react'
import { FeaturedJobs } from '../../features/jobs'
import { useHome } from './useHome'
import {
  levelOptions,
  typeOptions,
  remoteOptions,
  periodOptions,
  sortOptions,
} from './Home.types'

export function Home() {
  const vm = useHome()

  return (
    <div className="container">
      <div style={{ marginTop: 60 }} className="header-container">
        <ZevSectionHeader
          tag="[VAGAS]"
          title="Vagas Júnior e Estágio"
          variant="centered"
          size="medium"
        />
      </div>

      <StatsSection vm={vm} />

      <FeaturedJobs limit={10} />

      <FiltersSection vm={vm} />

      {vm.loading || vm.fetching || vm.isTransitioning ? (
        <LoadingState />
      ) : (
        <ResultsSection vm={vm} />
      )}

      {vm.error && (
        <div className="empty-container">
          <ZevEmptyState
            title="Erro ao carregar vagas"
            description={vm.error}
          />
        </div>
      )}
    </div>
  )
}

// Sub-componentes internos (puros)

function StatsSection({ vm }: { vm: ReturnType<typeof useHome> }) {
  if (vm.statsLoading) {
    return (
      <div className="stats">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-item">
            <div className="stat-value-skeleton"><ZevLoader size="md" /></div>
            <div className="stat-label-skeleton"><ZevLoader size="sm" /></div>
          </div>
        ))}
      </div>
    )
  }

  if (!vm.stats) return null

  return (
    <div className="stats">
      <div className="stat-item">
        <div className="stat-value">{vm.stats.total}</div>
        <div className="stat-label">Vagas Totais</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{vm.stats.remote}</div>
        <div className="stat-label">Vagas Remotas</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">
          {vm.stats.byLevel.find(l => l.level === 'JUNIOR')?.count || 0}
        </div>
        <div className="stat-label">Vagas Júnior</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">
          {vm.stats.byLevel.find(l => l.level === 'ESTAGIO')?.count || 0}
        </div>
        <div className="stat-label">Estágios</div>
      </div>
      {vm.newJobsCount > 0 && (
        <div className="stat-item stat-item--new">
          <div className="stat-value stat-value--new">{vm.newJobsCount}</div>
          <div className="stat-label">Novas</div>
        </div>
      )}
    </div>
  )
}

function FiltersSection({ vm }: { vm: ReturnType<typeof useHome> }) {
  return (
    <div className="filters">
      {/* Linha 1: Busca */}
      <div className="filters-row filters-row--search">
        <ZevInput
          label="Buscar vagas por título, empresa ou descrição..."
          value={vm.filters.search || ''}
          icon="search"
          onInputChange={vm.handleSearchChange}
        />
      </div>

      {/* Linha 2: Filtros principais */}
      <div className="filters-row filters-row--main">
        <ZevMultiSelect
          label='Nível'
          options={levelOptions}
          value={vm.selectedLevels}
          maxDisplayTags={2}
          onMultiSelectChange={vm.handleLevelChange}
        />
        <ZevMultiSelect
          label='Área'
          options={typeOptions}
          value={vm.selectedTypes}
          maxDisplayTags={2}
          onMultiSelectChange={vm.handleTypeChange}
        />
        <ZevSelect
          label='Modalidade'
          options={remoteOptions}
          value={vm.filters.remote === undefined ? '' : String(vm.filters.remote)}
          onSelectChange={vm.handleRemoteChange}
        />
        <ZevMultiSelect
          label='Fonte'
          options={vm.sourceOptions}
          value={vm.selectedSources}
          maxDisplayTags={2}
          onMultiSelectChange={vm.handleSourceChange}
        />
      </div>

      {/* Linha 3: Filtros secundários + Favoritos */}
      <div className="filters-row filters-row--secondary">
        <ZevSelect
          label='Período'
          options={periodOptions}
          value={vm.filters.period || ''}
          onSelectChange={vm.handlePeriodChange}
        />
        <ZevSelect
          label='Ordenar'
          options={sortOptions}
          value={vm.filters.sort || 'recent'}
          onSelectChange={vm.handleSortChange}
        />
        <ZevButton
          variant={vm.showOnlyFavorites ? 'primary' : 'secondary'}
          onButtonClick={vm.handleToggleFavorites}
        >
          Favoritos ({vm.favoritesCount})
        </ZevButton>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <>
      <div className="results-info-skeleton">
        <ZevLoader size="md" />
      </div>
      <div className="jobs-grid">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <ZevLoader size="lg" />
            <ZevLoader size="md" />
            <ZevLoader size="sm" />
            <div className="skeleton-tags">
              <ZevLoader size="sm" />
              <ZevLoader size="sm" />
            </div>
            <ZevLoader size="sm" />
          </div>
        ))}
      </div>
      <div className="pagination-skeleton">
        <ZevLoader size="sm" />
        <ZevLoader size="sm" />
        <ZevLoader size="sm" />
        <ZevLoader size="sm" />
        <ZevLoader size="sm" />
      </div>
    </>
  )
}

function ResultsSection({ vm }: { vm: ReturnType<typeof useHome> }) {
  return (
    <>
      <p className="results-info">
        {vm.showOnlyFavorites
          ? `Mostrando ${vm.jobs?.data.length ?? 0} favoritos`
          : `Mostrando ${vm.jobs?.data.length ?? 0} de ${vm.jobs?.meta.total ?? 0} vagas${(vm.jobs?.meta.totalPages ?? 0) > 1 ? ` (Página ${vm.jobs?.meta.page ?? 1} de ${vm.jobs?.meta.totalPages ?? 1})` : ''}`
        }
      </p>

      {!vm.jobs || vm.jobs.data.length === 0 ? (
        <div className="empty-container">
          <ZevEmptyState
            title={vm.showOnlyFavorites ? "Nenhum favorito" : "Nenhuma vaga encontrada"}
            description={vm.showOnlyFavorites
              ? "Você ainda não adicionou nenhuma vaga aos favoritos"
              : "Tente ajustar os filtros ou aguarde novas vagas serem adicionadas"
            }
          />
        </div>
      ) : (
        <div className="jobs-grid">
          {vm.jobs.data.map(job => {
            const jobIsNew = vm.isNewJob(job.postedAt || job.createdAt)
            return (
              <div key={job.id} className={`job-card-wrapper ${vm.isFavorite(job.id) ? 'is-favorite' : ''} ${jobIsNew ? 'is-new' : ''}`}>
                {jobIsNew && <span className="new-badge">NOVA</span>}
                <ZevJobCard
                  title={vm.isFavorite(job.id) ? `★ ${job.title}` : job.title}
                  company={job.company}
                  location={job.location || 'Não informado'}
                  tags={job.tags.map(t => t.name)}
                  salary={job.salary || ''}
                  remote={job.remote}
                  postedAt={vm.formatPostedAt(job.postedAt || job.createdAt)}
                  url={job.url}
                  source={job.source.name}
                  onCardClick={vm.handleCardClick(job.id)}
                />
              </div>
            )
          })}
        </div>
      )}

      {!vm.showOnlyFavorites && vm.jobs && vm.jobs.meta.totalPages > 1 && (
        <div className="pagination-container">
          <ZevPagination
            currentPage={vm.jobs.meta.page}
            totalPages={vm.jobs.meta.totalPages}
            onPageChange={vm.handlePageChange}
          />
        </div>
      )}
    </>
  )
}
