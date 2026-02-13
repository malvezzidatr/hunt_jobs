import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  ZevSectionHeader,
  ZevButton,
  ZevTag,
  ZevLoader,
  ZevEmptyState,
} from '@malvezzidatr/zev-react'
import { useAuth } from '../../features/auth'
import type { Application, ApplicationStatus } from '../../features/application-tracker'
import { useTracker } from './useTracker'
import { KANBAN_COLUMNS } from './Tracker.types'
import type { KanbanColumn, TrackerViewModel } from './Tracker.types'

export default function Tracker() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const vm = useTracker()

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="tracker-container">
      <div style={{ marginTop: 60 }}>
        <ZevSectionHeader
          tag="[TRACKER]"
          title="Minhas Candidaturas"
          variant="centered"
          size="medium"
        />
      </div>

      {vm.totalCount > 0 && (
        <p className="tracker-subtitle">
          {vm.totalCount} {vm.totalCount === 1 ? 'vaga rastreada' : 'vagas rastreadas'}
        </p>
      )}

      {vm.loading ? (
        <TrackerSkeleton />
      ) : vm.error ? (
        <div className="tracker-empty">
          <ZevEmptyState title="Erro" description={vm.error} />
        </div>
      ) : vm.totalCount === 0 ? (
        <div className="tracker-empty">
          <ZevEmptyState
            title="Nenhuma candidatura"
            description="Salve vagas pelo detalhe da vaga para rastrear suas candidaturas aqui."
          />
        </div>
      ) : (
        <KanbanBoard vm={vm} />
      )}

      {vm.showNotesModal && vm.selectedApplication && (
        <NotesModal
          application={vm.selectedApplication}
          onClose={vm.handleCloseNotes}
          onSave={vm.handleSaveNotes}
        />
      )}
    </div>
  )
}

function KanbanBoard({ vm }: { vm: TrackerViewModel }) {
  return (
    <div className="kanban-board">
      {KANBAN_COLUMNS.map((column) => (
        <KanbanColumnComponent
          key={column.status}
          column={column}
          applications={vm.applicationsByStatus[column.status] || []}
          onDrop={vm.handleDrop}
          onDragStart={vm.handleDragStart}
          onDragEnd={vm.handleDragEnd}
          onCardClick={vm.handleCardClick}
          onNotesClick={vm.handleOpenNotes}
          onDeleteClick={vm.handleDeleteApplication}
        />
      ))}
    </div>
  )
}

function KanbanColumnComponent({
  column,
  applications,
  onDrop,
  onDragStart,
  onDragEnd,
  onCardClick,
  onNotesClick,
  onDeleteClick,
}: {
  column: KanbanColumn
  applications: Application[]
  onDrop: (status: ApplicationStatus) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onCardClick: (jobId: string) => void
  onNotesClick: (app: Application) => void
  onDeleteClick: (id: string) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(column.status)
  }

  return (
    <div
      className={`kanban-column ${isDragOver ? 'kanban-column--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header" style={{ borderColor: column.color }}>
        <h3>{column.label}</h3>
        <span className="kanban-column-count">{applications.length}</span>
      </div>
      <div className="kanban-column-cards">
        {applications.length === 0 ? (
          <div className="kanban-column-empty">
            Arraste vagas aqui
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onCardClick}
              onNotesClick={onNotesClick}
              onDeleteClick={onDeleteClick}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ApplicationCard({
  application,
  onDragStart,
  onDragEnd,
  onClick,
  onNotesClick,
  onDeleteClick,
}: {
  application: Application
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onClick: (jobId: string) => void
  onNotesClick: (app: Application) => void
  onDeleteClick: (id: string) => void
}) {
  return (
    <div
      className="application-card"
      draggable
      onDragStart={() => onDragStart(application.id)}
      onDragEnd={onDragEnd}
    >
      <div className="application-card-header">
        <h4 onClick={() => onClick(application.jobId)}>
          {application.job.title}
        </h4>
        <button
          className="application-card-remove"
          onClick={() => onDeleteClick(application.id)}
          title="Remover do tracker"
        >
          &times;
        </button>
      </div>
      <p className="application-card-company">{application.job.company}</p>
      {application.job.tags.length > 0 && (
        <div className="application-card-tags">
          {application.job.tags.slice(0, 3).map((tag) => (
            <ZevTag key={tag.id} size="small">{tag.name}</ZevTag>
          ))}
          {application.job.tags.length > 3 && (
            <ZevTag size="small" variant="accent">+{application.job.tags.length - 3}</ZevTag>
          )}
        </div>
      )}
      <div className="application-card-footer">
        <ZevButton
          variant="secondary"
          size="sm"
          onButtonClick={() => onNotesClick(application)}
        >
          {application.notes ? 'Ver notas' : 'Notas'}
        </ZevButton>
        {application.appliedAt && (
          <span className="application-card-date">
            {new Date(application.appliedAt).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  )
}

function NotesModal({
  application,
  onClose,
  onSave,
}: {
  application: Application
  onClose: () => void
  onSave: (notes: string) => void
}) {
  const [notes, setNotes] = useState(application.notes || '')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Notas - {application.job.title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione suas anotacoes sobre esta vaga..."
            rows={8}
          />
        </div>
        <div className="modal-footer">
          <ZevButton variant="secondary" onButtonClick={onClose}>
            Cancelar
          </ZevButton>
          <ZevButton variant="primary" onButtonClick={() => onSave(notes)}>
            Salvar
          </ZevButton>
        </div>
      </div>
    </div>
  )
}

function TrackerSkeleton() {
  return (
    <div className="kanban-board">
      {KANBAN_COLUMNS.map((col) => (
        <div key={col.status} className="kanban-column">
          <div className="kanban-column-header" style={{ borderColor: col.color }}>
            <h3>{col.label}</h3>
            <span className="kanban-column-count">-</span>
          </div>
          <div className="kanban-column-cards">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="application-card skeleton-card">
                <ZevLoader size="md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
