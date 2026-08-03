import { create } from 'zustand'

import { decodeJwt } from '@/shared/lib/decodeJwt'

const REFRESH_TOKEN_KEY = 'refreshToken'
const REFRESH_EXPIRES_KEY = 'refreshTokenExpiresAt'

export interface AuthUser {
  userId: string
  email: string
}

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  setTokens: (accessToken: string, refreshToken: string, refreshTokenExpiresAt: number) => void
  clearAuth: () => void
  getStoredRefresh: () => { refreshToken: string | null; refreshTokenExpiresAt: number | null }
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,

  setTokens: (accessToken, refreshToken, refreshTokenExpiresAt) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(REFRESH_EXPIRES_KEY, String(refreshTokenExpiresAt))
    const payload = decodeJwt(accessToken)
    const user =
      payload.userId && payload.email ? { userId: payload.userId, email: payload.email } : null
    set({ accessToken, user })
  },

  clearAuth: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_EXPIRES_KEY)
    set({ accessToken: null, user: null })
  },

  getStoredRefresh: () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const raw = localStorage.getItem(REFRESH_EXPIRES_KEY)
    const refreshTokenExpiresAt = raw !== null ? Number(raw) : null
    return { refreshToken, refreshTokenExpiresAt }
  },
}))
