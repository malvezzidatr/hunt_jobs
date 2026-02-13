import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { AuthContextValue, User } from '../types/auth.types'
import { getMe } from '../services/authApi'

const AUTH_TOKEN_KEY = 'huntjobs_auth_token'
const API_URL = import.meta.env.VITE_API_URL || '/api'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY)
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(!!token)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  }, [token])

  // Listen for 401 events from fetchAPI
  useEffect(() => {
    const handler = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [])

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API_URL}/auth/google`
  }, [])

  const loginWithGitHub = useCallback(() => {
    window.location.href = `${API_URL}/auth/github`
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const handleAuthCallback = useCallback((newToken: string) => {
    setToken(newToken)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      loginWithGoogle,
      loginWithGitHub,
      logout,
      handleAuthCallback,
    }),
    [user, token, isLoading, loginWithGoogle, loginWithGitHub, logout, handleAuthCallback],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
