export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  provider: 'google' | 'github'
  createdAt: string
}

export interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithGoogle: () => void
  loginWithGitHub: () => void
  logout: () => void
  handleAuthCallback: (token: string) => void
}
