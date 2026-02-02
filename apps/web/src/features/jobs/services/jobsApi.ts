import { fetchAPI } from '../../../shared/services/api';
import type { JobsResponse, JobsQuery, Job, JobStats, Source, Tag } from '../types/job.types';

export async function getJobs(query: JobsQuery = {}): Promise<JobsResponse> {
  const params = new URLSearchParams();

  if (query.search) params.set('search', query.search);
  if (query.level) params.set('level', query.level);
  if (query.type) params.set('type', query.type);
  if (query.remote !== undefined) params.set('remote', String(query.remote));
  if (query.source) params.set('source', query.source);
  if (query.tags) params.set('tags', query.tags);
  if (query.ids) params.set('ids', query.ids);
  if (query.period) params.set('period', query.period);
  if (query.sort) params.set('sort', query.sort);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));

  const queryString = params.toString();
  return fetchAPI<JobsResponse>(`/jobs${queryString ? `?${queryString}` : ''}`);
}

export async function getJob(id: string): Promise<Job> {
  return fetchAPI<Job>(`/jobs/${id}`);
}

export async function getStats(): Promise<JobStats> {
  return fetchAPI<JobStats>('/jobs/stats');
}

export async function getSources(): Promise<Source[]> {
  return fetchAPI<Source[]>('/jobs/sources');
}

export async function getTags(): Promise<Tag[]> {
  return fetchAPI<Tag[]>('/jobs/tags');
}

export async function syncJobs(): Promise<{ message: string; results: unknown[] }> {
  return fetchAPI('/jobs/sync', { method: 'POST' });
}

export async function getFeaturedJobs(limit: number = 10): Promise<Job[]> {
  return fetchAPI<Job[]>(`/jobs/featured?limit=${limit}`);
}
