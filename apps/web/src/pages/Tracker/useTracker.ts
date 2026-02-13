import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplications } from '../../features/application-tracker'
import type { Application, ApplicationStatus } from '../../features/application-tracker'
import type { TrackerViewModel } from './Tracker.types'

export function useTracker(): TrackerViewModel {
  const {
    applications,
    loading,
    error,
    updateApplication,
    deleteApplication,
  } = useApplications()

  const navigate = useNavigate()
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showNotesModal, setShowNotesModal] = useState(false)

  const applicationsByStatus = useMemo(() => {
    const grouped: Record<string, Application[]> = {}
    for (const app of applications) {
      if (!grouped[app.status]) grouped[app.status] = []
      grouped[app.status].push(app)
    }
    return grouped
  }, [applications])

  const handleDragStart = useCallback((appId: string) => {
    setDraggedCard(appId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null)
  }, [])

  const handleDrop = useCallback((status: ApplicationStatus) => {
    if (!draggedCard) return
    const app = applications.find((a) => a.id === draggedCard)
    if (app && app.status !== status) {
      updateApplication({ id: draggedCard, dto: { status } })
    }
    setDraggedCard(null)
  }, [draggedCard, applications, updateApplication])

  const handleOpenNotes = useCallback((app: Application) => {
    setSelectedApplication(app)
    setShowNotesModal(true)
  }, [])

  const handleCloseNotes = useCallback(() => {
    setShowNotesModal(false)
    setSelectedApplication(null)
  }, [])

  const handleSaveNotes = useCallback((notes: string) => {
    if (!selectedApplication) return
    updateApplication({ id: selectedApplication.id, dto: { notes } })
    setShowNotesModal(false)
    setSelectedApplication(null)
  }, [selectedApplication, updateApplication])

  const handleDeleteApplication = useCallback((appId: string) => {
    deleteApplication(appId)
  }, [deleteApplication])

  const handleCardClick = useCallback((jobId: string) => {
    navigate(`/job/${jobId}`)
  }, [navigate])

  return {
    applicationsByStatus,
    loading,
    error,
    selectedApplication,
    showNotesModal,
    draggedCard,
    totalCount: applications.length,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleOpenNotes,
    handleCloseNotes,
    handleSaveNotes,
    handleDeleteApplication,
    handleCardClick,
  }
}
