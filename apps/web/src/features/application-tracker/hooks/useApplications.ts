import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getApplications,
  createApplicationApi,
  updateApplicationApi,
  deleteApplicationApi,
} from '../services/applicationApi'
import type { CreateApplicationDto, UpdateApplicationDto } from '../types/application.types'

const APPLICATIONS_KEY = ['applications'] as const

export function useApplications() {
  const queryClient = useQueryClient()

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: APPLICATIONS_KEY,
    queryFn: getApplications,
    staleTime: 30 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateApplicationDto) => createApplicationApi(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateApplicationDto }) =>
      updateApplicationApi(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApplicationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY })
    },
  })

  const error = queryError instanceof Error
    ? queryError.message
    : queryError ? 'Erro ao carregar candidaturas' : null

  return {
    applications: data?.data ?? [],
    loading: isLoading,
    error,
    createApplication: createMutation.mutate,
    updateApplication: updateMutation.mutate,
    deleteApplication: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  }
}
