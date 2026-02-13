import type { Application, ApplicationStatus } from '../../features/application-tracker'

export interface KanbanColumn {
  status: ApplicationStatus
  label: string
  color: string
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { status: 'SAVED', label: 'Salva', color: '#6366f1' },
  { status: 'APPLIED', label: 'Aplicada', color: '#3b82f6' },
  { status: 'TECHNICAL_TEST', label: 'Teste Técnico', color: '#f59e0b' },
  { status: 'INTERVIEW', label: 'Entrevista', color: '#8b5cf6' },
  { status: 'OFFER', label: 'Oferta', color: '#22c55e' },
  { status: 'REJECTED', label: 'Rejeitada', color: '#ef4444' },
]

export interface TrackerState {
  applicationsByStatus: Record<string, Application[]>
  loading: boolean
  error: string | null
  selectedApplication: Application | null
  showNotesModal: boolean
  draggedCard: string | null
  totalCount: number
}

export interface TrackerActions {
  handleDragStart: (appId: string) => void
  handleDragEnd: () => void
  handleDrop: (status: ApplicationStatus) => void
  handleOpenNotes: (app: Application) => void
  handleCloseNotes: () => void
  handleSaveNotes: (notes: string) => void
  handleDeleteApplication: (appId: string) => void
  handleCardClick: (jobId: string) => void
}

export type TrackerViewModel = TrackerState & TrackerActions
