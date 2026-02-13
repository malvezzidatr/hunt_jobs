import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ZevLoader } from '@malvezzidatr/zev-react'
import { useAuth } from '../../features/auth'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleAuthCallback } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      handleAuthCallback(token)
      navigate('/', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [searchParams, handleAuthCallback, navigate])

  return (
    <div className="container" style={{ marginTop: 120, textAlign: 'center' }}>
      <ZevLoader size="lg" />
      <p style={{ marginTop: 16, color: 'var(--zev-color-text-secondary)' }}>
        Autenticando...
      </p>
    </div>
  )
}
