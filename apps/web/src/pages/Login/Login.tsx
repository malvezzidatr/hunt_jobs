import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ZevSectionHeader, ZevButton } from '@malvezzidatr/zev-react'
import { useAuth } from '../../features/auth'

export default function Login() {
  const { isAuthenticated, isLoading, loginWithGoogle, loginWithGitHub } =
    useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/')
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div className="container">
      <div className="login-page">
        <ZevSectionHeader
          tag="[ENTRAR]"
          title="Acesse sua conta"
          size="medium"
        />
        <p className="login-description">
          Faca login para salvar seu perfil de tecnologias e acompanhar
          candidaturas.
        </p>
        <div className="login-buttons">
          <ZevButton variant="primary" onButtonClick={loginWithGoogle}>
            Entrar com Google
          </ZevButton>
          <ZevButton variant="secondary" onButtonClick={loginWithGitHub}>
            Entrar com GitHub
          </ZevButton>
        </div>
        <p className="login-note">
          Todas as funcionalidades de busca e visualizacao de vagas continuam
          acessiveis sem login.
        </p>
      </div>
    </div>
  )
}
