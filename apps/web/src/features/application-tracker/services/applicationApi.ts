import { fetchAPI } from '../../../shared/services/api'
import type {
  Application,
  ApplicationsResponse,
  CreateApplicationDto,
  UpdateApplicationDto,
} from '../types/application.types'

export async function getApplications(): Promise<ApplicationsResponse> {
  return fetchAPI<ApplicationsResponse>('/applications')
}

export async function createApplicationApi(dto: CreateApplicationDto): Promise<Application> {
  return fetchAPI<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function updateApplicationApi(
  id: string,
  dto: UpdateApplicationDto,
): Promise<Application> {
  return fetchAPI<Application>(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  })
}

export async function deleteApplicationApi(id: string): Promise<void> {
  await fetchAPI<{ message: string }>(`/applications/${id}`, {
    method: 'DELETE',
  })
}
