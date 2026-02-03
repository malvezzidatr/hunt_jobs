import { ZevCarousel, ZevCarouselItem, ZevButton, ZevLoader } from '@malvezzidatr/zev-react'
import { useFeaturedJobs } from './useFeaturedJobs'
import type { FeaturedJobsProps, FeaturedJobCard } from './FeaturedJobs.types'

// Componente puro de decoração (sem lógica)
function WaveDecoration({ color }: { color: string }) {
  return (
    <svg
      className="banner-wave"
      viewBox="0 0 500 500"
      preserveAspectRatio="none"
    >
      <path
        d="M0,100 C150,200 350,0 500,100 L500,500 L0,500 Z"
        fill={color}
        opacity="0.3"
      />
      <path
        d="M0,200 C100,100 400,300 500,200 L500,500 L0,500 Z"
        fill={color}
        opacity="0.2"
      />
      <circle cx="400" cy="80" r="60" fill={color} opacity="0.15" />
      <circle cx="450" cy="150" r="40" fill={color} opacity="0.1" />
    </svg>
  )
}

// Componente de slide individual (puro)
interface JobSlideProps {
  job: FeaturedJobCard
  onJobClick: (jobId: string) => void
}

function JobSlide({ job, onJobClick }: JobSlideProps) {
  const [primary, secondary, accent] = job.colors

  const handleClick = () => onJobClick(job.id)

  const bannerClass = job.isLightBg ? 'promo-banner promo-banner--light' : 'promo-banner'

  return (
    <ZevCarouselItem>
      <div
        onClick={handleClick}
        className={bannerClass}
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
      >
        <WaveDecoration color={accent} />

        <div className="promo-banner-content">
          <img
            className='promo-banner-content-logo'
            src={job.logoUrl}
            alt={job.company}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="promo-banner-left">
            <div className="promo-banner-badge">
              {job.badgeText}
            </div>

            <h2 className="promo-banner-title">{job.title}</h2>

            <p className="promo-banner-subtitle">
              {job.subtitle}
            </p>

            <div className="promo-banner-cta">
              <ZevButton size="lg" variant={'outline-light'} onButtonClick={handleClick}>
                Ver detalhes
              </ZevButton>
            </div>
          </div>
        </div>
      </div>
    </ZevCarouselItem>
  )
}

// Skeleton loading state
function LoadingState() {
  return (
    <div className="featured-jobs featured-jobs--banner">
      <div className="promo-banner promo-banner--skeleton" />
      <div className="promo-banner--skeleton---pages">
        <div><ZevLoader size="sm" /></div>
        <div><ZevLoader size="sm" /></div>
        <div><ZevLoader size="sm" /></div>
        <div><ZevLoader size="sm" /></div>
      </div>
    </div>
  )
}

// View principal - só conhece o Hook
export function FeaturedJobs({ limit = 10 }: FeaturedJobsProps) {
  const vm = useFeaturedJobs(limit)

  if (vm.isLoading) {
    return <LoadingState />
  }

  if (vm.hasError || vm.isEmpty) {
    return null
  }

  return (
    <div className="featured-jobs featured-jobs--banner">
      <ZevCarousel
        slidesPerView={1}
        loop
        autoplay
        autoplayInterval={5000}
      >
        {vm.jobs.map(job => (
          <JobSlide
            key={job.id}
            job={job}
            onJobClick={vm.onJobClick}
          />
        ))}
      </ZevCarousel>
    </div>
  )
}
