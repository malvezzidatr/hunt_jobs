import type { Job } from '../../jobs/types/job.types'

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'TECHNICAL_TEST'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export interface Application {
  id: string
  userId: string
  jobId: string
  status: ApplicationStatus
  notes: string | null
  appliedAt: string | null
  createdAt: string
  updatedAt: string
  job: Job
}

export interface ApplicationsResponse {
  data: Application[]
}

export interface CreateApplicationDto {
  jobId: string
  status?: ApplicationStatus
  notes?: string
}

export interface UpdateApplicationDto {
  status?: ApplicationStatus
  notes?: string
}
