export interface OAuthProfile {
  provider: 'google' | 'github'
  providerId: string
  email: string
  name: string | null
  avatar: string | null
}

export interface JwtPayload {
  sub: string
  email: string
  name: string | null
  iat?: number
  exp?: number
}

export interface AuthenticatedUser {
  id: string
  email: string
  name: string | null
}
