import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { JobsQuery, JobsResponse } from '../types/job.types';
import { getJobs, getJob, getSources, getTags, getStats, getFeaturedJobs } from '../services/jobsApi';

// Query keys para cache
export const queryKeys = {
  jobs: (query: JobsQuery) => ['jobs', query] as const,
  job: (id: string) => ['job', id] as const,
  sources: ['sources'] as const,
  tags: ['tags'] as const,
  stats: ['stats'] as const,
  featured: ['featured'] as const,
};

export function useJobs(initialQuery: JobsQuery = {}) {
  const [query, setQuery] = useState<JobsQuery>(initialQuery);
  const queryClient = useQueryClient();

  const { data: jobs, isLoading: loading, isFetching, error: queryError } = useQuery({
    queryKey: queryKeys.jobs(query),
    queryFn: () => getJobs(query),
    placeholderData: (previousData: JobsResponse | undefined, previousQuery) => {
      if (!previousData || !previousQuery) return undefined;
      // Não mostrar dados anteriores quando sort ou techs mudaram
      // (evita flash de dados na ordem errada ao trocar para sort=match)
      const prevQ = (previousQuery.queryKey as readonly ['jobs', JobsQuery])[1];
      if (prevQ?.sort !== query.sort || prevQ?.techs !== query.techs) return undefined;
      return previousData;
    },
  });

  const error = queryError instanceof Error ? queryError.message : queryError ? 'Erro ao carregar vagas' : null;

  const updateQuery = useCallback((newQuery: Partial<JobsQuery>) => {
    setQuery(prev => ({ ...prev, ...newQuery, page: newQuery.page ?? 1 }));
  }, []);

  // Substitui completamente a query (não faz merge)
  const replaceQuery = useCallback((newQuery: JobsQuery) => {
    setQuery(newQuery);
  }, []);

  const nextPage = useCallback(() => {
    if (jobs && jobs.meta.page < jobs.meta.totalPages) {
      setQuery(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [jobs]);

  const prevPage = useCallback(() => {
    if (jobs && jobs.meta.page > 1) {
      setQuery(prev => ({ ...prev, page: (prev.page || 1) - 1 }));
    }
  }, [jobs]);

  const goToPage = useCallback((page: number) => {
    setQuery(prev => ({ ...prev, page }));
  }, []);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs(query) });
  }, [queryClient, query]);

  return {
    jobs: jobs ?? null,
    loading,
    fetching: isFetching,
    error,
    query,
    updateQuery,
    replaceQuery,
    nextPage,
    prevPage,
    goToPage,
    refetch,
  };
}

export function useSources() {
  const { data: sources = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.sources,
    queryFn: getSources,
    staleTime: 30 * 60 * 1000, // 30 minutos - dados raramente mudam
  });

  return { sources, loading };
}

export function useTags() {
  const { data: tags = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.tags,
    queryFn: getTags,
    staleTime: 30 * 60 * 1000, // 30 minutos - dados raramente mudam
  });

  return { tags, loading };
}

export function useStats() {
  const { data: stats = null, isLoading: loading } = useQuery({
    queryKey: queryKeys.stats,
    queryFn: getStats,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return { stats, loading };
}

export function useJob(id: string) {
  const { data: job = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => getJob(id),
    enabled: !!id, // Só executa se tiver ID
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const error = queryError instanceof Error ? queryError.message : queryError ? 'Erro ao carregar vaga' : null;

  return { job, loading, error };
}

export function useFeaturedJobs(limit: number = 10) {
  const { data: jobs = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: queryKeys.featured,
    queryFn: () => getFeaturedJobs(limit),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  const error = queryError instanceof Error ? queryError.message : queryError ? 'Erro ao carregar vagas em destaque' : null;

  return { jobs, loading, error };
}
