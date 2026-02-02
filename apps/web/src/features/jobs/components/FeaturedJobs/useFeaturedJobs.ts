import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFeaturedJobs as useFeaturedJobsQuery } from '../../hooks/useJobs'
import { getCompanyColors, getCompanyLogo, isLightColor } from './utils/companyBranding'
import { buildBadgeText, buildSubtitle } from './utils/jobFormatters'
import type { FeaturedJobsState, FeaturedJobsActions, FeaturedJobCard } from './FeaturedJobs.types'

export function useFeaturedJobs(limit: number): FeaturedJobsState & FeaturedJobsActions {
  const navigate = useNavigate()
  const { jobs: rawJobs, loading, error } = useFeaturedJobsQuery(limit)

  const onJobClick = useCallback((jobId: string) => {
    navigate(`/job/${jobId}`)
  }, [navigate])

  // Transforma dados da API para formato da View
  const jobs: FeaturedJobCard[] = rawJobs.map(job => {
    const colors = getCompanyColors(job.company)
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      colors,
      logoUrl: getCompanyLogo(job.company),
      badgeText: buildBadgeText(job.remote, job.level),
      subtitle: buildSubtitle(job.company, job.level, job.location),
      isLightBg: isLightColor(colors[0]),
    }
  })

  return {
    // State
    jobs,
    isLoading: loading,
    isEmpty: jobs.length === 0,
    hasError: !!error,
    // Actions
    onJobClick,
  }
}
