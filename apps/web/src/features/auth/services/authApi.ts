import type { User } from '../types/auth.types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function getMe(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Auth error: ${response.status}`)
  }

  return response.json()
}
